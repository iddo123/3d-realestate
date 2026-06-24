"use client";

import { useState } from "react";

const tabs = ["למכירה", "להשכרה", "פרויקטים חדשים", "מסחרי"];

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Hero() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=2000&q=80"
          alt="נוף עירוני"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
      </div>

      {/* Content */}
      <div className="relative container-px flex min-h-[520px] flex-col items-center justify-center py-20 text-center">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl">
          כל מה שצריך לדעת על נדל"ן במקום אחד
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          חיפוש דירות, מחירון אמיתי, מידע על שכונות וכל הנתונים שיעזרו לכם להחליט נכון.
        </p>

        {/* Search card */}
        <div className="mt-9 w-full max-w-2xl">
          {/* Tabs */}
          <div className="flex justify-center gap-1.5">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActive(i)}
                className={`rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:text-[15px] ${
                  active === i
                    ? "bg-white text-ink"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 rounded-xl2 rounded-tl-none bg-white p-2 shadow-search">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-ink-faint" />
              <input
                type="text"
                placeholder="עיר, שכונה, רחוב או מספר נכס"
                className="w-full bg-transparent py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-teal-600">
              חיפוש
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
