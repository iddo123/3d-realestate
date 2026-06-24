// Resolves a property's `splat` value into a loadable URL for the 3D viewer.
//
// A property's `splat` can be:
//   - a full URL            → "https://<ref>.supabase.co/storage/v1/object/public/scans/model.ksplat"
//   - a local public path   → "/scans/model.ply"   (served from /public, dev only)
//   - a bare object path    → "model.ksplat"        (joined with the Supabase base below)
//
// For the bare form, set NEXT_PUBLIC_SCAN_BASE_URL to your Supabase public bucket
// base, e.g.  https://<project-ref>.supabase.co/storage/v1/object/public/scans
//
// Returns undefined when nothing usable is configured, so the viewer falls back
// to its bundled sample scene.
export function resolveScanUrl(splat) {
  if (!splat) return undefined;

  // Already a full URL or a local public path → use as-is.
  if (/^https?:\/\//i.test(splat)) return splat;
  if (splat.startsWith("/")) return splat;

  // Bare object path → join with the configured storage base.
  const base = process.env.NEXT_PUBLIC_SCAN_BASE_URL;
  if (!base) return undefined;

  return `${base.replace(/\/+$/, "")}/${splat.replace(/^\/+/, "")}`;
}
