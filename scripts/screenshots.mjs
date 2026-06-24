import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
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

// 1. Homepage (full page) — brand רגבים, hero, map, listings, tools
await shoot("home", "/", { full: true });

// 2. Property detail page (full page)
await shoot("property", "/property/dizengoff-120-tlv", { full: true });

// 3. Map section close-up — wait for Leaflet tiles to load
console.log("→ map: / (map section)");
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
const map = page.getByTestId("property-map");
await map.scrollIntoViewIfNeeded();
await page.locator(".leaflet-tile").first().waitFor({ timeout: 30000 });
await page.waitForTimeout(2500);
await map.screenshot({ path: `${OUT}/map.png` });
console.log(`  saved ${OUT}/map.png`);

await browser.close();
console.log("done");
