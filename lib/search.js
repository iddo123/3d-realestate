// Free-text natural-language search over the property list.
// Parses constraints (rooms, city, max price, features) out of a sentence like
// "I'm looking for a 3 bedroom apartment in tel aviv up to 3.5M with parking",
// then filters. No LLM, no API — runs in the browser.
import { properties } from "./properties";

const CITIES = [
  { he: "תל אביב", aliases: ["תל אביב", "תל-אביב", 'ת"א', "tel aviv", "tel-aviv", "tlv"] },
  { he: "ירושלים", aliases: ["ירושלים", "jerusalem"] },
  { he: "חיפה", aliases: ["חיפה", "haifa"] },
  { he: "רמת גן", aliases: ["רמת גן", "רמת-גן", "ramat gan", "ramat-gan"] },
  { he: "הרצליה", aliases: ["הרצליה", "herzliya", "herzlia"] },
  { he: "רעננה", aliases: ["רעננה", "raanana", "ra'anana"] },
  { he: "גבעתיים", aliases: ["גבעתיים", "givatayim"] },
  { he: "באר שבע", aliases: ["באר שבע", "באר-שבע", "beer sheva", "beersheba"] },
];

const hasFeat = (p, sub) => (p.features || []).some((f) => f.includes(sub));

const FEATURE_RULES = [
  { label: "חניה", kw: ["parking", "חניה", "חנייה", "חניות", "park"], test: (p) => p.parkingSpots > 0 },
  { label: "מעלית", kw: ["elevator", "מעלית"], test: (p) => !!p.elevator },
  { label: "מחסן", kw: ["storage", "מחסן"], test: (p) => !!p.storage },
  { label: 'ממ"ד', kw: ['ממ"ד', "ממד", "safe room", "shelter", "מרחב מוגן"], test: (p) => !!p.safeRoom },
  { label: "מרפסת", kw: ["balcony", "מרפסת"], test: (p) => !!p.balcony },
  { label: "בריכה", kw: ["pool", "בריכה"], test: (p) => hasFeat(p, "בריכה") },
  { label: "גינה", kw: ["garden", "yard", "גינה", "חצר"], test: (p) => hasFeat(p, "גינ") },
  { label: "נוף", kw: ["sea view", "נוף לים", "view", "נוף", "מפרץ"], test: (p) => hasFeat(p, "נוף") },
  { label: "מיזוג", kw: ["air condition", "מיזוג", "מזגן", " ac "], test: (p) => hasFeat(p, "מיזוג") },
  { label: "משופצת", kw: ["renovated", "משופצת", "משופץ"], test: (p) => hasFeat(p, "משופצת") },
];

const STOPWORDS = new Set([
  // English
  "i", "a", "an", "the", "am", "is", "are", "looking", "look", "for", "in", "on",
  "at", "of", "with", "and", "or", "also", "need", "needs", "want", "wants",
  "would", "like", "prefer", "require", "must", "please", "me", "my", "we",
  "search", "find", "get", "to", "up", "no", "more", "than", "slot", "space",
  "apartment", "flat", "house", "home", "property", "unit", "place", "that",
  "this", "has", "have", "near", "around", "some", "private", "room", "rooms",
  "bedroom", "bedrooms", "bed", "nis", "ils", "shekel", "shekels",
  // Hebrew
  "אני", "מחפש", "מחפשת", "רוצה", "צריך", "צריכה", "מעוניין", "מעוניינת",
  "דירה", "דירת", "בית", "נכס", "עם", "של", "גם", "וגם", "או", "את", "עד",
  "מעל", "מחיר", "מקום", "באזור", "ליד", "בערך", "בבקשה", "פרטית", "פרטי",
  "שקל", "שקלים", "חדרים", "חדר", "חדרי", "שינה",
]);

const unitMul = (u) => {
  if (!u) return 1;
  u = u.toLowerCase().trim();
  if (u === "מיליון" || u === "million" || u === "m") return 1e6;
  if (u === "k" || u === "אלף" || u === "thousand") return 1e3;
  return 1;
};

