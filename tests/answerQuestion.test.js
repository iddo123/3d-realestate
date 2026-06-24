import { describe, it, expect } from "vitest";
import { answerQuestion } from "../lib/answerQuestion";
import { getProperty } from "../lib/properties";

const tlv = getProperty("dizengoff-120-tlv"); // no parking, has elevator
const rg = getProperty("herzl-45-rg"); // has parking

describe("answerQuestion (rule-based)", () => {
  it("answers price questions from the data", () => {
    expect(answerQuestion(tlv, "מה המחיר?")).toContain(tlv.price);
    expect(answerQuestion(tlv, "כמה זה עולה?")).toContain(tlv.price);
  });

  it("answers room and size questions", () => {
    expect(answerQuestion(tlv, "כמה חדרים יש?")).toContain(tlv.rooms);
    expect(answerQuestion(tlv, "מה השטח?")).toContain(tlv.size);
  });

  it("confirms a feature the property has", () => {
    expect(answerQuestion(tlv, "יש מעלית?")).toContain("מעלית");
    expect(answerQuestion(rg, "יש חניה?")).toMatch(/כן/);
  });

  it("says no for a feature the property lacks", () => {
    // The Dizengoff flat has no parking feature
    expect(answerQuestion(tlv, "יש חניה?")).toMatch(/אין/);
  });

  it("answers location / neighbourhood questions", () => {
    expect(answerQuestion(tlv, "באיזו שכונה זה?")).toContain(tlv.hood);
    expect(answerQuestion(tlv, "מה הכתובת?")).toContain(tlv.address);
  });

  it("lists features on a general 'what's included' question", () => {
    const a = answerQuestion(tlv, "מה יש בנכס?");
    expect(a).toContain(tlv.features[0]);
  });

  it("falls back to the agent for data it doesn't have", () => {
    expect(answerQuestion(tlv, "איזה צבע הקירות?")).toMatch(/אין לי/);
    expect(answerQuestion(tlv, "מתי אפשר להיכנס?")).toMatch(/סוכן רגבים/);
  });

  it("handles empty / missing input safely", () => {
    expect(answerQuestion(tlv, "")).toMatch(/אין לי/);
    expect(answerQuestion(null, "מה המחיר?")).toMatch(/אין לי/);
  });
});
