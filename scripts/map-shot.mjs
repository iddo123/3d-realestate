import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("docs/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
// Scroll to the map and wait for tiles
await page.getByTestId("property-map").scrollIntoViewIfNeeded();
await page.locator(".leaflet-tile").first().waitFor({ timeout: 30000 });
await page.waitForTimeout(2500);
await page.getByTestId("property-map").screenshot({ path: "docs/screenshots/map.png" });
console.log("saved docs/screenshots/map.png");

await browser.close();
