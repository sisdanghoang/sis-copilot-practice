# TaskFlow - Azure Cosmos DB 統合仕様書

## 1. Cosmos DB 設定

### 1.1 データベース構成
```json
{
  "databaseName": "taskflow-db",
  "containerId": "tasks",
  "partitionKey": "/id"
}
```

### 1.2 必要な環境変数
```env
AZURE_COSMOS_CONNECTION_STRING=your_connection_string
AZURE_COSMOS_DATABASE_NAME=taskflow-db
AZURE_COSMOS_CONTAINER_NAME=tasks
```

## 2. データモデル

### 2.1 Cosmos DB用タスクスキーマ
```typescript
interface CosmosTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;  // ISO 8601 形式
  updatedAt: string;  // ISO 8601 形式
  type: 'task';       // ドキュメント種別識別用
  _partitionKey: string; // partitionKey用（idと同じ値）
}
```

## 3. API実装

### 3.1 Cosmos DBクライアントセットアップ
```typescript
// lib/cosmosdb.ts
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING!);
const database = client.database(process.env.AZURE_COSMOS_DATABASE_NAME!);
const container = database.container(process.env.AZURE_COSMOS_CONTAINER_NAME!);

export { container };
```

### 3.2 APIルート実装

#### タスク取得 (GET /api/tasks)
```typescript
// app/api/tasks/route.ts
import { container } from '@/lib/cosmosdb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { resources } = await container.items
      .query('SELECT * FROM c WHERE c.type = "task" ORDER BY c.createdAt DESC')
      .fetchAll();

    return NextResponse.json({ tasks: resources });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
```

#### タスク作成 (POST /api/tasks)
```typescript
// app/api/tasks/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskId = crypto.randomUUID();

    const task: CosmosTask = {
      id: taskId,
      _partitionKey: taskId,
      type: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body
    };

    const { resource } = await container.items.create(task);
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
```

#### タスク更新 (PATCH /api/tasks/[id])
```typescript
// app/api/tasks/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { resource } = await container.item(params.id, params.id)
      .replace({
        ...body,
        id: params.id,
        _partitionKey: params.id,
        updatedAt: new Date().toISOString()
      });

    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
```

#### タスク削除 (DELETE /api/tasks/[id])
```typescript
// app/api/tasks/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await container.item(params.id, params.id).delete();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
```

## 4. クライアント側の更新

### 4.1 API Clientの更新
```typescript
// lib/api.ts
import { Task } from './types';

export const api = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();
    return data.tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  },

  // 他のメソッドも同様に更新
};
```

## 5. セットアップ手順

1. Azure Portalで新しいCosmos DBアカウントを作成
2. データベースとコンテナを作成
3. 必要な環境変数を設定
4. 依存パッケージのインストール:
```bash
npm install @azure/cosmos
```

## 6. インデックス設定

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
  ]
}
```

## 7. パフォーマンス最適化

1. クエリのパーティションキー利用
2. インデックスの最適化
3. 適切なRU/s設定
4. キャッシュ戦略の実装

## 8. エラーハンドリング

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

// エラーハンドリング例
try {
  await container.items.create(task);
} catch (error) {
  if (error.code === 409) {
    throw new CosmosDBError('タスクが既に存在します', 409, 'TASK_EXISTS');
  }
  throw new CosmosDBError('タスクの作成に失敗しました', 500);
}
```