// Tolerance band applied to an "about/around/בערך" price (±15%).
const ABOUT_TOL = 0.15;

function matchPrice(text) {
  const num = "([\\d][\\d.,]*)";
  const unit = "\\s*(מיליון|million|m|k|אלף|thousand)?";
  const aboutKw = "about|around|approx\\w*|roughly|circa|~|בערך|כ-?|סביב|באזור\\s*ה-?|באיזור\\s*ה-?|באזור|באיזור";
  const minKw = "over|above|at least|more than|from|starting(?: at| from)?|מעל|לפחות|יותר מ-?|החל מ-?";
  const maxKw = "up to|under|below|max(?:imum)?|no more than|עד|מתחת ל-?|פחות מ-?|מקסימום";
  // Order matters: approximate & floor modifiers are checked before the plain ceiling.
  const pats = [
    { kind: "about", re: new RegExp("(?:" + aboutKw + ")\\s*₪?\\s*" + num + unit, "i") },
    { kind: "min", re: new RegExp("(?:" + minKw + ")\\s*₪?\\s*" + num + unit, "i") },
    { kind: "max", re: new RegExp("(?:" + maxKw + ")\\s*₪?\\s*" + num + unit, "i") },
    { kind: "max", re: new RegExp("₪\\s*" + num + unit, "i") },
    { kind: "max", re: new RegExp(num + unit + "\\s*(?:₪|nis|ils|ש\"ח|שח|שקלים|שקל)", "i") },
  ];
  for (const { kind, re } of pats) {
    const m = text.match(re);
    if (!m) continue;
    const value = Math.round(parseFloat(m[1].replace(/,/g, "")) * unitMul(m[2]));
    if (Number.isNaN(value) || value <= 0) continue;
    if (kind === "about") {
      return { min: Math.round(value * (1 - ABOUT_TOL)), max: Math.round(value * (1 + ABOUT_TOL)), matched: m[0] };
    }
    if (kind === "min") return { min: value, max: null, matched: m[0] };
    return { min: null, max: value, matched: m[0] };
  }
  return null;
}

const ROOM_WORD = "bed\\w*|חדר\\w*|חד'|rooms?";
const kindOf = (word) => (/bed/i.test(word) ? "bed" : "room");

