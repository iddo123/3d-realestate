// Rule-based Q&A over a property's data — no LLM, no API, no cost.
// Used as the fallback when ANTHROPIC_API_KEY isn't set (or the API errors).
// Maps Hebrew keywords in the question to the relevant field(s).

const FALLBACK =
  "אין לי את המידע הזה לגבי הנכס. אפשר לשאול על מחיר, חדרים, שטח, קומה, מיקום, שכונה, " +
  "שנת בנייה, ארנונה, ועד בית, תאריך כניסה, חניה, ריהוט ומאפיינים — או לפנות לסוכן רגבים.";

// Feature questions answered from the `features` array (things without a dedicated field).
const FEATURE_QUERIES = [
  { kw: ["מיזוג", "מזגן"], sub: "מיזוג", label: "מיזוג אוויר" },
  { kw: ["בריכה"], sub: "בריכה", label: "בריכה" },
  { kw: ["גינה", "חצר"], sub: "גינ", label: "גינה" },
  { kw: ["נוף", "מפרץ"], sub: "נוף", label: "נוף" },
  { kw: ["משופצת", "שיפוץ", "משופץ"], sub: "משופצת", label: "שיפוץ" },
];

const has = (q, ...words) => words.some((w) => q.includes(w));
const findFeature = (property, sub) =>
  (property.features || []).find((f) => f.includes(sub)) || null;

export function answerQuestion(property, rawQuestion) {
  if (!property) return FALLBACK;
  const q = String(rawQuestion || "").trim();
  if (!q) return FALLBACK;

  // --- rooms / size ---
  if (has(q, "שינה")) return `יש בנכס ${property.beds}.`;
  if (has(q, "רחצה", "אמבטיה", "מקלחת", "שירותים"))
    return `יש בנכס ${property.baths}.`;
  if (has(q, "חדר")) return `בנכס יש ${property.rooms}.`;
  if (has(q, "שטח", 'מ"ר', "מטר", "גודל", "כמה גדול"))
    return `שטח הנכס הוא ${property.size}.`;

  // --- year built ---
  if (has(q, "שנה", "נבנה", "בנייה", "בנתה", "ישן", "חדשה", "בנוי"))
    return `הנכס נבנה בשנת ${property.yearBuilt}.`;

  if (has(q, "קומה", "קומות")) return `מדובר ב${property.floor}.`;

  // --- parking (count-aware) ---
  if (has(q, "חני", "חנייה", "חניות", "פארקינג"))
    return property.parkingSpots > 0
      ? `כן — בנכס ${property.parkingSpots} ${property.parkingSpots === 1 ? "חניה" : "חניות"}.`
      : "לפי המידע שברשותי, אין חניה בנכס.";

  // --- explicit yes/no facilities ---
  if (has(q, "מעלית"))
    return property.elevator
      ? "כן, יש מעלית בבניין."
      : "לפי המידע שברשותי, אין מעלית בבניין.";
  if (has(q, "מחסן"))
    return property.storage ? "כן, יש מחסן." : "לפי המידע שברשותי, אין מחסן.";
  if (has(q, 'ממ"ד', "ממד", "מרחב מוגן", "מקלט"))
    return property.safeRoom ? 'כן, יש ממ"ד.' : 'לפי המידע שברשותי, אין ממ"ד.';
  if (has(q, "מרפסת", "מרפסות"))
    return property.balcony
      ? `כן — ${property.balcony}.`
      : "לפי המידע שברשותי, אין מרפסת.";

  // --- other features from the list ---
  for (const fq of FEATURE_QUERIES) {
    if (has(q, ...fq.kw)) {
      const f = findFeature(property, fq.sub);
      return f ? `כן — ${f}.` : `לפי המידע שברשותי, אין ${fq.label} בנכס.`;
    }
  }
  if (has(q, "מה יש", "מאפיינ", "כולל", "תכונות", "מה כולל"))
    return `הנכס כולל: ${(property.features || []).join(", ")}.`;

  // --- costs ---
  if (has(q, "ארנונה")) return `הארנונה לנכס: ${property.arnona}.`;
  if (has(q, "ועד")) return `דמי ועד הבית: ${property.vaad}.`;

  // --- other structured fields ---
  if (has(q, "ריהוט", "מרוהט", "מרוהטת")) return `${property.furnished}.`;
  if (has(q, "כיוון", "כיוונים", "אוויר")) return `${property.airDirections}.`;
  if (has(q, "מתי", "כניסה", "פנוי", "זמין", "להיכנס", "מאוכלס"))
    return `תאריך כניסה: ${property.entryDate}.`;
  if (has(q, "נגיש", "נגישות"))
    return property.accessible
      ? "הנכס נגיש."
      : "הנכס אינו מוגדר כנגיש (ללא מעלית).";
  if (has(q, "חיות", "כלב", "חתול", "בעלי חיים"))
    return property.petsAllowed
      ? "כן, ניתן להחזיק חיות מחמד."
      : "לא צוין שניתן להחזיק חיות מחמד.";
  if (has(q, "סוג", "פנטהאוז", "בית פרטי", "דירת גן", "דירת גג"))
    return `סוג הנכס: ${property.propertyType}.`;
  if (has(q, "מצב")) return `מצב הנכס: ${property.condition}.`;

  // --- price flexibility (before the generic price rule, which matches "מחיר") ---
  if (has(q, "גמיש", "הנחה", "מיקוח", "להוריד", "לרדת"))
    return property.negotiable
      ? "ייתכנה גמישות מסוימת במחיר — מומלץ לבדוק מול סוכן רגבים."
      : "לפי המידע שברשותי המחיר אינו מצוין כגמיש, אך תמיד אפשר לבדוק מול סוכן רגבים.";

  // --- location ---
  if (has(q, "שכונה", "סביבה", "שכונת"))
    return `הנכס ממוקם בשכונת ${property.hood} ב${property.city}.`;
  if (has(q, "כתובת", "איפה", "מיקום", "ממוקם", "רחוב", "אזור", "עיר"))
    return `הנכס ממוקם בכתובת ${property.address} (שכונת ${property.hood}, ${property.city}).`;

  // --- price / deal type ---
  if (has(q, "מחיר", "עולה", "שקל", "₪", "תקציב", "כמה זה", "כמה עולה"))
    return `מחיר הנכס: ${property.price} (${property.perMeter}).`;
  if (has(q, "למכירה", "להשכרה", "השכרה", "מכירה"))
    return `הנכס ${property.listingType}.`;

  // --- description ---
  if (has(q, "תיאור", "ספר", "תספר", "פרטים", "עוד על", "מידע על"))
    return property.longDesc;

  if (has(q, "שלום", "היי", "הי ", "בוקר טוב", "ערב טוב"))
    return "שלום! אפשר לשאול אותי על מחיר, חדרים, שטח, קומה, מיקום, שכונה, שנת בנייה, ארנונה, ועד בית, תאריך כניסה ומאפיינים.";

  return FALLBACK;
}
