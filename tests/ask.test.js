import { describe, it, expect } from "vitest";
import { buildPropertyFacts, buildSystemPrompt } from "../lib/ask";
import { getProperty } from "../lib/properties";

const property = getProperty("dizengoff-120-tlv");

describe("buildPropertyFacts", () => {
  it("exposes the key facts the chatbot answers from", () => {
    const f = buildPropertyFacts(property);
    expect(f["כתובת"]).toBe(property.address);
    expect(f["עיר"]).toBe(property.city);
    expect(f["מחיר"]).toBe(property.price);
    expect(f["מאפיינים"]).toEqual(property.features);
  });
});

describe("buildSystemPrompt", () => {
  it("grounds the assistant in this property's data and brand", () => {
    const sys = buildSystemPrompt(property);
    expect(sys).toContain("רגבים");
    expect(sys).toContain(property.address);
    expect(sys).toContain(property.features[0]);
  });

  it("instructs the model not to invent facts", () => {
    expect(buildSystemPrompt(property)).toMatch(/אל תמציא/);
  });

  it("embeds the facts as valid JSON", () => {
    const sys = buildSystemPrompt(property);
    const json = sys.slice(sys.indexOf("{"), sys.lastIndexOf("}") + 1);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
