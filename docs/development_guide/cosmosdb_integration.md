# Azure Cosmos DB 統合

このドキュメントでは、TaskFlowアプリケーションとAzure Cosmos DBの統合について説明します。

## 概要

TaskFlowアプリケーションでは、データストアとしてAzure Cosmos DBを使用しています。Cosmos DBは、Microsoftが提供するフルマネージドのNoSQLデータベースサービスであり、高いスケーラビリティと可用性を提供します。

## データベース構成

-   **データベース名**: `taskflow-db`
-   **コンテナー名**: `tasks`
-   **パーティションキー**: `/id`
-   **スループット**: 400 RU/s (プロビジョニングスループット)

## 接続情報

Cosmos DBへの接続情報は、環境変数として設定されます。

-   `AZURE_COSMOSDB_ENDPOINT`: Cosmos DBのエンドポイントURL
-   `AZURE_COSMOSDB_KEY`: Cosmos DBのプライマリキー
-   `AZURE_COSMOS_DATABASE_NAME`: データベース名 (`taskflow-db`)
-   `AZURE_COSMOS_CONTAINER_NAME`: コンテナー名 (`tasks`)

これらの環境変数は、`.env.local` ファイルで設定します。

## クライアント設定 (`lib/cosmosdb.ts`)

`lib/cosmosdb.ts` ファイルでは、`@azure/cosmos` ライブラリを使用してCosmos DBクライアントを初期化し、設定します。

```typescript
import { CosmosClient } from "@azure/cosmos";

const COSMOSDB_ENDPOINT = process.env.AZURE_COSMOSDB_ENDPOINT;
const COSMOSDB_KEY = process.env.AZURE_COSMOSDB_KEY;
const DATABASE_NAME = process.env.AZURE_COSMOS_DATABASE_NAME;
const CONTAINER_NAME = process.env.AZURE_COSMOS_CONTAINER_NAME;

if (!COSMOSDB_ENDPOINT || !COSMOSDB_KEY || !DATABASE_NAME || !CONTAINER_NAME) {
  throw new Error("Cosmos DBの接続情報が環境変数に設定されていません");
}

const client = new CosmosClient({
  endpoint: COSMOSDB_ENDPOINT,
  key: COSMOSDB_KEY
});
const database = client.database(DATABASE_NAME);
const container = database.container(CONTAINER_NAME);

console.log(`Cosmos DB接続情報:
  Database: ${DATABASE_NAME}
  Container: ${CONTAINER_NAME}
`);

export { client, database, container };
```

-   `CosmosClient` インスタンスは、アプリケーション全体で共有されます。
-   `database` と `container` オブジェクトは、`cosmosHelpers.ts` で使用されます。

## ヘルパー関数 (`lib/cosmosHelpers.ts`)

`lib/cosmosHelpers.ts` ファイルでは、Cosmos DBへのデータアクセスを抽象化するヘルパー関数群を提供します。

### データモデル変換

-   **`toTask(cosmosTask: CosmosTask): Task`**: `CosmosTask` オブジェクトを `Task` オブジェクトに変換します。
-   **`toCosmosTask(task: Task): CosmosTask`**: `Task` オブジェクトを `CosmosTask` オブジェクトに変換します。

### CRUD操作

-   **`getTasks(): Promise<Task[]>`**: すべてのタスクを取得します。
-   **`getTask(id: string): Promise<Task>`**: 指定されたIDのタスクを取得します。
-   **`createTask(task: Task): Promise<Task>`**: 新しいタスクを作成します。
-   **`updateTask(id: string, task: Task): Promise<Task>`**: 指定されたIDのタスクを更新します。
-   **`deleteTask(id: string): Promise<void>`**: 指定されたIDのタスクを削除します。

