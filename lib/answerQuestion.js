// Rule-based Q&A over a property's data — no LLM, no API, no cost.
// Maps Hebrew keywords in the question to the relevant field(s) and answers
// from the house data, or says it doesn't have the info.

const AGENT_FALLBACK =
  "אין לי את המידע הזה. מומלץ לפנות לסוכן רגבים לפרטים נוספים.";

// Feature questions: keyword(s) → which feature text to look for + a label.
const FEATURE_QUERIES = [
  { kw: ["חניה", "חנייה", "חניות", "חנייה", "פארקינג"], sub: "חני", label: "חניה" },
  { kw: ["מעלית"], sub: "מעלית", label: "מעלית" },
  { kw: ["מרפסת", "מרפסות"], sub: "מרפסת", label: "מרפסת" },
  { kw: ['ממ"ד', "ממד", "מרחב מוגן", "מקלט"], sub: "ממ", label: 'ממ"ד' },
  { kw: ["מחסן"], sub: "מחסן", label: "מחסן" },
  { kw: ["מיזוג", "מזגן", "מיזוג מרכזי"], sub: "מיזוג", label: "מיזוג אוויר" },
  { kw: ["בריכה"], sub: "בריכה", label: "בריכה" },
  { kw: ["גינה", "חצר"], sub: "גינ", label: "גינה" },
  { kw: ["נוף", "ים", "מפרץ"], sub: "נוף", label: "נוף" },
  { kw: ["משופצת", "שיפוץ", "משופץ", "מצב הדירה"], sub: "משופצת", label: "שיפוץ" },
];

const has = (q, ...words) => words.some((w) => q.includes(w));
const findFeature = (property, sub) =>
  (property.features || []).find((f) => f.includes(sub)) || null;

export function answerQuestion(property, rawQuestion) {
  if (!property) return AGENT_FALLBACK;
  const q = String(rawQuestion || "").trim();
  if (!q) return AGENT_FALLBACK;

  // Specific room types before the generic "rooms" rule
  if (has(q, "שינה")) return `יש בנכס ${property.beds}.`;
  if (has(q, "רחצה", "אמבטיה", "מקלחת", "שירותים"))
    return `יש בנכס ${property.baths}.`;
  if (has(q, "חדר")) return `בנכס יש ${property.rooms}.`;

  if (has(q, "שטח", 'מ"ר', "מטר", "גודל", "כמה גדול"))
    return `שטח הנכס הוא ${property.size}.`;

  if (has(q, "קומה", "קומות")) return `מדובר ב${property.floor}.`;

  // Feature questions ("is there parking?") — yes with the matched feature, or no
  for (const fq of FEATURE_QUERIES) {
    if (has(q, ...fq.kw)) {
      const f = findFeature(property, fq.sub);
      return f ? `כן — ${f}.` : `לפי המידע שברשותי, אין ${fq.label} בנכס.`;
    }
  }

  if (has(q, "מה יש", "מאפיינ", "כולל", "תכונות", "מה כולל"))
    return `הנכס כולל: ${(property.features || []).join(", ")}.`;

  if (has(q, "שכונה", "סביבה", "שכונת"))
    return `הנכס ממוקם בשכונת ${property.hood} ב${property.city}.`;

  if (has(q, "כתובת", "איפה", "מיקום", "ממוקם", "רחוב", "אזור", "עיר"))
    return `הנכס ממוקם בכתובת ${property.address} (שכונת ${property.hood}, ${property.city}).`;

  if (has(q, "מחיר", "עולה", "שקל", "₪", "תקציב", "כמה זה", "כמה עולה"))
    return `מחיר הנכס: ${property.price} (${property.perMeter}).`;

  if (has(q, "תיאור", "ספר", "תספר", "פרטים", "עוד על", "מידע על"))
    return property.longDesc;

  // Things we genuinely don't have data for → point to the agent
  if (has(q, "מתי", "כניסה", "פנוי", "זמין", "מאוכלס", "כניסה מיידית"))
    return AGENT_FALLBACK;
  if (has(q, "גמיש", "הנחה", "מיקוח", "להוריד", "לרדת במחיר"))
    return AGENT_FALLBACK;

  if (has(q, "שלום", "היי", "הי ", "בוקר טוב", "ערב טוב"))
    return "שלום! אפשר לשאול אותי על מחיר, חדרים, שטח, קומה, מיקום, שכונה ומאפייני הנכס.";

  return (
    "אין לי את המידע הזה לגבי הנכס. אפשר לשאול על מחיר, חדרים, שטח, קומה, " +
    "מיקום, שכונה או מאפיינים — או לפנות לסוכן רגבים לפרטים נוספים."
  );
}
