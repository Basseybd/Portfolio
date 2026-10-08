import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/work", "/life", "/photos"];

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

for (const route of routes) {
  test(`${route} loads with no errors and no sideways scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    expect(await noOverflow(page)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test.describe("photo links", () => {
  const dialogOpen = (page: Page) => page.evaluate(() => document.querySelector("dialog")?.open ?? false);

  test("?p= opens that photo, and closing clears it", async ({ page }) => {
    await page.goto("/photos?p=2026-el-yunque-window", { waitUntil: "networkidle" });
    await expect(page.locator("dialog")).toContainText("Tower window");
    await page.keyboard.press("Escape");
    await expect.poll(() => dialogOpen(page)).toBe(false);
    // The dialog's close event, which clears ?p=, fires a task after it shuts.
    await expect.poll(() => new URL(page.url()).searchParams.has("p")).toBe(false);
  });

  test("opening a photo writes ?p=", async ({ page }) => {
    await page.goto("/photos", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^View larger:/ }).first().click();
    await expect.poll(() => new URL(page.url()).searchParams.get("p")).toBeTruthy();
  });

  test("arrow keys keep ?p= in step", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard only");
    await page.goto("/photos?p=2026-el-yunque-window", { waitUntil: "networkidle" });
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => new URL(page.url()).searchParams.get("p")).not.toBe("2026-el-yunque-window");
  });

  test("a photo outside the filter still opens", async ({ page }) => {
    await page.goto("/photos?c=city&p=2026-rainforest-lunch", { waitUntil: "networkidle" });
    await expect(page.locator("dialog")).toContainText("Lunch in the rainforest");
  });

  test("an unknown ?p= is ignored", async ({ page }) => {
    await page.goto("/photos?p=%3Cscript%3E", { waitUntil: "networkidle" });
    expect(await dialogOpen(page)).toBe(false);
  });
});

test("/life links to OTL and the booking email", async ({ page }) => {
  await page.goto("/life", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "See what’s next" })).toHaveAttribute("href", "https://otl-kappa.vercel.app");
  await expect(page.getByRole("link", { name: "Book a shoot" })).toHaveAttribute("href", /^mailto:/);
});
