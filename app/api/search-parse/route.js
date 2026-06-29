import {
  parseQuery,
  normalizeConstraints,
  FEATURE_LABELS,
  CITY_NAMES,
} from "../../../lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strip a leading BOM / stray whitespace that some env-var tooling prepends —
// a BOM in an HTTP header value throws "Cannot convert argument to a ByteString".
const cleanEnv = (v) => (v || "").replace(/^﻿/, "").trim();

// Any OpenRouter model id. Pick a free one (…:free) or a cheap paid model.
const MODEL = cleanEnv(process.env.OPENROUTER_MODEL) || "meta-llama/llama-3.3-70b-instruct:free";

function systemPrompt() {
  return `אתה ממיר שאילתת חיפוש נדל"ן בשפה חופשית (עברית או אנגלית) למסנני JSON.
הבן את כוונת המשתמש. החזר אך ורק JSON תקין, ללא טקסט נוסף.
אם שדה לא הוזכר — null או מערך ריק. אל תמציא ערכים.

מבנה:
{
  "city": <עיר אחת מהרשימה המותרת בלבד, או null>,
  "minRooms": <מספר או null>,
  "maxRooms": <מספר או null>,
  "roomsKind": <"bed" אם דובר על חדרי שינה, אחרת "room", או null>,
  "minPrice": <ש"ח כמספר שלם, או null>,
  "maxPrice": <ש"ח כמספר שלם, או null>,
  "features": [<תת-קבוצה מהמאפיינים המותרים בלבד>],
  "terms": [<ראה כלל terms>]
}
חדרים: מספר בודד ("3 חדרים") => minRooms=maxRooms; כיוון אחד ("לפחות"/"עד") => הצד השני null.

ערים מותרות: ${CITY_NAMES.join(", ")}
מאפיינים מותרים: ${FEATURE_LABELS.join(", ")}
מחירים בש"ח, טווח המודעות ~₪1,400,000–₪5,800,000. המר יחידות: "3 מיליון"/"3m"=>3000000, "500 אלף"/"500k"=>500000.

מוסכמות (החלטות שלנו — אי אפשר לנחש, פעל לפיהן):
- מחיר מקורב (בערך/באזור/סביב/around ...) => טווח ±15%: minPrice≈X*0.85, maxPrice≈X*1.15.
- מחיר נקוב בלי ניסוח כיווני => תקציב: maxPrice=X.
- מילה איכותית בלי מספר: זול/cheap => maxPrice≈2200000 ; יוקרתי/luxury => minPrice≈4500000. מספר מפורש גובר על מילה איכותית.
- terms = מסנן substring קשיח על טקסט המודעה (עברית בלבד). הכנס רק שמות רחוב/שכונה/ציון-דרך ספציפיים בעברית (למשל "דיזנגוף", "מרינה"). לעולם לא אנגלית, סוגי נכס, מאפיינים, מחירים, ערים או תיאורים כלליים. בספק — השאר ריק.

דוגמאות:
"דירת 4 חדרים בחיפה עם מעלית עד 3 מיליון" => {"city":"חיפה","minRooms":4,"maxRooms":4,"roomsKind":"room","minPrice":null,"maxPrice":3000000,"features":["מעלית"],"terms":[]}
"3 bedroom in tel aviv around 4M with parking" => {"city":"תל אביב","minRooms":3,"maxRooms":3,"roomsKind":"bed","minPrice":3400000,"maxPrice":4600000,"features":["חניה"],"terms":[]}
"בית מ-4 עד 5 חדרים ברעננה ליד הפארק" => {"city":"רעננה","minRooms":4,"maxRooms":5,"roomsKind":"room","minPrice":null,"maxPrice":null,"features":[],"terms":[]}`;
}

async function llmParse(query, key) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "360 property search",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: String(query) },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const data = await res.json();
  let content = (data?.choices?.[0]?.message?.content || "").trim();
  content = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const raw = JSON.parse(content);
  // On a vague query the model sometimes returns {"error": "..."} instead of the
  // schema — treat that as "couldn't parse" so the caller falls back to rules.
  if (raw && raw.error) throw new Error("llm_no_constraints");
  return normalizeConstraints(raw);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const query = String(body?.query || "").trim();
  if (!query) return Response.json({ constraints: parseQuery(""), source: "empty" });

  const key = cleanEnv(process.env.OPENROUTER_API_KEY);
  if (!key) return Response.json({ constraints: parseQuery(query), source: "rules" });

  try {
    const constraints = await llmParse(query, key);
    return Response.json({ constraints, source: "llm" });
  } catch (err) {
    console.error("search-parse error:", err?.message);
    // graceful fallback to the rule-based parser
    return Response.json({ constraints: parseQuery(query), source: "rules_fallback" });
  }
}
