const { chromium } = require('@playwright/test');
const fs = require('fs');

async function audit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[ERROR] ${error.message}`));
  
  await page.goto('http://localhost:3000/login');
  
  // Test Admin Login
  await page.fill('input[type="email"]', 'jabez.bautista@bisu.edu.ph');
  await page.fill('input[type="password"]', 'bautista101');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);
  logs.push(`Admin login url: ${page.url()}`);
  
  // Logout
  await page.goto('http://localhost:3000/login'); // Reset
  
  // Test Signatory Login
  await page.fill('input[type="email"]', 'alvin.remolado@bisu.edu.ph');
  await page.fill('input[type="password"]', 'Remolado200');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);
  logs.push(`Signatory login url: ${page.url()}`);

  // Logout
  await page.goto('http://localhost:3000/login'); // Reset

  // Test Student Login
  await page.fill('input[type="email"]', 'erica.arnaiz@bisu.edu.ph');
  await page.fill('input[type="password"]', 'Arnaiz5001');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);
  logs.push(`Student login url: ${page.url()}`);

  fs.writeFileSync('audit_logs.txt', logs.join('\n'));
  await browser.close();
}

audit().catch(console.error);
