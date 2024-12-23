# E2E テスト仕様

## 概要

E2E (エンドツーエンド) テストは、TaskFlowアプリケーションのユーザーインターフェースからバックエンドのAPI、データベースまでのシステム全体を結合してテストし、ユーザーの視点からアプリケーションが正しく動作することを確認するために実施されます。

## 対象

E2Eテストでは、主に以下のユーザーシナリオをテストします。

-   **タスクの作成**: ユーザーが新しいタスクを作成できること
-   **タスクの表示**: ユーザーがタスクの一覧を表示できること
-   **タスクの詳細表示**: ユーザーが個々のタスクの詳細を表示できること
-   **タスクの編集**: ユーザーが既存のタスクを編集できること
-   **タスクの削除**: ユーザーがタスクを削除できること
-   **エラーハンドリング**: エラーが発生した際に、適切なエラーメッセージが表示されること

## ツール

-   **Playwright**: E2Eテストの自動化フレームワークとして使用します。Playwrightは、Chromium, Firefox, WebKitなどの主要なブラウザをサポートしており、クロスブラウザテストが可能です。
-   **Jest**: (補足) E2Eテストでは、Playwrightの組み込みのテストランナーを使用します。

## テストファイルの配置

E2Eテストのファイルは、`tests/e2e` ディレクトリ内に配置します。テストファイルは `.spec.ts` 拡張子を持ちます。

例:

-   `tests/e2e/createTask.spec.ts`
-   `tests/e2e/editTask.spec.ts`
-   `tests/e2e/deleteTask.spec.ts`

## テストの記述方法

### 基本構造

```typescript
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストケースの前に実行されるセットアップ処理
    await page.goto('/'); // アプリケーションのルートページに移動
  });

  test('should create a new task', async ({ page }) => {
    // タスク作成ボタンをクリック
    await page.getByRole('button', { name: 'タスクを作成' }).click();

    // フォームの入力
    await page.getByLabel('タイトル').fill('Test Task');
    await page.getByLabel('説明').fill('This is a test task.');
    await page.getByLabel('状態').selectOption('not_started');
    await page.getByLabel('優先度').selectOption('medium');
    await page.getByLabel('期限日').fill('2024-12-31');

    // 提出ボタンをクリック
    await page.getByRole('button', { name: '提出する' }).click();

    // タスクが作成されたことを確認
    await expect(page.getByText('Test Task')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    // 編集するタスクの存在を前提とする (事前に作成しておく)
     const task = {
      title: 'Task to Update',
      description: 'This task will be updated.',
      status: 'not_started',
      priority: 'medium',
      dueDate: new Date('2024-12-31'),
    };
    const response = await page.request.post('/api/tasks', { data: task });
    const createdTask = await response.json();

    // タスクの詳細ページに移動
    await page.goto(`/`);

    // 編集ボタンをクリック
    await page.locator('.task-list > .task-card').first().getByRole('button', { name: '編集' }).click();

    // フォームの入力
    await page.getByLabel('タイトル').fill('Updated Task');
    await page.getByLabel('説明').fill('This task has been updated.');
    await page.getByLabel('状態').selectOption('in_progress');
    await page.getByLabel('優先度').selectOption('high');
    await page.getByLabel('期限日').fill('2025-01-15');

    // 提出ボタンをクリック
    await page.getByRole('button', { name: '提出する' }).click();

    // タスクが更新されたことを確認
    await expect(page.getByText('Updated Task')).toBeVisible();
    await expect(page.getByText('This task has been updated.')).toBeVisible();
    await expect(page.getByText('Status: in_progress')).toBeVisible();
    await expect(page.getByText('Due Date: 2025/01/15')).toBeVisible();
  });

    test('should delete a task', async ({ page }) => {
    // テスト用のタスクを作成
    const task = {
      title: 'Task to Delete',
      description: 'This task will be deleted.',
      status: 'not_started',
      priority: 'low',
      dueDate: new Date('2024-12-31'),
    };
    const response = await page.request.post('/api/tasks', { data: task });
    const createdTask = await response.json();

    // タスクの詳細ページに移動
    await page.goto(`/`);

    // 削除ボタンをクリック
    await page.locator('.task-list > .task-card').first().getByRole('button', { name: /trash/i }).click();

    // タスクが削除されたことを確認
    await expect(page.getByText('Task to Delete')).not.toBeVisible();
  });
});
```

