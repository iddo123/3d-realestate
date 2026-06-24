import Link from "next/link";
import { properties } from "../lib/properties";

function FeatureChip({ label }) {
  return (
    <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink-soft">
      {label}
    </span>
  );
}

function Stat({ label }) {
  return <span className="text-sm text-ink-soft">{label}</span>;
}

export default function Listings() {
  return (
    <section className="bg-cream py-16">
      <div className="container-px">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              נכסים מומלצים
            </h2>
            <p className="mt-2 text-ink-soft">
              דירות נבחרות · עם סיור תלת-ממד אינטראקטיבי
            </p>
          </div>
          <a
            href="#"
            className="hidden text-[15px] font-semibold text-teal hover:text-teal-700 sm:block"
          >
            לכל הנכסים ←
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((l) => (
            <Link
              key={l.id}
              href={`/property/${l.id}`}
              className="group flex flex-col overflow-hidden rounded-xl2 bg-white shadow-card transition-shadow hover:shadow-cardHover"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={l.img}
                  alt={l.address}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">
                  {l.tag}
                </span>
                <button
                  type="button"
                  aria-label="שמירה למועדפים"
                  className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-soft transition-colors hover:text-teal"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-teal/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                  🧊 סיור תלת-ממד
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-xl font-extrabold text-ink">{l.price}</div>
                  <div className="text-xs font-medium text-ink-faint">
                    {l.perMeter}
                  </div>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stat label={l.rooms} />
                  <span className="text-ink-faint">·</span>
                  <Stat label={l.size} />
                  <span className="text-ink-faint">·</span>
                  <Stat label={l.floor} />
                </div>

                <div className="mt-3 text-[15px] font-bold text-ink">
                  {l.address}
                </div>
                <div className="text-sm text-ink-faint">{l.hood}</div>

                <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {l.desc}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {l.features.slice(0, 4).map((f) => (
                    <FeatureChip key={f} label={f} />
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                    רג
                  </span>
                  <span className="text-xs text-ink-soft">
                    באמצעות סוכן רגבים · עודכן היום
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
