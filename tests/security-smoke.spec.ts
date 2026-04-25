import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/login", "/helpandsupport"] as const;
const PROTECTED_ROUTES = ["/student/home", "/signatory/home", "/admin/home"] as const;

test.describe("security smoke scan", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`public route is stable: ${route}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
      expect(pageErrors, `runtime errors on ${route}`).toEqual([]);
    });
  }

  for (const route of PROTECTED_ROUTES) {
    test(`protected route redirects unauthenticated users: ${route}`, async ({ page }) => {
      const response = await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(500);
      await expect(page).toHaveURL(/\/login|\/unauthorized/);
    });
  }
});