### 主なAPI

-   **`test()`**: テストケースを定義します。
-   **`test.describe()`**: 複数のテストケースをグループ化します。
-   **`test.beforeEach()`**: 各テストケースの前に実行されるセットアップ処理を定義します。
-   **`page.goto()`**: 指定されたURLに移動します。
-   **`page.getByRole()`**: 指定されたロールを持つ要素を取得します。
-   **`page.getByLabel()`**: 指定されたラベルに関連付けられたフォームコントロールを取得します。
-   **`page.getByText()`**: 指定されたテキストを含む要素を取得します。
-   **`page.locator()`**: 指定されたセレクターに一致する要素を取得します。
-   **`element.click()`**: 要素をクリックします。
-   **`element.fill()`**: フォームコントロールに値を入力します。
-   **`element.selectOption()`**: セレクトボックスのオプションを選択します。
-   **`expect()`**: アサーションを実行します。

## テストデータ

E2Eテストでは、テスト実行前にテスト用のデータベースに初期データを投入することができます。また、テスト実行後は、データベースを元の状態に戻すか、テストデータを削除する必要があります。

-   **テストデータの投入**:
    -   `globalSetup` を使用して、テスト実行前に一度だけ実行されるセットアップ処理を定義できます。
    -   `playwright.config.ts` で `globalSetup` を設定します。

    ```typescript
    // playwright.config.ts
    import { defineConfig } from '@playwright/test';

    export default defineConfig({
      // ... other configurations
      globalSetup: require.resolve('./global-setup'),
    });
    ```

    ```typescript
    // global-setup.ts
    import { chromium } from '@playwright/test';

    async function globalSetup(config) {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      // テストデータの投入処理を記述
      // 例: APIリクエストを使用してタスクを作成

      await browser.close();
    }

    export default globalSetup;
    ```

-   **テストデータのクリーンアップ**:
    -   `globalTeardown` を使用して、テスト実行後に一度だけ実行されるクリーンアップ処理を定義できます。
    -   `playwright.config.ts` で `globalTeardown` を設定します。

    ```typescript
    // playwright.config.ts
    import { defineConfig } from '@playwright/test';

    export default defineConfig({
      // ... other configurations
      globalTeardown: require.resolve('./global-teardown'),
    });
    ```

    ```typescript
    // global-teardown.ts
    import { chromium } from '@playwright/test';

    async function globalTeardown(config) {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      // テストデータのクリーンアップ処理を記述
      // 例: APIリクエストを使用してタスクを削除

      await browser.close();
    }

    export default globalTeardown;
    ```

## テストの実行

-   **すべてのE2Eテストを実行**: `npm run test:e2e`
-   **特定のファイルを指定して実行**: `npx playwright test <ファイルパス>` (例: `npx playwright test tests/e2e/createTask.spec.ts`)
-   **ヘッドレスモードで実行**: `npx playwright test --headed` (ブラウザを表示せずに実行)
-   **特定のブラウザで実行**: `npx playwright test --project=chromium` (例: Chromiumで実行)
-   **トレースの取得**: `npx playwright test --trace on` (テスト実行の詳細なトレース情報を取得)

## ベストプラクティス

-   **ユーザーの視点でテストを記述する**: ユーザーがアプリケーションをどのように操作するかを想定してテストシナリオを作成します。
-   **テストの独立性**: 各テストケースは独立して実行できるようにします。
-   **意味のあるアサーション**: テスト結果を検証するために、具体的で意味のあるアサーションを使用します。
-   **テストデータの管理**: テストデータの投入とクリーンアップを適切に行い、テストの再現性を確保します。
-   **ページオブジェクトの活用**: ページオブジェクトパターンを使用して、UI要素とのインタラクションを抽象化し、テストコードの保守性を向上させます。
-   **エラーケースのテスト**: 正常系だけでなく、エラーケースもテストします。
-   **定期的なテストの実行**: CI/CDパイプラインにE2Eテストを組み込み、定期的に実行します。
