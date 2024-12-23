# データモデル

## タスク (Task)

TaskFlowアプリケーションの中心となるデータモデルは `Task` です。`Task` は、ユーザーが管理する個々のタスクを表します。

### アプリケーション用 `Task` モデル

アプリケーション内で使用される `Task` モデルの型定義は以下の通りです。

```typescript
// lib/types.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

-   **id**: タスクの一意の識別子 (UUID)
-   **title**: タスクのタイトル
-   **description**: タスクの詳細な説明
-   **status**: タスクの現在の状態 (`not_started`, `in_progress`, `completed` のいずれか)
-   **priority**: タスクの優先度 (`low`, `medium`, `high` のいずれか)
-   **dueDate**: タスクの期日
-   **createdAt**: タスクの作成日時
-   **updatedAt**: タスクの最終更新日時

### Cosmos DB用 `CosmosTask` モデル

Cosmos DBに格納される際の `Task` モデルは、以下の `CosmosTask` インターフェースに準拠します。

```typescript
// lib/types.ts
export interface CosmosTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  type: 'task';
  _partitionKey: string;
}
```

-   **type**: ドキュメントの種類を識別するためのプロパティ。常に `'task'` に設定されます。
-   **_partitionKey**: パーティションキー。`id` と同じ値が設定されます。

### データモデルに関する補足

-   `Task` モデルはアプリケーション全体で広く使用されます。
-   `CosmosTask` モデルは、Cosmos DBとのやり取りを行う際にのみ使用されます。
-   `cosmosHelpers.ts` 内の `toTask` 関数と `toCosmosTask` 関数を使用して、`Task` と `CosmosTask` 間のデータ変換を行います。

### バリデーション

`Task` モデルのバリデーションには `zod` ライブラリを使用します。

```typescript
// lib/types.ts
import { z } from 'zod';

// TaskモデルのZodスキーマ
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().min(1, '説明は必須です'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// フォーム用のスキーマ
export const TaskFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().min(1, '説明は必須です'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.union([z.string(), z.date()]).optional(),
});

export type TaskFormValues = z.infer<typeof TaskFormSchema>;
```

-   `TaskSchema` は、`Task` オブジェクト全体のバリデーションに使用されます。
-   `TaskFormSchema` は、フォーム入力値のバリデーションに使用されます。
    -   `dueDate` は、フォーム入力時には文字列または日付オブジェクトを受け付けるようにしています。

