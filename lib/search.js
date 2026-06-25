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

function matchPrice(text) {
  const num = "([\\d][\\d.,]*)";
  const unit = "\\s*(מיליון|million|m|k|אלף|thousand)?";
  const res = [
    new RegExp("(?:up to|under|below|max(?:imum)?|no more than|עד|מתחת ל-?|פחות מ-?|מקסימום)\\s*₪?\\s*" + num + unit, "i"),
    new RegExp("₪\\s*" + num + unit, "i"),
    new RegExp(num + unit + "\\s*(?:₪|nis|ils|ש\"ח|שח|שקלים|שקל)", "i"),
  ];
  for (const re of res) {
    const m = text.match(re);
    if (m) {
      const value = Math.round(parseFloat(m[1].replace(/,/g, "")) * unitMul(m[2]));
      if (!Number.isNaN(value) && value > 0) return { value, matched: m[0] };
    }
  }
  return null;
}

function matchRooms(text) {
  let m = text.match(/(\d+(?:\.\d+)?)\s*(bed\w*|חדר\w*|חד'|rooms?)/i);
  if (m) return { n: parseFloat(m[1]), kind: /bed/i.test(m[2]) ? "bed" : "room", matched: m[0] };
  m = text.match(/(bed\w*|חדר\w*|rooms?)\s*(\d+(?:\.\d+)?)/i);
  if (m) return { n: parseFloat(m[2]), kind: /bed/i.test(m[1]) ? "bed" : "room", matched: m[0] };
  return null;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const numFrom = (s) => {
  const m = String(s).match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

export function parseQuery(text) {
  let rest = " " + String(text || "").toLowerCase() + " ";
  const c = { rooms: null, roomsKind: null, city: null, maxPrice: null, features: [], terms: [] };

  const price = matchPrice(rest);
  if (price) {
    c.maxPrice = price.value;
    rest = rest.replace(price.matched.toLowerCase(), " ");
  }

  const rooms = matchRooms(rest);
  if (rooms) {
    c.rooms = rooms.n;
    c.roomsKind = rooms.kind;
    rest = rest.replace(rooms.matched.toLowerCase(), " ");
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
      if (!c.features.includes(fr)) c.features.push(fr);
      for (const kw of fr.kw) rest = rest.replace(new RegExp(escapeRe(kw.toLowerCase()), "g"), " ");
    }
  }

  c.terms = rest
    .split(/[\s,.;:!?()'"₪\-]+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w) && !/^\d/.test(w));

  return c;
}

export function matchesQuery(p, c) {
  if (c.rooms != null) {
    const r = numFrom(p.rooms);
    const b = numFrom(p.beds);
    const ok = c.roomsKind === "bed" ? b === c.rooms : r === c.rooms;
    if (!ok) return false;
  }
  if (c.city && p.city !== c.city) return false;
  if (c.maxPrice != null) {
    const pv = parseInt(String(p.price).replace(/[^\d]/g, ""), 10);
    if (!(pv <= c.maxPrice)) return false;
  }
  for (const fr of c.features) if (!fr.test(p)) return false;
  if (c.terms.length) {
    const hay = [p.address, p.city, p.hood, p.tag, p.rooms, p.propertyType, ...(p.features || [])]
      .join(" ")
      .toLowerCase();
    for (const t of c.terms) if (!hay.includes(t)) return false;
  }
  return true;
}

const isEmpty = (c) =>
  c.rooms == null && !c.city && c.maxPrice == null && c.features.length === 0 && c.terms.length === 0;

export function searchProperties(text, list = properties) {
  const c = parseQuery(text);
  if (isEmpty(c)) return list;
  return list.filter((p) => matchesQuery(p, c));
}

// Human-readable chips describing what was understood, for UI feedback.
export function summarizeQuery(text) {
  const c = parseQuery(text);
  const chips = [];
  if (c.city) chips.push(c.city);
  if (c.rooms != null) chips.push(`${c.rooms} ${c.roomsKind === "bed" ? "חדרי שינה" : "חדרים"}`);
  if (c.maxPrice != null) chips.push(`עד ₪${c.maxPrice.toLocaleString("en-US")}`);
  for (const fr of c.features) chips.push(fr.label);
  for (const t of c.terms) chips.push(`"${t}"`);
  return chips;
}
