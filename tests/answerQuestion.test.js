import { describe, it, expect } from "vitest";
import { answerQuestion } from "../lib/answerQuestion";
import { getProperty } from "../lib/properties";

const tlv = getProperty("dizengoff-120-tlv"); // no parking, has elevator, negotiable
const rg = getProperty("herzl-45-rg"); // 1 parking
const herzliya = getProperty("yerushalayim-8-herzliya"); // penthouse, not negotiable

describe("answerQuestion (rule-based)", () => {
  it("answers price and room/size questions", () => {
    expect(answerQuestion(tlv, "מה המחיר?")).toContain(tlv.price);
    expect(answerQuestion(tlv, "כמה חדרים יש?")).toContain(tlv.rooms);
    expect(answerQuestion(tlv, "מה השטח?")).toContain(tlv.size);
  });

  it("confirms / denies features", () => {
    expect(answerQuestion(tlv, "יש מעלית?")).toContain("מעלית");
    expect(answerQuestion(rg, "כמה חניות יש?")).toContain("1");
    expect(answerQuestion(tlv, "יש חניה?")).toMatch(/אין/); // Dizengoff has none
  });

  it("answers the new structured fields", () => {
    expect(answerQuestion(tlv, "באיזו שנה נבנה?")).toContain(String(tlv.yearBuilt));
    expect(answerQuestion(tlv, "כמה ארנונה?")).toContain(tlv.arnona);
    expect(answerQuestion(tlv, "מה דמי הוועד?")).toContain(tlv.vaad);
    expect(answerQuestion(tlv, "מתי אפשר להיכנס?")).toContain(tlv.entryDate);
    expect(answerQuestion(tlv, "הדירה מרוהטת?")).toContain(tlv.furnished);
    expect(answerQuestion(herzliya, "איזה סוג נכס?")).toContain(herzliya.propertyType);
    expect(answerQuestion(tlv, "כמה כיווני אוויר?")).toContain(tlv.airDirections);
  });

  it("handles price-negotiability per property", () => {
    expect(answerQuestion(tlv, "האם המחיר גמיש?")).toMatch(/גמישות/);
    expect(answerQuestion(herzliya, "האם המחיר גמיש?")).toMatch(/אינו מצוין/);
  });

  it("answers location / neighbourhood questions", () => {
    expect(answerQuestion(tlv, "באיזו שכונה זה?")).toContain(tlv.hood);
    expect(answerQuestion(tlv, "מה הכתובת?")).toContain(tlv.address);
  });

  it("lists features on a general 'what's included' question", () => {
    expect(answerQuestion(tlv, "מה יש בנכס?")).toContain(tlv.features[0]);
  });

  it("falls back for data it genuinely doesn't have, and on empty input", () => {
    expect(answerQuestion(tlv, "איזה צבע הקירות?")).toMatch(/אין לי/);
    expect(answerQuestion(tlv, "")).toMatch(/אין לי/);
    expect(answerQuestion(null, "מה המחיר?")).toMatch(/אין לי/);
  });
});
