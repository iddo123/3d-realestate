import { neighborhoodLinks } from "../lib/neighborhood";

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ink-faint">
      <path
        d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NeighborhoodInfo({ property }) {
  const links = neighborhoodLinks(property);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-ink">מידע על השכונה</h2>
      <p className="mt-1 text-sm text-ink-soft">
        מידע כללי על {property.hood} ומקורות נוספים שכדאי להכיר לפני שמחליטים
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm transition-colors hover:border-teal hover:bg-teal-50"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{l.label}</span>
              <span className="block truncate text-sm text-ink-faint">{l.desc}</span>
            </span>
            <ExternalIcon />
          </a>
        ))}
      </div>
    </div>
  );
}
