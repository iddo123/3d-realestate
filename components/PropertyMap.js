"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { properties } from "../lib/properties";
import { searchProperties, summarizeQuery } from "../lib/search";

const ISRAEL_CENTER = [31.6, 34.9];

export default function PropertyMap() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({}); // id -> leaflet marker
  const LRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchProperties(query), [query]);
  const chips = useMemo(() => summarizeQuery(query), [query]);

  // Initialise the Leaflet map once (client-only — Leaflet touches window).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || mapRef.current || !mapEl.current) return;
      LRef.current = L;

      const map = L.map(mapEl.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(ISRAEL_CENTER, 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Re-draw markers whenever the filtered results change.
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current = {};
    const points = [];

    results.forEach((p) => {
      const icon = L.divIcon({
        className: "rg-pin-wrap",
        html: `<div class="rg-pin">${p.priceShort}</div>`,
        iconSize: [66, 28],
        iconAnchor: [33, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer);
      marker.bindPopup(
        `<div dir="rtl" class="rg-popup">
           <img src="${p.img}" alt="" />
           <div class="rg-popup-price">${p.price}</div>
           <div class="rg-popup-addr">${p.address}</div>
           <div class="rg-popup-meta">${p.rooms} · ${p.size}</div>
           <a href="/property/${p.id}">צפייה בנכס ←</a>
         </div>`,
        { minWidth: 180 }
      );
      markersRef.current[p.id] = marker;
      points.push([p.lat, p.lng]);
    });

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 13 });
    }
  }, [results, ready]);

  function focusProperty(p) {
    const map = mapRef.current;
    const marker = markersRef.current[p.id];
    if (!map || !marker) return;
    map.flyTo([p.lat, p.lng], 14, { duration: 0.6 });
    marker.openPopup();
  }

  return (
    <section className="container-px py-16">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
          חיפוש חכם בטקסט חופשי
        </h2>
        <p className="mt-2 text-ink-soft">
          כתבו מה אתם מחפשים במשפט אחד – עיר, מספר חדרים, תקציב ומאפיינים
        </p>
      </div>

      {/* Free-text natural-language filter */}
      <div className="mx-auto mb-3 flex max-w-2xl items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-card">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-ink-faint">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="לדוגמה: דירת 3 חדרים בתל אביב עם חניה עד 3.5 מיליון ₪"
          aria-label="חיפוש חכם בטקסט חופשי"
          className="w-full bg-transparent py-1.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="ניקוי חיפוש"
            className="shrink-0 text-ink-faint hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>

      {/* "Understood" chips — feedback that the natural language was parsed */}
      {chips.length > 0 && (
        <div className="mx-auto mb-5 flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs text-ink-faint">הבנו:</span>
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="overflow-hidden rounded-xl2 border border-black/5 shadow-card">
          <div ref={mapEl} className="h-[360px] w-full sm:h-[520px]" data-testid="property-map" />
        </div>

        {/* Result list */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-semibold text-ink-soft" data-testid="result-count">
            {results.length > 0
              ? `נמצאו ${results.length} נכסים`
              : "לא נמצאו נכסים תואמים"}
          </div>
          <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pl-1">
            {results.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-black/5 bg-white p-3 shadow-sm transition-shadow hover:shadow-card"
                data-testid="result-item"
              >
                <button
                  onClick={() => focusProperty(p)}
                  className="flex w-full items-center gap-3 text-right"
                >
                  <img
                    src={p.img}
                    alt=""
                    className="h-14 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold text-ink">{p.price}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {p.address}
                    </span>
                    <span className="block text-xs text-ink-faint">
                      {p.rooms} · {p.size}
                    </span>
                  </span>
                </button>
                <Link
                  href={`/property/${p.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-teal hover:text-teal-700"
                >
                  צפייה בנכס ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
