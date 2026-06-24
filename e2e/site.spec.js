import { test, expect } from "@playwright/test";

test.describe("רגבים homepage", () => {
  test("shows the Regavim brand and an RTL document", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("header")).toContainText("רגבים");
    await expect(page).toHaveTitle(/רגבים/);
  });

  test("no longer renders the hero city quick-buttons", async ({ page }) => {
    await page.goto("/");
    // The old hero chips lived inside the hero <section>; ensure they're gone there.
    const hero = page.locator("section").first();
    await expect(hero.getByRole("button", { name: "ירושלים" })).toHaveCount(0);
  });
});

test.describe("property map", () => {
  test("renders the Leaflet map and all listings", async ({ page }) => {
    await page.goto("/");
    const map = page.getByTestId("property-map");
    await map.scrollIntoViewIfNeeded();
    // Leaflet injects tile images once initialised
    await expect(map.locator(".leaflet-tile").first()).toBeVisible();
    await expect(page.getByTestId("result-count")).toContainText("נמצאו 8 נכסים");
  });

  test("free-text filter narrows the results", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder(/לדוגמה/);
    await search.scrollIntoViewIfNeeded();

    await search.fill("בריכה");
    await expect(page.getByTestId("result-count")).toContainText("נמצאו 1 נכסים");
    await expect(page.getByTestId("result-item")).toHaveCount(1);

    await search.fill("קזבלנקה");
    await expect(page.getByTestId("result-count")).toContainText("לא נמצאו");
    await expect(page.getByTestId("result-item")).toHaveCount(0);
  });

  test("a map result links through to the property page", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder(/לדוגמה/);
    await search.fill("דיזנגוף");
    const item = page.getByTestId("result-item").first();
    await item.getByRole("link", { name: /צפייה בנכס/ }).click();
    await expect(page).toHaveURL(/\/property\/dizengoff-120-tlv/);
  });
});

test.describe("property detail + 3D tour", () => {
  test("shows description and links to the 3D tour", async ({ page }) => {
    await page.goto("/property/dizengoff-120-tlv");
    await expect(page.getByRole("heading", { name: /דיזנגוף 120/ })).toBeVisible();
    await expect(page.locator("body")).toContainText("תיאור הנכס");

    await page.getByRole("link", { name: /כניסה לסיור/ }).click();
    await expect(page).toHaveURL(/\/property\/dizengoff-120-tlv\/tour/);
    await expect(page.locator("body")).toContainText("3DGS");
  });
});
