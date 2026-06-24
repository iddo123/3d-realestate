"use client";

import { useState } from "react";
import Link from "next/link";
import NeighborhoodInfo from "./NeighborhoodInfo";
import NearbyAmenities from "./NearbyAmenities";

function Spec({ label, value }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-lg font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}

export default function PropertyDetail({ property }) {
  const [active, setActive] = useState(0);

  return (
    <div className="container-px py-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-ink-faint">
        <Link href="/" className="hover:text-teal">
          דף הבית
        </Link>{" "}
        / <span>{property.hood}</span> /{" "}
        <span className="text-ink-soft">{property.address}</span>
      </div>

      {/* Gallery */}
      <div className="grid gap-3 lg:grid-cols-[1fr_minmax(0,360px)]">
        <div className="relative overflow-hidden rounded-xl2">
          <img
            src={property.gallery[active]}
            alt={property.address}
            className="h-[300px] w-full object-cover sm:h-[460px]"
          />
          <span className="absolute right-4 top-4 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">
            {property.tag}
          </span>

          {/* 3D viewer link overlaid on the main photo */}
          <Link
            href={`/property/${property.id}/tour`}
            className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-ink shadow-card transition-transform hover:scale-105"
          >
            🧊 צפו בסיור תלת-ממד
            <span className="text-teal">←</span>
          </Link>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
          {property.gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl border-2 transition-colors ${
                active === i ? "border-teal" : "border-transparent"
              }`}
            >
              <img
                src={src}
                alt={`תמונה ${i + 1}`}
                className="h-20 w-full object-cover lg:h-[88px]"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(0,340px)]">
        {/* Left: details */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {property.address}
            </h1>
            <div className="text-2xl font-extrabold text-teal-700">
              {property.price}
            </div>
          </div>
          <p className="mt-1 text-ink-soft">{property.hood}</p>

          {/* Specs */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Spec label="חדרים" value={property.rooms.replace(" חדרים", "")} />
            <Spec label="שטח" value={property.size} />
            <Spec label="קומה" value={property.floor.replace("קומה ", "")} />
            <Spec label="מחיר למ״ר" value={property.perMeter.replace(" למ״ר", "")} />
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-ink">תיאור הנכס</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {property.longDesc}
            </p>
          </div>

          {/* Features */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-ink">מה יש בנכס</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-cream px-3 py-1.5 text-sm font-medium text-ink-soft"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>

          {/* Neighbourhood knowledge + relevant external resources */}
          <NeighborhoodInfo property={property} />

          {/* Live nearby amenities from OpenStreetMap */}
          <NearbyAmenities lat={property.lat} lng={property.lng} />

          {/* 3D viewer call-to-action card */}
          <Link
            href={`/property/${property.id}/tour`}
            className="mt-8 flex items-center justify-between gap-4 rounded-xl2 bg-gradient-to-l from-teal-700 to-teal-500 p-6 text-white transition-transform hover:scale-[1.01]"
          >
            <div>
              <div className="text-lg font-extrabold">סיור תלת-ממד בנכס</div>
              <div className="text-sm text-white/90">
                סיירו בדירה במודל תלת-ממדי אינטראקטיבי (3D Gaussian Splatting)
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-700">
              כניסה לסיור ←
            </span>
          </Link>
        </div>

        {/* Right: contact box */}
        <aside className="h-fit rounded-xl2 border border-black/5 bg-white p-6 shadow-card lg:sticky lg:top-20">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-sm font-extrabold text-teal-700">
              רג
            </span>
            <div>
              <div className="font-bold text-ink">סוכן רגבים נדל"ן</div>
              <div className="text-sm text-ink-faint">משווק בלעדי</div>
            </div>
          </div>
          <a
            href="tel:000"
            className="mt-5 block rounded-full bg-teal px-5 py-3 text-center text-[15px] font-semibold text-white transition-colors hover:bg-teal-600"
          >
            הצגת מספר טלפון
          </a>
          <button className="mt-3 w-full rounded-full border border-teal px-5 py-3 text-center text-[15px] font-semibold text-teal-700 transition-colors hover:bg-teal-50">
            שליחת הודעה
          </button>
        </aside>
      </div>
    </div>
  );
}
