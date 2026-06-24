// Builds external "neighbourhood knowledge" links for a property:
// general info (Wikipedia) plus other relevant resources.
export function neighborhoodLinks(property) {
  const { hood, city, lat, lng } = property;
  const wiki = (term) => `https://he.wikipedia.org/wiki/${encodeURIComponent(term)}`;
  const gsearch = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

  return [
    {
      key: "wiki-hood",
      label: `${hood} בוויקיפדיה`,
      desc: "מידע כללי על השכונה",
      href: wiki(hood),
    },
    {
      key: "wiki-city",
      label: `${city} בוויקיפדיה`,
      desc: "מידע כללי על העיר",
      href: wiki(city),
    },
    {
      key: "map",
      label: "מפה ותחבורה",
      desc: "מיקום, תחבורה ונקודות עניין",
      href: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    },
    {
      key: "deals",
      label: 'עסקאות נדל"ן באזור',
      desc: "מחירי עסקאות אמיתיים (nadlan.gov.il)",
      href: "https://www.nadlan.gov.il/",
    },
    {
      key: "schools",
      label: "בתי ספר וגני ילדים",
      desc: "מוסדות חינוך בקרבת מקום",
      href: gsearch(`בתי ספר וגני ילדים ${hood} ${city}`),
    },
  ];
}
