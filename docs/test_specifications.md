# TaskFlow - テスト仕様書

## テスト戦略概要

### テストレベル
1. **ユニットテスト**
   - 個別コンポーネントのテスト
   - ユーティリティ関数のテスト
   - カスタムフックのテスト

2. **統合テスト**
   - コンポーネント間の連携テスト
   - APIとの連携テスト
   - 状態管理のテスト

3. **E2Eテスト**
   - ユーザーフローのテスト
   - クリティカルパスのテスト
   - エラーケースのテスト

## ユニットテスト仕様

### TaskCardコンポーネント

#### テストケース
1. **初期表示テスト**
   ```typescript
   test('タスクの情報が正しく表示されること', () => {
     const task = {
       id: '1',
       title: 'テストタスク',
       description: '説明文',
       status: 'todo',
       priority: 'high'
     };
     render(<TaskCard task={task} />);

     expect(screen.getByText('テストタスク')).toBeInTheDocument();
     expect(screen.getByText('説明文')).toBeInTheDocument();
   });
   ```

2. **ステータス変更テスト**
   ```typescript
   test('ステータス変更が正しく動作すること', async () => {
     const onStatusChange = jest.fn();
     const task = { id: '1', title: 'テストタスク', description: '説明文', status: 'todo', priority: 'high' }; // Define task here
     render(<TaskCard task={task} onStatusChange={onStatusChange} />);

     await userEvent.click(screen.getByRole('button', { name: '開始' })); // Assuming a button with "開始" text/label
     expect(onStatusChange).toHaveBeenCalledWith('1', 'in_progress');
   });
   ```

3. **削除機能テスト**
   ```typescript
   test('削除ボタンが正しく動作すること', async () => {
     const onDelete = jest.fn();
     const task = { id: '1', title: 'テストタスク', description: '説明文', status: 'todo', priority: 'high' }; // Define task here
     render(<TaskCard task={task} onDelete={onDelete} />);

     await userEvent.click(screen.getByRole('button', { name: '削除' })); // Assuming a button with "削除" text/label
     expect(onDelete).toHaveBeenCalledWith('1');
   });
   ```

### APIサービス

#### テストケース
1. **タスク取得テスト**
   ```typescript
   test('タスク一覧を正しく取得できること', async () => {
     const mockTasks = [{ id: '1', title: 'タスク1', description: '説明', status: 'todo', priority: 'low' }]; // Example task data
     global.fetch = jest.fn().mockResolvedValueOnce({
       json: async () => ({ tasks: mockTasks }),
       ok: true,
     });

     const result = await api.getTasks();
     expect(result).toEqual(mockTasks);
   });
   ```

2. **エラーハンドリングテスト**
   ```typescript
   test('APIエラーが適切にハンドリングされること', async () => {
     global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

     await expect(api.getTasks()).rejects.toThrow('API Error');
   });
   ```

## E2Eテスト仕様

### Playwrightテストケース

1. **タスク作成フロー**
   ```typescript
   test('新規タスクを作成できること', async ({ page }) => {
     await page.goto('/tasks');
     await page.getByRole('button', { name: '新規タスク' }).click();
     await page.locator('[name="title"]').fill('テストタスク');
     await page.locator('[name="description"]').fill('説明文');
     await page.locator('[name="priority"]').selectOption('high');
     await page.getByRole('button', { name: '保存' }).click();

     await expect(page.locator('text=テストタスク')).toBeVisible();
   });
   ```

2. **タスク編集フロー**
   ```typescript
   test('既存タスクを編集できること', async ({ page }) => {
     // Assuming a task with id '1' exists for editing
     await page.goto('/tasks/1');
     await page.getByRole('button', { name: '編集' }).click();
     await page.locator('[name="title"]').fill('更新後のタイトル');
     await page.getByRole('button', { name: '保存' }).click();

     await expect(page.locator('text=更新後のタイトル')).toBeVisible();
   });
   ```

3. **タスクフィルタリング**
   ```typescript
   test('優先度でフィルタリングできること', async ({ page }) => {
     await page.goto('/tasks');
     await page.locator('[data-testid="priority-filter"]').selectOption('high');

     // Adjust the locator based on how priority is displayed in the UI
     await expect(page.locator('[data-priority="high"]')).toHaveCount(3);
   });
   ```

## テスト環境設定

### Jest設定
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ]
};
```

### Playwright設定
```javascript
module.exports = {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## テスト実行手順

### 開発時
```bash
# ユニットテスト（監視モード）
npm run test:watch

# 特定のテストファイル実行
npm run test TaskCard.test.tsx

# E2Eテスト（開発モード）
npm run test:e2e:dev
```

### CI環境
```bash
# 全テスト実行
npm run test:all

# カバレッジレポート生成
npm run test:coverage
```

## 品質基準

### カバレッジ要件
- ステートメントカバレッジ: 80%以上
- 分岐カバレッジ: 75%以上
- 関数カバレッジ: 90%以上

### パフォーマンス要件
- E2Eテスト実行時間: 5分以内
- ユニットテスト実行時間: 1分以内