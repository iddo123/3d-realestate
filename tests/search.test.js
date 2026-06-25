import { describe, it, expect } from "vitest";
import { parseQuery, searchProperties, summarizeQuery } from "../lib/search";
import { properties } from "../lib/properties";

describe("parseQuery", () => {
  it("parses the natural-language example", () => {
    const c = parseQuery(
      "I am looking for a 3 bedroom apartment in tel aviv for up to 6000 NIS, I also need a private parking slot"
    );
    expect(c.rooms).toBe(3);
    expect(c.roomsKind).toBe("bed");
    expect(c.city).toBe("תל אביב");
    expect(c.maxPrice).toBe(6000);
    expect(c.features.map((f) => f.label)).toContain("חניה");
    expect(c.terms).toEqual([]); // all filler words consumed
  });

  it("parses Hebrew queries and price units", () => {
    expect(parseQuery("דירה בתל אביב עד 3.5 מיליון").maxPrice).toBe(3500000);
    expect(parseQuery("up to 3 million").maxPrice).toBe(3000000);
    expect(parseQuery('עד 6000 ש"ח').maxPrice).toBe(6000);
    expect(parseQuery("3 חדרים").roomsKind).toBe("room");
  });
});

describe("searchProperties", () => {
  it("returns everything for an empty query", () => {
    expect(searchProperties("")).toHaveLength(properties.length);
  });

  it("over-constrained example returns nothing (sale prices >> 6000)", () => {
    expect(
      searchProperties("3 bedroom in tel aviv up to 6000 NIS with parking")
    ).toHaveLength(0);
  });

  it("filters by city + max price", () => {
    const res = searchProperties("דירה בתל אביב עד 3.5 מיליון");
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("dizengoff-120-tlv");
  });

  it("filters by rooms + feature", () => {
    const res = searchProperties("4 חדרים עם חניה");
    expect(res.every((p) => p.parkingSpots > 0)).toBe(true);
    expect(res.every((p) => p.rooms.startsWith("4"))).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it("filters by a single feature", () => {
    const res = searchProperties("בריכה");
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("haalon-14-raanana");
  });

  it("treats unknown words as required terms", () => {
    expect(searchProperties("קזבלנקה")).toHaveLength(0); // no match
    expect(searchProperties("דיזנגוף")).toHaveLength(1); // matches the street
  });
});

describe("summarizeQuery", () => {
  it("describes the understood constraints as chips", () => {
    const chips = summarizeQuery("דירת 3 חדרים בחיפה עם חניה עד 3 מיליון");
    expect(chips).toContain("חיפה");
    expect(chips).toContain("3 חדרים");
    expect(chips).toContain("חניה");
    expect(chips).toContain("עד ₪3,000,000");
  });
});
