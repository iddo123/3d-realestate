"use client";

import { useEffect, useState } from "react";
import { buildOverpassQuery, summarizeAmenities } from "../lib/amenities";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function fetchAmenities(lat, lng, radius) {
  const body = "data=" + encodeURIComponent(buildOverpassQuery(lat, lng, radius));
  let lastErr;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return summarizeAmenities(json.elements);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export default function NearbyAmenities({ lat, lng, radius = 800 }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [cats, setCats] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchAmenities(lat, lng, radius)
      .then((result) => {
        if (cancelled) return;
        setCats(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, radius]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-ink">מה יש בסביבה</h2>
      <p className="mt-1 text-sm text-ink-soft">
        מוסדות ושירותים ברדיוס {radius} מ׳ מהנכס · מקור: OpenStreetMap
      </p>

      {status === "loading" && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-cream" />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="mt-3 rounded-xl border border-black/5 bg-cream px-4 py-3 text-sm text-ink-soft">
          לא ניתן לטעון כרגע את נתוני הסביבה. נסו לרענן מאוחר יותר.
        </p>
      )}

      {status === "ready" && cats.length === 0 && (
        <p className="mt-3 text-sm text-ink-soft">לא נמצאו שירותים מתויגים בקרבת מקום.</p>
      )}

      {status === "ready" && cats.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cats.map((c) => (
            <div
              key={c.key}
              className="rounded-xl border border-black/5 bg-white p-3 shadow-sm"
              title={c.names.join(" · ")}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-lg leading-none">{c.icon}</span>
                <span className="text-xl font-extrabold text-ink">{c.count}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-ink">{c.label}</div>
              {c.names.length > 0 && (
                <div className="mt-0.5 line-clamp-2 text-xs text-ink-faint">
                  {c.names.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
