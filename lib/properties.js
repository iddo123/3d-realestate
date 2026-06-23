// Shared mock property data used by the listings grid and the detail page.

export const properties = [
  {
    id: "dizengoff-120-tlv",
    price: "₪3,250,000",
    perMeter: "₪33,160 למ\"ר",
    rooms: "4 חדרים",
    size: "98 מ\"ר",
    floor: "קומה 3 מתוך 6",
    beds: "3 חדרי שינה",
    baths: "2 חדרי רחצה",
    address: "דיזנגוף 120, תל אביב",
    hood: "הצפון הישן",
    tag: "חדש",
    desc: "דירה משופצת ומוארת עם מרפסת שמש פונה לרחוב, מטבח חדש ונוף פתוח. קרובה לכיכר דיזנגוף, בתי קפה ותחבורה.",
    longDesc:
      "דירת 4 חדרים מהממת בלב הצפון הישן, לאחר שיפוץ יסודי ברמה גבוהה. הדירה מוצפת אור טבעי, כוללת מרפסת שמש פונה לרחוב הירוק, מטבח חדש בעיצוב מודרני וסלון מרווח. הבניין שמור עם מעלית וקרוב לכל מה שתל אביב מציעה – כיכר דיזנגוף, שדרות בן גוריון, בתי קפה, גני ילדים ותחבורה ציבורית.",
    features: ["מעלית", "מרפסת שמש", "ממ\"ד", "מיזוג מרכזי", "משופצת", "קרוב לפארק"],
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export function getProperty(id) {
  return properties.find((p) => p.id === id);
}
