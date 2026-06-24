import Anthropic from "@anthropic-ai/sdk";
import { getProperty } from "../../../lib/properties";
import { buildSystemPrompt } from "../../../lib/ask";
import { answerQuestion } from "../../../lib/answerQuestion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Opus 4.8 is the documented default. For a high-volume, simple Q&A widget you
// can switch to "claude-haiku-4-5" to cut cost dramatically.
const MODEL = "claude-opus-4-8";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const { propertyId, question, history } = body || {};
  if (!question || !String(question).trim()) {
    return Response.json({ error: "empty_question" }, { status: 400 });
  }

  const property = getProperty(propertyId);
  if (!property) {
    return Response.json({ error: "property_not_found" }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key configured → free rule-based answer (still works out of the box).
  if (!apiKey) {
    return Response.json({ answer: answerQuestion(property, question), source: "rules" });
  }

  // Only pass through clean, alternating user/assistant turns.
  const messages = [];
  for (const m of Array.isArray(history) ? history.slice(-8) : []) {
    if ((m?.role === "user" || m?.role === "assistant") && m?.content) {
      messages.push({ role: m.role, content: String(m.content) });
    }
  }
  messages.push({ role: "user", content: String(question) });

  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1024, // concise answers
      system: buildSystemPrompt(property),
      messages,
    });
    const answer = resp.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return Response.json({ answer: answer || answerQuestion(property, question), source: "llm" });
  } catch (err) {
    console.error("ask route error:", err?.status, err?.message);
    // Graceful degradation: fall back to the rule-based answer on any API error.
    return Response.json({
      answer: answerQuestion(property, question),
      source: "rules_fallback",
    });
  }
}
