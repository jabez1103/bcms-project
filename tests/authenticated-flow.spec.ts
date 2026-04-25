import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD;

test.describe("authenticated student flow", () => {
  test("login redirects to protected student dashboard", async ({ page }) => {
    test.skip(
      !STUDENT_EMAIL || !STUDENT_PASSWORD,
      "Set E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD to run authenticated flow."
    );

    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.getByRole("button", { name: /sign in|log in/i });

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeVisible({ timeout: 10000 });

    await emailInput.fill(STUDENT_EMAIL ?? "");
    await passwordInput.fill(STUDENT_PASSWORD ?? "");
    await submitButton.click();

    // Login may route directly to student home or pass through root first.
    await expect(page).toHaveURL(/\/(student\/home|$)/, { timeout: 15000 });

    if (!/\/student\/home$/.test(page.url())) {
      await page.goto(`${BASE_URL}/student/home`, { waitUntil: "domcontentloaded" });
    }

    await expect(page).toHaveURL(/\/student\/home/, { timeout: 15000 });
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});
