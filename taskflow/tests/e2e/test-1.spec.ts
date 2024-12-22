import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '編集' }).first().click();
  await page.getByLabel('期限日').fill('2024-12-30');
  await page.getByLabel('状態').selectOption('in_progress');
  await page.getByRole('button', { name: '提出する' }).click();
  await expect(page.locator('text=12/30/2024')).toBeVisible();
});

