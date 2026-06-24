import { describe, it, expect } from "vitest";
import { neighborhoodLinks } from "../lib/neighborhood";
import { properties } from "../lib/properties";

const sample = {
  hood: "הצפון הישן",
  city: "תל אביב",
  lat: 32.0814,
  lng: 34.774,
};

describe("neighborhoodLinks", () => {
  it("includes a general-knowledge Wikipedia link for the neighbourhood", () => {
    const links = neighborhoodLinks(sample);
    const wiki = links.find((l) => l.key === "wiki-hood");
    expect(wiki).toBeTruthy();
    expect(wiki.href).toContain("he.wikipedia.org/wiki/");
    expect(decodeURIComponent(wiki.href)).toContain(sample.hood);
  });

  it("includes city, map, deals and schools resources", () => {
    const keys = neighborhoodLinks(sample).map((l) => l.key);
    expect(keys).toEqual(
      expect.arrayContaining(["wiki-hood", "wiki-city", "map", "deals", "schools"])
    );
  });

  it("encodes coordinates into the map link", () => {
    const map = neighborhoodLinks(sample).find((l) => l.key === "map");
    expect(map.href).toContain(`${sample.lat},${sample.lng}`);
  });

  it("produces valid absolute URLs with no spaces for every property", () => {
    for (const p of properties) {
      for (const l of neighborhoodLinks(p)) {
        expect(() => new URL(l.href)).not.toThrow();
        expect(l.href).not.toMatch(/\s/);
        expect(l.label).toBeTruthy();
      }
    }
  });
});
