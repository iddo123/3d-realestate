"use client";

import { useEffect, useRef, useState } from "react";

/**
 * In-browser 3D Gaussian Splatting viewer.
 * Renders a .splat / .ksplat / .ply scene with orbit controls.
 *
 * The heavy WebGL libraries (three + gaussian-splats-3d) are imported
 * dynamically inside the effect so they never run during SSR.
 */
export default function GaussianViewer({
  src = "https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat",
}) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let viewer;
    let disposed = false;

    async function init() {
      try {
        const THREE = await import("three");
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");

        if (disposed || !containerRef.current) return;

        viewer = new GaussianSplats3D.Viewer({
          rootElement: containerRef.current,
          // Orbit-friendly default framing for the sample scene
          cameraUp: [0, -1, -0.54],
          initialCameraPosition: [-3.5, -1.2, 6.5],
          initialCameraLookAt: [0.4, 1.3, 0.2],
          // No cross-origin isolation headers in plain dev → disable shared memory
          sharedMemoryForWorkers: false,
          useBuiltInControls: true,
          dynamicScene: false,
        });

        await viewer.addSplatScene(src, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          onProgress: (percent) => {
            if (!disposed) setProgress(Math.round(percent));
          },
        });

        if (disposed) return;
        viewer.start();
        setStatus("ready");
      } catch (err) {
        console.error("Gaussian viewer failed:", err);
        if (!disposed) setStatus("error");
      }
    }

    init();

    return () => {
      disposed = true;
      if (viewer) {
        try {
          viewer.stop();
          viewer.dispose();
        } catch {
          /* ignore teardown races */
        }
      }
    };
  }, [src]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl2 bg-ink">
      {/* The viewer injects its own <canvas> here */}
      <div ref={containerRef} className="absolute inset-0" />

      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-ink text-white">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-teal" />
          <div className="text-sm font-medium">
            טוען סצנת תלת-ממד… {progress > 0 ? `${progress}%` : ""}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ink px-6 text-center text-white">
          <div className="text-2xl">⚠️</div>
          <div className="text-sm font-medium">לא ניתן לטעון את הסצנה התלת-ממדית</div>
          <div className="text-xs text-white/60">
            ודאו שהדפדפן תומך ב-WebGL וש-WebGL מאופשר.
          </div>
        </div>
      )}

      {/* Controls hint */}
      {status === "ready" && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-4 py-1.5 text-xs text-white/90 backdrop-blur">
          גרירה = סיבוב · גלגלת = זום · קליק ימני = הזזה
        </div>
      )}

      {/* Badge */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white shadow">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
        סיור תלת-ממד · 3DGS
      </div>
    </div>
  );
}
