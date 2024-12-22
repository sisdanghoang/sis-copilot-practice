# TaskFlow - Azure Cosmos DB 統合詳細仕様書

## 1. Azure Cosmos DBセットアップ

### 1.1 データベース構成
```json
{
  "databaseName": "taskflow-db",
  "containerId": "tasks",
  "partitionKey": "/id",
  "throughput": 400
}
```

### 1.2 環境変数設定
```env
# .env.local
AZURE_COSMOS_CONNECTION_STRING=your_connection_string
AZURE_COSMOS_DATABASE_NAME=taskflow-db
AZURE_COSMOS_CONTAINER_NAME=tasks
```

## 2. データモデルとスキーマ

### 2.1 ベースタスクインターフェース
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Cosmos DB用タスクモデル
```typescript
interface CosmosTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;  // ISO 8601形式
  updatedAt: string;  // ISO 8601形式
  type: 'task';       // ドキュメント種別識別用
  _partitionKey: string; // パーティションキー
}
```

## 3. データアクセス層実装

### 3.1 Cosmos DBクライアントセットアップ
```typescript
// lib/cosmosdb.ts
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING!);
const database = client.database(process.env.AZURE_COSMOS_DATABASE_NAME!);
const container = database.container(process.env.AZURE_COSMOS_CONTAINER_NAME!);

export { container };
```

### 3.2 データアクセスヘルパー
```typescript
// lib/cosmosHelpers.ts
import { container } from './cosmosdb';
import { CosmosTask, Task } from './types';

export const cosmosHelpers = {
  // Cosmos DBモデルからアプリケーションモデルへの変換
  toTask(cosmosTask: CosmosTask): Task {
    const { _partitionKey, type, ...rest } = cosmosTask;
    return {
      ...rest,
      createdAt: new Date(cosmosTask.createdAt),
      updatedAt: new Date(cosmosTask.updatedAt)
    };
  },

  // アプリケーションモデルからCosmos DBモデルへの変換
  toCosmosTask(task: Partial<Task>, id?: string): Partial<CosmosTask> {
    const taskId = id || crypto.randomUUID();
    return {
      ...task,
      id: taskId,
      _partitionKey: taskId,
      type: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // クエリ結果の変換
  async queryTasks(query: string): Promise<Task[]> {
    const { resources } = await container.items
      .query<CosmosTask>(query)
      .fetchAll();
    return resources.map(this.toTask);
  }
};
```

## 4. APIルート実装

### 4.1 タスク一覧取得
```typescript
// app/api/tasks/route.ts
import { container } from '@/lib/cosmosdb';
import { cosmosHelpers } from '@/lib/cosmosHelpers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await cosmosHelpers.queryTasks(
      'SELECT * FROM c WHERE c.type = "task" ORDER BY c.createdAt DESC'
    );
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
```

### 4.2 タスク作成
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cosmosTask = cosmosHelpers.toCosmosTask(body);
    const { resource } = await container.items.create(cosmosTask);
    return NextResponse.json(cosmosHelpers.toTask(resource));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
```

## 5. パフォーマンス最適化

### 5.1 インデックス設定
```json
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    {
      "path": "/*"
    }
  ],
  "excludedPaths": [
    {
      "path": "/description/?"
    }
  ],
  "compositeIndexes": [
    [
      {
        "path": "/type",
        "order": "ascending"
      },
      {
        "path": "/createdAt",
        "order": "descending"
      }
    ]
  ]
}
```

### 5.2 クエリ最適化戦略
1. パーティションキーの効率的な使用
2. 複合インデックスの活用
3. プロジェクション最適化
4. ページネーションの実装

## 6. エラーハンドリング

### 6.1 カスタムエラークラス
```typescript
class CosmosDBError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CosmosDBError';
  }
}
```

### 6.2 エラーハンドリングパターン
```typescript
// lib/errorHandling.ts
export const handleCosmosError = (error: any) => {
  if (error.code === 409) {
    return new CosmosDBError(
      'Document already exists',
      409,
      'DOCUMENT_EXISTS'
    );
  }
  if (error.code === 404) {
    return new CosmosDBError(
      'Document not found',
      404,
      'DOCUMENT_NOT_FOUND'
    );
  }
  return new CosmosDBError(
    'Internal server error',
    500,
    'INTERNAL_ERROR'
  );
};
```

## 7. テスト実装

### 7.1 Cosmos DBモック
```typescript
// __mocks__/@azure/cosmos.ts
export const mockContainer = {
  items: {
    create: jest.fn(),
    upsert: jest.fn(),
    query: jest.fn().mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [] })
    }),
    delete: jest.fn(),
    item: jest.fn().mockReturnValue({
      delete: jest.fn(),
      replace: jest.fn(),
      read: jest.fn()
    })
  }
};

export const CosmosClient = jest.fn().mockImplementation(() => ({
  database: jest.fn().mockReturnValue({
    container: jest.fn().mockReturnValue(mockContainer)
  })
}));

// テスト実装例
describe('Cosmos DB Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('タスクの作成', async () => {
    const task = {
      title: 'テストタスク',
      description: '説明',
      priority: 'high'
    };

    mockContainer.items.create.mockResolvedValueOnce({
      resource: {
        ...task,
        id: '123',
        _partitionKey: '123',
        type: 'task',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });

    expect(response.status).toBe(200);
    expect(mockContainer.items.create).toHaveBeenCalled();
  });
});