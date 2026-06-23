"use client";

const cities = [
  {
    name: "תל אביב יפו",
    listings: "4,210 נכסים",
    img: "https://images.unsplash.com/photo-1544971587-b4a3a3d4b3a8?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "ירושלים",
    listings: "3,180 נכסים",
    img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "חיפה",
    listings: "2,540 נכסים",
    img: "https://images.unsplash.com/photo-1593412434056-1d4f8a3fb27a?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "רמת גן",
    listings: "1,920 נכסים",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "הרצליה",
    listings: "1,310 נכסים",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "באר שבע",
    listings: "1,860 נכסים",
    img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Cities() {
  return (
    <section className="container-px py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
          חפשו לפי עיר
        </h2>
        <p className="mt-2 text-ink-soft">
          גלו נכסים, מחירים ומגמות בערים המובילות בישראל
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cities.map((city) => (
          <a
            key={city.name}
            href="#"
            className="group relative h-44 overflow-hidden rounded-xl2 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <img
              src={city.img}
              alt={city.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 right-0 p-4 text-white">
              <div className="text-lg font-bold">{city.name}</div>
              <div className="text-sm text-white/85">{city.listings}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
