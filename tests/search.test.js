import { describe, it, expect } from "vitest";
import {
  parseQuery,
  searchProperties,
  summarizeQuery,
  normalizeConstraints,
  applyConstraints,
} from "../lib/search";
import { properties } from "../lib/properties";

describe("parseQuery", () => {
  it("parses the natural-language example", () => {
    const c = parseQuery(
      "I am looking for a 3 bedroom apartment in tel aviv for up to 6000 NIS, I also need a private parking slot"
    );
    expect(c.minRooms).toBe(3);
    expect(c.maxRooms).toBe(3);
    expect(c.roomsKind).toBe("bed");
    expect(c.city).toBe("תל אביב");
    expect(c.maxPrice).toBe(6000);
    expect(c.features).toContain("חניה");
    expect(c.terms).toEqual([]); // all filler words consumed
  });

  it("parses Hebrew queries and price units", () => {
    expect(parseQuery("דירה בתל אביב עד 3.5 מיליון").maxPrice).toBe(3500000);
    expect(parseQuery("up to 3 million").maxPrice).toBe(3000000);
    expect(parseQuery('עד 6000 ש"ח').maxPrice).toBe(6000);
    expect(parseQuery("3 חדרים").roomsKind).toBe("room");
  });

  it("parses room ranges and open-ended room constraints", () => {
    const range = parseQuery("דירה בתל אביב מ 3 עד 4 חדרים");
    expect(range.minRooms).toBe(3);
    expect(range.maxRooms).toBe(4);
    expect(range.city).toBe("תל אביב");
    expect(range.maxPrice).toBeNull(); // "עד 4 חדרים" is rooms, not a ₪4 ceiling

    const en = parseQuery("3 to 4 rooms");
    expect(en.minRooms).toBe(3);
    expect(en.maxRooms).toBe(4);

    const atLeast = parseQuery("לפחות 4 חדרים");
    expect(atLeast.minRooms).toBe(4);
    expect(atLeast.maxRooms).toBeNull();

    const upTo = parseQuery("up to 3 rooms");
    expect(upTo.minRooms).toBeNull();
    expect(upTo.maxRooms).toBe(3);

    const plain = parseQuery("4 חדרים");
    expect(plain.minRooms).toBe(4);
    expect(plain.maxRooms).toBe(4);
  });

  it('treats "about/around/בערך" as a ±15% band, not a hard max', () => {
    const c = parseQuery("about 3 million");
    expect(c.minPrice).toBe(2_550_000);
    expect(c.maxPrice).toBe(3_450_000);
    const h = parseQuery("בערך 3 מיליון");
    expect(h.minPrice).toBe(2_550_000);
    expect(h.maxPrice).toBe(3_450_000);
    // "באזור X" / "באזור ה-X" mean "around X", not a hard ceiling
    const azor = parseQuery("דירה בתל אביב באזור 3 מיליון שקל");
    expect(azor.minPrice).toBe(2_550_000);
    expect(azor.maxPrice).toBe(3_450_000);
    expect(parseQuery("באזור ה-3 מיליון").maxPrice).toBe(3_450_000);
  });

  it('treats "over/מעל" as a floor (minPrice only)', () => {
    const c = parseQuery("over 2 million");
    expect(c.minPrice).toBe(2_000_000);
    expect(c.maxPrice).toBeNull();
    expect(parseQuery("מעל 2 מיליון").minPrice).toBe(2_000_000);
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

  it("filters by a room range (inclusive band)", () => {
    const res = searchProperties("3 עד 4 חדרים");
    const roomNum = (p) => parseFloat(p.rooms);
    expect(res.every((p) => roomNum(p) >= 3 && roomNum(p) <= 4)).toBe(true);
    // matches every 3- and 4-room property, excludes 2.5- and 5-room ones
    const expected = properties.filter((p) => roomNum(p) >= 3 && roomNum(p) <= 4).length;
    expect(res).toHaveLength(expected);
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

describe("normalizeConstraints (sanitizing LLM output)", () => {
  it("keeps valid fields and drops unknown cities/features", () => {
    const c = normalizeConstraints({
      city: "תל אביב",
      minRooms: 3,
      maxRooms: 4,
      roomsKind: "bed",
      maxPrice: 3500000,
      features: ["חניה", "made-up"],
      terms: ["גינה"],
    });
    expect(c.city).toBe("תל אביב");
    expect(c.minRooms).toBe(3);
    expect(c.maxRooms).toBe(4);
    expect(c.maxPrice).toBe(3500000);
    expect(c.features).toEqual(["חניה"]);
    expect(c.terms).toEqual(["גינה"]);
  });

  it("normalizes loose room output from the model", () => {
    // "bedroom"/"bedrooms" → "bed"; a legacy single `rooms` → exact band.
    const c = normalizeConstraints({ rooms: 3, roomsKind: "bedroom" });
    expect(c.roomsKind).toBe("bed");
    expect(c.minRooms).toBe(3);
    expect(c.maxRooms).toBe(3);
    // an inverted band is swapped back into order
    const swapped = normalizeConstraints({ minRooms: 5, maxRooms: 2 });
    expect(swapped.minRooms).toBe(2);
    expect(swapped.maxRooms).toBe(5);
  });

  it("rejects invalid values", () => {
    const c = normalizeConstraints({ city: "London", maxPrice: -5, features: "x", rooms: 0 });
    expect(c.city).toBeNull();
    expect(c.maxPrice).toBeNull();
    expect(c.features).toEqual([]);
    expect(c.minRooms).toBeNull();
    expect(c.maxRooms).toBeNull();
  });

  it("applyConstraints filters with sanitized constraints", () => {
    const c = normalizeConstraints({ city: "תל אביב", maxPrice: 3500000, features: ["מעלית"] });
    const res = applyConstraints(c);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("dizengoff-120-tlv");
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
