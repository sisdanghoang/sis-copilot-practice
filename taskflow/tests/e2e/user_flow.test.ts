import { test, expect } from '@playwright/test';

test('既存タスクの編集', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '編集' }).first().click();
  await page.getByLabel('期限日').fill('2024-12-28');
  await page.getByLabel('状態').selectOption('in_progress');
  await page.getByRole('button', { name: '提出する' }).click();
  await expect(page.locator('text=12/28/2024')).toBeVisible();
});

test('新規タスクの作成', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await page.getByRole('button', { name: 'タスクを作成' }).click();
    await page.getByLabel('タイトル').click();
    await page.getByLabel('タイトル').fill('新しいタスク');
    await page.getByLabel('説明').click();
    await page.getByLabel('説明').fill('説明');
    await page.getByLabel('期限日').fill('2024-12-27');
    await page.getByLabel('優先度').selectOption('medium');
    await page.getByRole('button', { name: '提出する' }).click();
    await expect(page.locator('text=新しいタスク')).toBeVisible();
  });


test('タスクの削除', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'trash' }).first().click();
  await expect(page.getByText('タスクが削除されました')).toBeVisible();
});


test('必須フィールドのバリデーション', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'タスクを作成' }).click();
  await page.getByLabel('タイトル').click();
  await page.getByRole('button', { name: '提出する' }).click();
  await expect(page.getByText('タイトルは必須です')).toBeVisible();
});


test('タスク状態の変更', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: '編集' }).nth(2).click();
    await page.getByLabel('状態').selectOption('completed');
    await page.getByRole('button', { name: '提出する' }).click();
    await expect(page.getByText('Status: completed')).toBeVisible();
});

