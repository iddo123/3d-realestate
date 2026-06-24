# 3D scans (Gaussian Splatting)

Drop your scan files here. Anything in `public/` is served by Next.js at the
site root, so a file at:

    public/scans/dizengoff-120.ksplat

is available at the URL:

    /scans/dizengoff-120.ksplat

## Supported formats

| Format    | Notes                                                        |
|-----------|--------------------------------------------------------------|
| `.ksplat` | **Recommended** — compressed, fastest to load                |
| `.splat`  | Common export from many tools, works directly                |
| `.ply`    | Raw Gaussian Splat PLY; larger, loads but slower             |

## How to use your scan for a property

1. Copy your file into this folder, e.g. `public/scans/my-apartment.ksplat`.
2. In `lib/properties.js`, add a `splat` field to the relevant property:

   ```js
   {
     id: "dizengoff-120-tlv",
     // …
     splat: "/scans/my-apartment.ksplat",
   }
   ```

3. Open the property's 3D tour — the viewer loads your scan automatically.
   Properties without a `splat` field fall back to the bundled sample scene.

## Notes

- Large files (tens of MB) are fine for local testing. For the deployed site,
  consider Git LFS or hosting the file on external storage (served with CORS)
  and pointing `splat` at the full URL instead of a `/scans/...` path.
