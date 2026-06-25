// Builds the grounding context for the LLM property Q&A chatbot.
// Pure (no SDK/network) so it can be unit-tested.

export function buildPropertyFacts(property) {
  const yesNo = (v) => (v ? "יש" : "אין");
  return {
    כתובת: property.address,
    עיר: property.city,
    שכונה: property.hood,
    "סוג נכס": property.propertyType,
    "סוג עסקה": property.listingType,
    מחיר: property.price,
    'מחיר למ"ר': property.perMeter,
    "גמישות במחיר": property.negotiable ? "ייתכנה גמישות" : "לא צוינה גמישות",
    חדרים: property.rooms,
    "חדרי שינה": property.beds,
    "חדרי רחצה": property.baths,
    שטח: property.size,
    קומה: property.floor,
    "שנת בנייה": property.yearBuilt,
    "מצב הנכס": property.condition,
    "כיווני אוויר": property.airDirections,
    "תאריך כניסה": property.entryDate,
    ריהוט: property.furnished,
    חניות: property.parkingSpots,
    מעלית: yesNo(property.elevator),
    מחסן: yesNo(property.storage),
    'ממ"ד': yesNo(property.safeRoom),
    מרפסת: property.balcony,
    ארנונה: property.arnona,
    "דמי ועד בית": property.vaad,
    "חיות מחמד": property.petsAllowed ? "מותר" : "לא צוין",
    נגישות: property.accessible ? "נגיש" : "לא נגיש",
    סטטוס: property.tag,
    תיאור: property.longDesc,
    מאפיינים: property.features,
  };
}

export function buildSystemPrompt(property) {
  const facts = buildPropertyFacts(property);
  return `אתה עוזר/ת וירטואלי/ת באתר הנדל"ן "רגבים". תפקידך לענות על שאלות גולשים לגבי הנכס הבא בלבד, ואך ורק על סמך הנתונים שסופקו לך כאן.

הנחיות:
- ענה/י בעברית, בקצרה, באדיבות ובבהירות. ענה/י ישירות, ללא הקדמות מיותרות.
- הסתמך/י אך ורק על נתוני הנכס שלמטה. אל תמציא/י עובדות, מחירים, מידות או פרטים שלא נמסרו.
- אם המידע הדרוש אינו מופיע בנתונים, אמר/י זאת בכנות והצע/י לפנות לסוכן/ת רגבים לפרטים נוספים.
- אם נשאלת שאלה שאינה קשורה לנכס, החזר/י בעדינות את השיחה לנכס.

נתוני הנכס (JSON):
${JSON.stringify(facts, null, 2)}`;
}
