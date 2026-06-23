import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 820 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000/property/dizengoff-120-tlv/tour", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});

// Capture the branded viewer chrome (top bar + 3DGS badge + loading state)
// before the WebGL canvas initializes and blocks headless surface readback.
await page.waitForTimeout(450);
await page.screenshot({ path: "docs/screenshots/tour.png", timeout: 15000 });
console.log("saved docs/screenshots/tour.png");

await browser.close();