```typescript
import { container } from "./cosmosdb";
import { Task, CosmosTask } from "./types";
import { handleCosmosError } from "./errorHandling";

// データ変換関数
export const toTask = (cosmosTask: CosmosTask): Task => ({
  id: cosmosTask.id,
  title: cosmosTask.title,
  description: cosmosTask.description,
  status: cosmosTask.status,
  priority: cosmosTask.priority,
  dueDate: cosmosTask.dueDate,
  createdAt: new Date(cosmosTask.createdAt),
  updatedAt: new Date(cosmosTask.updatedAt)
});

export const toCosmosTask = (task: Task): CosmosTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  type: 'task',
  _partitionKey: task.id
});

// CRUD操作関数
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { resources } = await container.items.query<CosmosTask>("SELECT * from c").fetchAll();
    return resources.map(toTask);
  } catch (error) {
    throw handleCosmosError(error);
  }
};

export const getTask = async (id: string): Promise<Task> => {
  try {
    const { resource } = await container.item(id, id).read<CosmosTask>();
    if (!resource) {
      throw new Error(`Task with id ${id} not found.`);
    }
    return toTask(resource);
  } catch (error) {
    throw handleCosmosError(error);
  }
};

export const createTask = async (task: Task): Promise<Task> => {
  try {
    const cosmosTask = toCosmosTask(task);
    const { resource } = await container.items.create<CosmosTask>(cosmosTask);
    if (!resource) {
      throw new Error('Failed to create task.');
    }
    return toTask(resource);
  } catch (error) {
    throw handleCosmosError(error);
  }
};

export const updateTask = async (id: string, task: Task): Promise<Task> => {
  try {
    const cosmosTask = toCosmosTask(task);
    const { resource } = await container.item(id, id).replace<CosmosTask>(cosmosTask);
    if (!resource) {
      throw new Error(`Failed to update task with id ${id}.`);
    }
    return toTask(resource);
  } catch (error) {
    throw handleCosmosError(error);
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await container.item(id, id).delete();
  } catch (error) {
    throw handleCosmosError(error);
  }
};
```

### エラーハンドリング

-   Cosmos DBの操作中に発生したエラーは、`lib/errorHandling.ts` の `handleCosmosError` 関数を使用して処理されます。
-   `handleCosmosError` 関数は、エラーコードに基づいて適切なエラーメッセージを生成し、`CosmosDBError` オブジェクトをスローします。

```typescript
// lib/errorHandling.ts
import { CosmosClient, FeedResponse } from "@azure/cosmos";

export class CosmosDBError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CosmosDBError';
  }
}

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

## APIルートでの使用

`cosmosHelpers.ts` で定義されたヘルパー関数は、APIルート (`app/api/tasks`) で使用され、Cosmos DBへのデータアクセスを抽象化します。

```typescript
// app/api/tasks/route.ts
import { getTasks, createTask } from '../../../lib/cosmosHelpers';
import { Task } from '../../../lib/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Task = await request.json();
    const newTask = await createTask(body);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task', details: error }, { status: 400 });
  }
}
```

```typescript
// app/api/tasks/[id]/route.ts
import { getTask, updateTask, deleteTask } from '../../../../lib/cosmosHelpers';
import { Task } from '../../../../lib/types';
import { NextResponse } from 'next/server';

type PathParams = { params: { id: string } };

export async function GET(request: Request, { params }: PathParams) {
  const { id } = await params;
  try {
    const task = await getTask(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task', details: error }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: PathParams) {
  const { id } = await params;
  try {
    const body: Task = await request.json();
    const updatedTask = await updateTask(id, body);
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task', details: error }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: PathParams) {
  const { id } = await params;
  try {
    await deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task', details: error }, { status: 500 });
  }
}
```

## ベストプラクティス

-   **クエリの最適化**: 必要なデータのみを取得するようにクエリを最適化します。例えば、`SELECT *` の代わりに `SELECT c.id, c.title, c.status` のように必要なフィールドのみを指定します。
-   **パーティションキーの適切な設計**: 効率的なデータの分散とクエリのために、適切なパーティションキー (現在は `/id`) を設計します。
-   **インデックスの活用**: クエリのパフォーマンスを向上させるために、適切なインデックスを定義します。
-   **エラーハンドリング**: `handleCosmosError` 関数を使用して、Cosmos DBの操作中に発生したエラーを適切に処理し、ユーザーフレンドリーなエラーメッセージを返します。
-   **レート制限の考慮**: Cosmos DBのレート制限 (RU/s) を考慮し、アプリケーションがレート制限を超えないように設計します。必要に応じて、リトライ処理を実装します。
