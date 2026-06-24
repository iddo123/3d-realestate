import { describe, it, expect } from "vitest";
import { properties, getProperty, filterProperties } from "../lib/properties";

describe("property data integrity", () => {
  it("has multiple properties", () => {
    expect(properties.length).toBeGreaterThan(1);
  });

  it("has unique ids", () => {
    const ids = properties.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every property valid coordinates inside Israel's bounding box", () => {
    for (const p of properties) {
      expect(typeof p.lat).toBe("number");
      expect(typeof p.lng).toBe("number");
      expect(p.lat).toBeGreaterThan(29);
      expect(p.lat).toBeLessThan(34);
      expect(p.lng).toBeGreaterThan(34);
      expect(p.lng).toBeLessThan(36);
    }
  });

  it("gives every property the fields the UI relies on", () => {
    for (const p of properties) {
      expect(p.id).toBeTruthy();
      expect(p.price).toMatch(/₪/);
      expect(p.priceShort).toMatch(/₪/);
      expect(p.address).toBeTruthy();
      expect(p.city).toBeTruthy();
      expect(Array.isArray(p.features)).toBe(true);
      expect(p.gallery.length).toBeGreaterThan(0);
    }
  });
});

describe("getProperty", () => {
  it("finds an existing property by id", () => {
    expect(getProperty("dizengoff-120-tlv")?.city).toBe("תל אביב");
  });

  it("returns undefined for an unknown id", () => {
    expect(getProperty("does-not-exist")).toBeUndefined();
  });
});

describe("filterProperties (free-text search)", () => {
  it("returns the full list for an empty or whitespace query", () => {
    expect(filterProperties("")).toHaveLength(properties.length);
    expect(filterProperties("   ")).toHaveLength(properties.length);
    expect(filterProperties(null)).toHaveLength(properties.length);
  });

  it("filters by city name", () => {
    const res = filterProperties("תל אביב");
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.city === "תל אביב")).toBe(true);
  });

  it("filters by a feature", () => {
    const res = filterProperties("בריכה");
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("haalon-14-raanana");
  });

  it("filters by part of a street address", () => {
    const res = filterProperties("דיזנגוף");
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("dizengoff-120-tlv");
  });

  it("applies AND semantics across multiple terms", () => {
    const both = filterProperties("חיפה מעלית");
    expect(both.every((p) => p.city === "חיפה")).toBe(true);
    expect(both.every((p) => p.features.includes("מעלית"))).toBe(true);

    // A combination that cannot co-exist returns nothing
    expect(filterProperties("חיפה בריכה")).toHaveLength(0);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterProperties("קזבלנקה")).toHaveLength(0);
  });

  it("does not mutate the source list", () => {
    const before = properties.length;
    filterProperties("תל אביב");
    expect(properties.length).toBe(before);
  });
});
