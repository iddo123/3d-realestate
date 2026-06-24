import { describe, it, expect } from "vitest";
import {
  AMENITY_CATEGORIES,
  buildOverpassQuery,
  summarizeAmenities,
} from "../lib/amenities";

describe("buildOverpassQuery", () => {
  it("embeds the coordinates and radius", () => {
    const q = buildOverpassQuery(32.08, 34.77, 800);
    expect(q).toContain("around:800,32.08,34.77");
    expect(q).toContain("[out:json]");
    expect(q).toContain("out center tags;");
  });
});

describe("summarizeAmenities", () => {
  const elements = [
    { tags: { amenity: "school", name: "בית ספר א" } },
    { tags: { amenity: "school", name: "בית ספר ב" } },
    { tags: { amenity: "kindergarten" } },
    { tags: { shop: "supermarket", "name:he": "סופר" } },
    { tags: { highway: "bus_stop" } },
    { tags: { railway: "tram_stop" } },
    { tags: { amenity: "cafe", name: "קפה" } },
    { tags: { building: "yes" } }, // unmatched → ignored
  ];

  it("counts elements per category and drops empty categories", () => {
    const cats = summarizeAmenities(elements);
    const byKey = Object.fromEntries(cats.map((c) => [c.key, c]));
    expect(byKey.school.count).toBe(2);
    expect(byKey.kindergarten.count).toBe(1);
    expect(byKey.grocery.count).toBe(1);
    expect(byKey.transit.count).toBe(2); // bus_stop + tram_stop
    expect(byKey.food.count).toBe(1);
    expect(byKey.health).toBeUndefined(); // none present → filtered out
  });

  it("collects up to a few example names (preferring Hebrew)", () => {
    const cats = summarizeAmenities(elements);
    const school = cats.find((c) => c.key === "school");
    expect(school.names).toEqual(["בית ספר א", "בית ספר ב"]);
    const grocery = cats.find((c) => c.key === "grocery");
    expect(grocery.names).toEqual(["סופר"]); // from name:he
  });

  it("handles empty / missing input safely", () => {
    expect(summarizeAmenities([])).toEqual([]);
    expect(summarizeAmenities(undefined)).toEqual([]);
  });

  it("counts each element in only one category", () => {
    // every category matcher is mutually exclusive for these tag shapes
    const total = summarizeAmenities(elements).reduce((s, c) => s + c.count, 0);
    expect(total).toBe(7); // 8 elements, 1 unmatched
  });

  it("exposes a stable category list", () => {
    expect(AMENITY_CATEGORIES.map((c) => c.key)).toContain("transit");
  });
});
