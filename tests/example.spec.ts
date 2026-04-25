import { test, expect } from '@playwright/test';

test('student home is protected and redirects to login', async ({ page }) => {
  await page.goto('http://localhost:3000/student/home', { waitUntil: 'domcontentloaded' });

  // Protected route should redirect unauthenticated users to login.
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
});

test('login page renders interactive elements', async ({ page }) => {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/login/);

  page.on('pageerror', (error) => {
    console.log('PAGE ERROR:', error.message);
  });

  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible({ timeout: 10000 });
});

test('root route responds successfully', async ({ page }) => {
  const response = await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
});
