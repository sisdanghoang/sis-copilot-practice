# ユニットテスト仕様

## 概要

ユニットテストは、TaskFlowアプリケーションの個々のコンポーネント、関数、モジュールが独立して正しく動作することを検証するために実施されます。

## 対象

ユニットテストの対象は以下の通りです。

-   **UIコンポーネント**: `TaskCard`, `TaskForm`, `TaskList`, `Providers` など
-   **ユーティリティ関数**: `cosmosHelpers`, `errorHandling` など
-   **カスタムフック**: `useTasks`

## ツール

-   **Jest**: テストランナー、アサーションライブラリ、モッキングフレームワークとして使用します。
-   **React Testing Library**: Reactコンポーネントのレンダリングとインタラクションをテストするためのユーティリティを提供します。

## テストファイルの配置

ユニットテストのファイルは、`tests/unit` ディレクトリ内に配置します。テストファイルの命名規則は `[対象ファイル名].test.ts` または `[対象ファイル名].test.tsx` とします。

例:

-   `components/TaskCard.tsx` のテスト -> `tests/unit/components/TaskCard.test.tsx`
-   `lib/cosmosHelpers.ts` のテスト -> `tests/unit/lib/cosmosHelpers.test.ts`

## テストの記述方法

### 基本構造

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
// テスト対象のコンポーネントや関数をインポート
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // テストのセットアップ (propsの準備など)
    render(<MyComponent />);
    // アサーション (期待される結果の確認)
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    // テストのセットアップ
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    // ユーザーインタラクションのシミュレーション
    fireEvent.click(screen.getByRole('button'));
    // アサーション
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### モッキング

-   **外部依存関係のモック**: `jest.mock()` を使用して、外部モジュールや関数をモックします。
-   **Cosmos DBのモック**: `cosmosHelpers` モジュールをモックして、テスト中に実際のデータベースアクセスが発生しないようにします。

```typescript
// 例: cosmosHelpers.tsのモック
jest.mock('../lib/cosmosHelpers');

// モックの実装
import { getTasks } from '../lib/cosmosHelpers';
(getTasks as jest.Mock).mockResolvedValue([
  {
    id: '1',
    title: 'Task 1',
    // ... other properties
  },
]);
```

### テストケースの例

#### `TaskCard` コンポーネント

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '@/components/TaskCard';
import useTasks from '@/hooks/useTasks';

jest.mock('../hooks/useTasks');

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task.',
    status: 'not_started',
    priority: 'medium',
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders task information correctly', () => {
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task.')).toBeInTheDocument();
    expect(screen.getByText('Status: not_started')).toBeInTheDocument();
    expect(
      screen.getByText(`Due Date: ${mockTask.dueDate.toLocaleDateString()}`)
    ).toBeInTheDocument();
  });

  it('calls updateTask when status changes', async () => {
    const mockUpdateTask = jest.fn();
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: mockUpdateTask,
      deleteTask: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Mark as Completed' })
    );

    expect(mockUpdateTask).toHaveBeenCalledWith({
      ...mockTask,
      status: 'completed',
    });
  });

  it('calls deleteTask when delete button is clicked', async () => {
    const mockDeleteTask = jest.fn();
    (useTasks as jest.Mock).mockReturnValue({
      updateTask: jest.fn(),
      deleteTask: mockDeleteTask,
    });

    render(<TaskCard task={mockTask} />);

    await userEvent.click(screen.getByRole('button', { name: /trash/i }));

    expect(mockDeleteTask).toHaveBeenCalledWith('1');
  });
});
```

#### `cosmosHelpers` の `getTasks` 関数

```typescript
import { getTasks, toTask } from '../../lib/cosmosHelpers';
import { container } from '../../lib/cosmosdb';
import { CosmosTask, Task } from '../../lib/types';

jest.mock('../../lib/cosmosdb', () => ({
  container: {
    items: {
      query: jest.fn().mockReturnValue({
        fetchAll: jest.fn(),
      }),
    },
  },
}));

describe('cosmosHelpers', () => {
  describe('getTasks', () => {
    it('should return an array of tasks', async () => {
      const mockCosmosTasks: CosmosTask[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'not_started',
          priority: 'low',
          dueDate: new Date('2023-12-31'),
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          type: 'task',
          _partitionKey: '1'
        },
      ];
      const expectedTasks: Task[] = mockCosmosTasks.map(toTask);

      (container.items.query().fetchAll as jest.Mock).mockResolvedValue({
        resources: mockCosmosTasks,
      });

      const tasks = await getTasks();

      expect(tasks).toEqual(expectedTasks);
      expect(container.items.query).toHaveBeenCalledWith("SELECT * from c");
      expect(container.items.query().fetchAll).toHaveBeenCalled();
    });

    it('should throw an error when the database query fails', async () => {
      const errorMessage = 'Database query failed';
      (container.items.query().fetchAll as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(getTasks()).rejects.toThrow(errorMessage);
      expect(container.items.query).toHaveBeenCalledWith("SELECT * from c");
      expect(container.items.query().fetchAll).toHaveBeenCalled();
    });
  });
});
```

## テストの実行

-   **すべてのユニットテストを実行**: `npm run test`
-   **特定のファイルを指定して実行**: `npx jest <ファイルパス>` (例: `npx jest tests/unit/components/TaskCard.test.tsx`)
-   **監視モードで実行**: `npm run test` (ファイルの変更を監視し、関連するテストを自動的に再実行します)
-   **カバレッジレポートの生成**: `npx jest --coverage`

## ベストプラクティス

-   **テストの独立性**: 各テストケースは独立して実行できるようにします。
-   **モックの活用**: 外部依存関係を適切にモックし、テスト対象のユニットに焦点を当てます。
-   **境界条件のテスト**: 正常系だけでなく、エラーケースや境界条件もテストします。
-   **テストの可読性**: テストコードは、読みやすく、理解しやすいように記述します。
-   **テストの保守性**: リファクタリングを行う際は、既存のテストがパスすることを確認します。
-   **カバレッジの維持**: 高いテストカバレッジを維持します (ステートメント: 80%以上, 分岐: 75%以上, 関数: 90%以上, 行: 80%以上)。
