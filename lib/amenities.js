// Nearby-amenity categories sourced from OpenStreetMap (via the Overpass API).
// Each category knows how to match an OSM element's tags.
export const AMENITY_CATEGORIES = [
  { key: "school", label: "בתי ספר", icon: "🏫", match: (t) => t.amenity === "school" },
  { key: "kindergarten", label: "גני ילדים", icon: "🧸", match: (t) => t.amenity === "kindergarten" },
  {
    key: "transit",
    label: "תחבורה ציבורית",
    icon: "🚉",
    match: (t) =>
      t.highway === "bus_stop" ||
      t.railway === "station" ||
      t.railway === "tram_stop" ||
      t.public_transport === "station",
  },
  {
    key: "grocery",
    label: "סופרמרקטים",
    icon: "🛒",
    match: (t) => t.shop === "supermarket" || t.shop === "convenience",
  },
  {
    key: "park",
    label: "פארקים וגינות",
    icon: "🌳",
    match: (t) => t.leisure === "park" || t.leisure === "playground",
  },
  { key: "pharmacy", label: "בתי מרקחת", icon: "💊", match: (t) => t.amenity === "pharmacy" },
  {
    key: "health",
    label: "בריאות",
    icon: "🏥",
    match: (t) => t.amenity === "clinic" || t.amenity === "hospital" || t.amenity === "doctors",
  },
  {
    key: "food",
    label: "בתי קפה ומסעדות",
    icon: "☕",
    match: (t) => t.amenity === "cafe" || t.amenity === "restaurant",
  },
];

// Builds an Overpass QL query for amenities within `radius` metres of a point.
export function buildOverpassQuery(lat, lng, radius = 800) {
  const around = `around:${radius},${lat},${lng}`;
  return `[out:json][timeout:25];
(
  nwr(${around})["amenity"~"^(school|kindergarten|pharmacy|clinic|hospital|doctors|cafe|restaurant)$"];
  nwr(${around})["shop"~"^(supermarket|convenience)$"];
  nwr(${around})["leisure"~"^(park|playground)$"];
  nwr(${around})["highway"="bus_stop"];
  nwr(${around})["railway"~"^(station|tram_stop)$"];
);
out center tags;`;
}

// Reduces raw Overpass elements into per-category counts and a few example names.
export function summarizeAmenities(elements) {
  const cats = AMENITY_CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    icon: c.icon,
    count: 0,
    names: [],
  }));
  const matchers = AMENITY_CATEGORIES;

  for (const el of elements || []) {
    const tags = el.tags || {};
    for (let i = 0; i < matchers.length; i++) {
      if (matchers[i].match(tags)) {
        const cat = cats[i];
        cat.count++;
        const name = tags["name:he"] || tags.name;
        if (name && cat.names.length < 4 && !cat.names.includes(name)) {
          cat.names.push(name);
        }
        break; // count each element in its first matching category only
      }
    }
  }

  return cats.filter((c) => c.count > 0);
}
