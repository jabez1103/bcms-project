import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD;

const PUBLIC_ROUTES = ["/", "/login", "/helpandsupport"] as const;
const PROTECTED_ROUTES = ["/student/home", "/signatory/home", "/admin/home"] as const;

const RISKY_BUTTON_TEXT = [
  /delete/i,
  /remove/i,
  /deactivate/i,
  /reset/i,
  /import/i,
  /submit/i,
  /save/i,
  /register/i,
  /update/i,
  /confirm/i,
  /logout/i,
];

async function collectAndTestButtons(page: Parameters<typeof test>[0]["page"]) {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  const buttons = page.getByRole("button");
  const totalVisible = await buttons.count();

  let clicked = 0;
  let skippedRisky = 0;
  let skippedDisabled = 0;

  for (let i = 0; i < totalVisible; i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible())) continue;

    const label = ((await button.innerText()) || "").trim();
    const isDisabled =
      (await button.isDisabled()) ||
      (await button.getAttribute("aria-disabled")) === "true";
    if (isDisabled) {
      skippedDisabled++;
      continue;
    }

    if (RISKY_BUTTON_TEXT.some((pattern) => pattern.test(label))) {
      skippedRisky++;
      continue;
    }

    await button.hover();
    await expect(button).toBeVisible();

    const beforeUrl = page.url();
    await button.click({ timeout: 5000 });
    await page.waitForTimeout(150);
    const afterUrl = page.url();

    // If route changes, go back so we can continue auditing current page.
    if (afterUrl !== beforeUrl) {
      await page.goto(beforeUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(150);
    }
    clicked++;
  }

  expect(runtimeErrors, "Runtime errors found while button testing").toEqual([]);
  return { totalVisible, clicked, skippedRisky, skippedDisabled };
}

test.describe("button coverage scan", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`public button functionality smoke: ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      const result = await collectAndTestButtons(page);

      expect(result.totalVisible).toBeGreaterThanOrEqual(0);
    });
  }

  for (const route of PROTECTED_ROUTES) {
    test(`protected route auth behavior and button safety: ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/login|\/unauthorized/);

      // Login page itself should keep button interaction stable.
      const result = await collectAndTestButtons(page);
      expect(result.totalVisible).toBeGreaterThanOrEqual(0);
    });
  }

  test("authenticated student button scan (if credentials provided)", async ({ page }) => {
    test.skip(
      !STUDENT_EMAIL || !STUDENT_PASSWORD,
      "Set E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD to run authenticated button coverage."
    );

    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"], input[name="email"]').first().fill(STUDENT_EMAIL ?? "");
    await page.locator('input[type="password"], input[name="password"]').first().fill(STUDENT_PASSWORD ?? "");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/\/(student\/home|$)/, { timeout: 15000 });
    if (!/\/student\/home$/.test(page.url())) {
      await page.goto(`${BASE_URL}/student/home`, { waitUntil: "domcontentloaded" });
    }

    const result = await collectAndTestButtons(page);
    expect(result.clicked + result.skippedRisky + result.skippedDisabled).toBeGreaterThanOrEqual(1);
  });
});
