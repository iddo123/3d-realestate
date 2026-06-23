import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function shoot(name, path, { full = false, wait = 1500 } = {}) {
  console.log(`→ ${name}: ${path}`);
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log(`  saved ${OUT}/${name}.png`);
}

// 1. Homepage (full page)
await shoot("home", "/", { full: true });

// 2. Property detail page (full page)
await shoot("property", "/property/dizengoff-120-tlv", { full: true });

// 3. 3D Gaussian Splatting tour — wait for the scene to finish loading
console.log("→ tour: /property/dizengoff-120-tlv/tour");
await page.goto(`${BASE}/property/dizengoff-120-tlv/tour`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
try {
  // The controls hint appears only once the viewer reports "ready"
  await page.getByText("גרירה = סיבוב").waitFor({ timeout: 90000 });
  console.log("  viewer ready");
} catch {
  console.log("  viewer not confirmed ready, capturing anyway");
}
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/tour.png` });
console.log(`  saved ${OUT}/tour.png`);

await browser.close();
console.log("done");
