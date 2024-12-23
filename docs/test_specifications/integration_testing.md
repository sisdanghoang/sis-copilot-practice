# 統合テスト仕様

## 概要

統合テストは、TaskFlowアプリケーションの複数のコンポーネントやモジュールが連携して正しく動作することを確認するために実施されます。

## 対象

統合テストの対象は以下の通りです。

-   **コンポーネント間のインタラクション**:
    -   `TaskList` と `TaskCard` の連携
    -   `TaskForm` と `TaskFormModal` の連携
-   **APIとの連携**:
    -   `useTasks` フックとAPIルート (`/api/tasks`) の連携
    -   コンポーネントとAPIルートの連携 (データの取得、作成、更新、削除)
-   **状態管理**:
    -   React Queryによるデータの取得、キャッシュ、更新が正しく行われること

## ツール

-   **Jest**: テストランナー、アサーションライブラリ、モッキングフレームワークとして使用します。
-   **React Testing Library**: Reactコンポーネントのレンダリングとインタラクションをテストするためのユーティリティを提供します。

## テストファイルの配置

統合テストのファイルは、`tests/unit` ディレクトリ内に配置します。ユニットテストと統合テストを区別するために、ファイル名に `.integration.test.ts` または `.integration.test.tsx` のサフィックスを使用することを推奨します。

例:

-   `TaskList` と `TaskCard` の連携のテスト -> `tests/unit/components/TaskList.integration.test.tsx`
-   `useTasks` とAPIルートの連携のテスト -> `tests/unit/hooks/useTasks.integration.test.ts`

## テストの記述方法

### 基本構造

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// テスト対象のコンポーネントやフックをインポート
import TaskList from '../components/TaskList';
import useTasks from '../hooks/useTasks';
// 必要に応じて、モック用のコンポーネントやAPIをインポート
import { QueryClient, QueryClientProvider } from 'react-query';

describe('TaskList and TaskCard integration', () => {
  const queryClient = new QueryClient();
  it('should display tasks fetched from the API', async () => {
    // モックAPIのセットアップ
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        // ... other properties
      },
    ];
    (useTasks as jest.Mock).mockReturnValue({
        tasks: mockTasks,
        status: 'success',
        error: null,
        refetch: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn()
    });

    // コンポーネントのレンダリング
    render(
      <QueryClientProvider client={queryClient}>
        <TaskList />
      </QueryClientProvider>
    );

    // データが取得され、表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });
});
```

### モッキング

-   **APIのモック**: `axios` や `fetch` などのHTTPクライアントをモックして、テスト中に実際のAPIリクエストが発生しないようにします。
-   **`useTasks` フックのモック**: `useTasks` フックをモックして、APIとの連携をテストする際に、データの取得や更新をシミュレートします。

```typescript
// 例: axiosを使用したAPIのモック
jest.mock('axios');
import axios from 'axios';

(axios.get as jest.Mock).mockResolvedValue({
  data: [
    {
      id: '1',
      title: 'Task 1',
      // ... other properties
    },
  ],
});

// 例: useTasksフックのモック
jest.mock('../hooks/useTasks');
import useTasks from '../hooks/useTasks';

(useTasks as jest.Mock).mockReturnValue({
  tasks: [],
  status: 'loading',
  error: null,
  refetch: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
});
```

### テストケースの例

#### `TaskList` と `TaskCard` の連携

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import useTasks from '@/hooks/useTasks';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../hooks/useTasks');

describe('TaskList and TaskCard integration', () => {
  const queryClient = new QueryClient();
  it('should display tasks fetched from useTasks', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'not_started',
        priority: 'low',
        dueDate: new Date('2023-12-31'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2024-06-30'),
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
      },
    ];
    (useTasks as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      status: 'success',
      error: null,
      refetch: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Status: not_started')).toBeInTheDocument();
    expect(screen.getByText('Status: in_progress')).toBeInTheDocument();
  });
});
```

#### `useTasks` フックと APIルートの連携

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useTasks from '@/hooks/useTasks';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('axios');

describe('useTasks and API integration', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (axios.patch as jest.Mock).mockClear();
    (axios.delete as jest.Mock).mockClear();
    queryClient.clear();
  });

  it('should fetch tasks from the API', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'not_started',
        priority: 'low',
        dueDate: new Date('2023-12-31'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: mockTasks });

    const { result, waitFor } = renderHook(() => useTasks(), { wrapper });

    await waitFor(() => result.current.status === 'success');

    expect(axios.get).toHaveBeenCalledWith('/api/tasks');
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should create a new task via the API', async () => {
    const newTask = {
      id: '2',
      title: 'New Task',
      description: 'New Description',
      status: 'not_started',
      priority: 'medium',
      dueDate: new Date('2024-03-31'),
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
    };
    (axios.post as jest.Mock).mockResolvedValue({ data: newTask });

    const { result, waitForNextUpdate } = renderHook(() => useTasks(), {
      wrapper,
    });

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitForNextUpdate();

    expect(axios.post).toHaveBeenCalledWith('/api/tasks', newTask);
    expect(result.current.tasks).toContainEqual(newTask);
  });
});
```

## テストの実行

-   **すべての統合テストを実行**: `npm run test` (ユニットテストも一緒に実行されます)
-   **特定のファイルを指定して実行**: `npx jest <ファイルパス>` (例: `npx jest tests/unit/components/TaskList.integration.test.tsx`)
-   **監視モードで実行**: `npm run test` (ファイルの変更を監視し、関連するテストを自動的に再実行します)

## ベストプラクティス

-   **テストの独立性**: 各テストケースは独立して実行できるようにします。
-   **適切なモッキング**: 外部依存関係を適切にモックし、テスト対象のユニットに焦点を当てます。
-   **実際のユーザーインタラクションのシミュレーション**: ユーザーの操作を可能な限り忠実に再現します。
-   **エッジケースのテスト**: 正常系だけでなく、エラーケースや境界条件もテストします。
-   **テストの可読性**: テストコードは、読みやすく、理解しやすいように記述します。
-   **テストの保守性**: リファクタリングを行う際は、既存のテストがパスすることを確認します。
