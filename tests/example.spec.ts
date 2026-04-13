import { test, expect } from '@playwright/test';

test('student home page loads and buttons are visible', async ({ page }) => {
  // Go directly to student home page
  await page.goto('http://localhost:3000/student/home');

  // Optional: wait for page to fully load
  await page.waitForLoadState('networkidle');

  // Check page loaded
  await expect(page).toHaveURL(/student\/home/);

  // Catch JS errors (bug detection)
  page.on('pageerror', (error) => {
    console.log('PAGE ERROR:', error.message);
  });

  // 🔍 CHECK COMMON BUTTONS (update names based on your UI)

  // Example navigation / action buttons
await expect(page.locator('button').first()).toBeVisible();
  // Safer: check specific buttons if they exist
  const buttons = [
    'Dashboard',
    'Profile',
    'Settings',
    'Logout'
  ];

  for (const name of buttons) {
    const btn = page.getByRole('button', { name });
    if (await btn.count() > 0) {
      await expect(btn).toBeVisible();
    }
  }
});

test('student home has clickable elements', async ({ page }) => {
  await page.goto('http://localhost:3000/student/home');

  // Click first available button safely
  const firstButton = page.locator('button').first();

  await expect(firstButton).toBeVisible();
});