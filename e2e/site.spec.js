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

test.describe("floating questions button", () => {
  test("opens a menu with Q&A and a coming-soon voice tour", async ({ page }) => {
    await page.goto("/property/dizengoff-120-tlv");
    const fab = page.getByRole("button", { name: "שאלו את הסוכן הדיגיטלי" });
    await expect(fab).toBeVisible();
    await fab.click();
    await expect(page.getByRole("dialog", { name: "במה אפשר לעזור" })).toBeVisible();
    await expect(page.getByText("שאלות ותשובות")).toBeVisible();
    await expect(page.getByText("בקרוב")).toBeVisible(); // voice tour not built yet
  });

  test("Q&A chat answers a question from the house data", async ({ page }) => {
    await page.goto("/property/dizengoff-120-tlv");
    await page.getByRole("button", { name: "שאלו את הסוכן הדיגיטלי" }).click();
    await page.getByText("שאלות ותשובות").click();
    await expect(page.getByRole("dialog", { name: "שאלות ותשובות" })).toBeVisible();
    // Type with real keystrokes so the onKeyDown handler is exercised
    const box = page.getByPlaceholder("כתבו שאלה…");
    await box.pressSequentially("מה המחיר?");
    await expect(box).toHaveValue("מה המחיר?"); // no characters swallowed
    await page.getByRole("button", { name: "שליחה" }).click();
    // The rule-based matcher answers locally with the property's price
    await expect(page.getByText("3,250,000")).toBeVisible();
  });

  test("is also present during the 3D tour", async ({ page }) => {
    await page.goto("/property/dizengoff-120-tlv/tour");
    await expect(page.getByRole("button", { name: "שאלו את הסוכן הדיגיטלי" })).toBeVisible();
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
