import { notFound } from "next/navigation";
import Link from "next/link";
import { properties, getProperty } from "../../../../lib/properties";
import { resolveScanUrl } from "../../../../lib/scanUrl";
// Client component; all WebGL/three.js work is deferred to useEffect so it's SSR-safe.
import GaussianViewer from "../../../../components/GaussianViewer";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const property = getProperty(params.id);
  return { title: property ? `סיור תלת-ממד · ${property.address}` : "סיור תלת-ממד" };
}

export default function TourPage({ params }) {
  const property = getProperty(params.id);
  if (!property) notFound();

  return (
    <main className="flex h-screen flex-col bg-ink">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 shadow-sm sm:px-6">
        <Link
          href={`/property/${property.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-teal"
        >
          → חזרה לנכס
        </Link>
        <div className="text-center">
          <div className="text-sm font-bold text-ink">{property.address}</div>
          <div className="text-xs text-ink-faint">סיור תלת-ממד · 3DGS</div>
        </div>
        <div className="text-sm font-extrabold text-teal-700">{property.price}</div>
      </div>

      {/* Viewer fills the rest. Uses the property's own scan when set
          (resolved from property.splat), otherwise falls back to the sample. */}
      <div className="relative flex-1 p-3 sm:p-4">
        <GaussianViewer src={resolveScanUrl(property.splat)} />
      </div>
    </main>
  );
}