// Parse a room constraint into a { min, max } band (either side may be null).
// Order matters: ranges & open-ended modifiers are checked before a plain count,
// and rooms are matched *before* price so "עד 4 חדרים" isn't read as a ₪4 ceiling.
function matchRooms(text) {
  const num = "(\\d+(?:\\.\\d+)?)";
  const word = "(" + ROOM_WORD + ")";
  // "3 to 4 rooms" / "מ-3 עד 4 חדרים" / "3-4 rooms" → closed band.
  let m = text.match(
    new RegExp("(?:from\\s+|מ-?\\s*)?" + num + "\\s*(?:-|–|—|to|until|עד|ועד)\\s*" + num + "\\s*" + word, "i")
  );
  if (m) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    return { min: Math.min(a, b), max: Math.max(a, b), kind: kindOf(m[3]), matched: m[0] };
  }
  // "at least 3 rooms" / "לפחות 3 חדרים" / "3+ rooms" → floor only.
  m = text.match(new RegExp("(?:at least|min(?:imum)?|לפחות|מינימום)\\s*" + num + "\\s*" + word, "i"));
  if (m) return { min: parseFloat(m[1]), max: null, kind: kindOf(m[2]), matched: m[0] };
  m = text.match(new RegExp(num + "\\s*\\+\\s*" + word, "i"));
  if (m) return { min: parseFloat(m[1]), max: null, kind: kindOf(m[2]), matched: m[0] };
  // "up to 4 rooms" / "עד 4 חדרים" → ceiling only.
  m = text.match(new RegExp("(?:up to|at most|max(?:imum)?|עד|לכל היותר|מקסימום)\\s*" + num + "\\s*" + word, "i"));
  if (m) return { min: null, max: parseFloat(m[1]), kind: kindOf(m[2]), matched: m[0] };
  // Plain "3 rooms" → exact (min == max).
  m = text.match(new RegExp(num + "\\s*" + word, "i"));
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[1]), kind: kindOf(m[2]), matched: m[0] };
  m = text.match(new RegExp(word + "\\s*" + num, "i"));
  if (m) return { min: parseFloat(m[2]), max: parseFloat(m[2]), kind: kindOf(m[1]), matched: m[0] };
  return null;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const numFrom = (s) => {
  const m = String(s).match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

export function parseQuery(text) {
  let rest = " " + String(text || "").toLowerCase() + " ";
  const c = { minRooms: null, maxRooms: null, roomsKind: null, city: null, minPrice: null, maxPrice: null, features: [], terms: [] };

  // Rooms first: a room phrase like "עד 4 חדרים" shares keywords with price
  // ("עד" = up to), so consume it before the price parser sees the number.
  const rooms = matchRooms(rest);
  if (rooms) {
    c.minRooms = rooms.min;
    c.maxRooms = rooms.max;
    c.roomsKind = rooms.kind;
    rest = rest.replace(rooms.matched.toLowerCase(), " ");
  }

  const price = matchPrice(rest);
  if (price) {
    c.minPrice = price.min;
    c.maxPrice = price.max;
    rest = rest.replace(price.matched.toLowerCase(), " ");
  }

  for (const city of CITIES) {
    const a = city.aliases.find((al) => rest.includes(al.toLowerCase()));
    if (a) {
      c.city = city.he;
      rest = rest.replace(a.toLowerCase(), " ");
      break;
    }
  }

  for (const fr of FEATURE_RULES) {
    const hit = fr.kw.find((kw) => rest.includes(kw.toLowerCase()));
    if (hit) {
      if (!c.features.includes(fr.label)) c.features.push(fr.label);
      for (const kw of fr.kw) rest = rest.replace(new RegExp(escapeRe(kw.toLowerCase()), "g"), " ");
    }
  }

  c.terms = rest
    .split(/[\s,.;:!?()'"₪\-]+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w) && !/^\d/.test(w));

  return c;
}

// Constraints are plain & JSON-serializable: features is an array of labels.
const FEATURE_BY_LABEL = Object.fromEntries(FEATURE_RULES.map((r) => [r.label, r]));
export const FEATURE_LABELS = FEATURE_RULES.map((r) => r.label);
export const CITY_NAMES = CITIES.map((c) => c.he);

export function matchesQuery(p, c) {
  if (c.minRooms != null || c.maxRooms != null) {
    const v = c.roomsKind === "bed" ? numFrom(p.beds) : numFrom(p.rooms);
    if (v == null) return false;
    if (c.minRooms != null && !(v >= c.minRooms)) return false;
    if (c.maxRooms != null && !(v <= c.maxRooms)) return false;
  }
  if (c.city && p.city !== c.city) return false;
  if (c.minPrice != null || c.maxPrice != null) {
    const pv = parseInt(String(p.price).replace(/[^\d]/g, ""), 10);
    if (c.maxPrice != null && !(pv <= c.maxPrice)) return false;
    if (c.minPrice != null && !(pv >= c.minPrice)) return false;
  }
  for (const label of c.features || []) {
    const fr = FEATURE_BY_LABEL[label];
    if (fr && !fr.test(p)) return false;
  }
  if (c.terms && c.terms.length) {
    const hay = [p.address, p.city, p.hood, p.tag, p.rooms, p.propertyType, ...(p.features || [])]
      .join(" ")
      .toLowerCase();
    for (const t of c.terms) if (!hay.includes(t)) return false;
  }
  return true;
}

const isEmpty = (c) =>
  c.minRooms == null &&
  c.maxRooms == null &&
  !c.city &&
  c.minPrice == null &&
  c.maxPrice == null &&
  (c.features || []).length === 0 &&
  (c.terms || []).length === 0;

// Filter using already-parsed constraints (used by both the rule-based and LLM paths).
export function applyConstraints(c, list = properties) {
  if (!c || isEmpty(c)) return list;
  return list.filter((p) => matchesQuery(p, c));
}

export function searchProperties(text, list = properties) {
  return applyConstraints(parseQuery(text), list);
}

// Sanitize constraints coming from an LLM: clamp to known cities/features, coerce types.
const posNum = (v) => (typeof v === "number" && v > 0 ? v : null);

export function normalizeConstraints(raw) {
  const c = { minRooms: null, maxRooms: null, roomsKind: null, city: null, minPrice: null, maxPrice: null, features: [], terms: [] };
  if (!raw || typeof raw !== "object") return c;
  // roomsKind: the model often says "bedroom"/"bedrooms"/"חדרי שינה" instead of "bed".
  if (/^bed/i.test(raw.roomsKind) || raw.roomsKind === "חדרי שינה") c.roomsKind = "bed";
  else if (/^room/i.test(raw.roomsKind) || raw.roomsKind === "חדרים") c.roomsKind = "room";
  // Room band: accept min/max, plus a legacy single `rooms` (→ exact band).
  c.minRooms = posNum(raw.minRooms);
  c.maxRooms = posNum(raw.maxRooms);
  if (c.minRooms == null && c.maxRooms == null) {
    const single = posNum(raw.rooms);
    if (single != null) c.minRooms = c.maxRooms = single;
  }
  if (c.minRooms != null && c.maxRooms != null && c.minRooms > c.maxRooms) {
    [c.minRooms, c.maxRooms] = [c.maxRooms, c.minRooms];
  }
  if (CITY_NAMES.includes(raw.city)) c.city = raw.city;
  if (typeof raw.minPrice === "number" && raw.minPrice > 0) c.minPrice = Math.round(raw.minPrice);
  if (typeof raw.maxPrice === "number" && raw.maxPrice > 0) c.maxPrice = Math.round(raw.maxPrice);
  // Guard against an inverted band from the LLM (min above max).
  if (c.minPrice != null && c.maxPrice != null && c.minPrice > c.maxPrice) {
    [c.minPrice, c.maxPrice] = [c.maxPrice, c.minPrice];
  }
  if (Array.isArray(raw.features)) c.features = raw.features.filter((f) => FEATURE_BY_LABEL[f]);
  if (Array.isArray(raw.terms)) {
    c.terms = raw.terms.filter((t) => typeof t === "string" && t.trim()).map((t) => t.toLowerCase().trim());
  }
  return c;
}

function chipsFor(c) {
  const chips = [];
  if (c.city) chips.push(c.city);
  const roomNoun = c.roomsKind === "bed" ? "חדרי שינה" : "חדרים";
  if (c.minRooms != null && c.maxRooms != null) {
    chips.push(c.minRooms === c.maxRooms ? `${c.minRooms} ${roomNoun}` : `${c.minRooms}–${c.maxRooms} ${roomNoun}`);
  } else if (c.maxRooms != null) chips.push(`עד ${c.maxRooms} ${roomNoun}`);
  else if (c.minRooms != null) chips.push(`${c.minRooms}+ ${roomNoun}`);
  const nis = (n) => `₪${n.toLocaleString("en-US")}`;
  if (c.minPrice != null && c.maxPrice != null) chips.push(`${nis(c.minPrice)}–${nis(c.maxPrice)}`);
  else if (c.maxPrice != null) chips.push(`עד ${nis(c.maxPrice)}`);
  else if (c.minPrice != null) chips.push(`מעל ${nis(c.minPrice)}`);
  for (const label of c.features || []) chips.push(label);
  for (const t of c.terms || []) chips.push(`"${t}"`);
  return chips;
}

// Human-readable chips describing what was understood, for UI feedback.
export const summarizeConstraints = chipsFor;
export function summarizeQuery(text) {
  return chipsFor(parseQuery(text));
}
