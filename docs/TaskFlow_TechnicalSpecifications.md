# TaskFlow - 技術仕様書

## アーキテクチャ概要

### システム構成
- フロントエンド: Next.js 14 (App Router)
- データベース: Azure Cosmos DB
- 認証: Azure AD B2C (予定)

### フロントエンド構成
1. **ページ構成**
   ```
   app/
   ├── page.tsx (ダッシュボード)
   ├── tasks/
   │   ├── page.tsx (タスク一覧)
   │   ├── [id]/
   │   │   └── page.tsx (タスク詳細)
   ```

2. **コンポーネント設計**
   ```
   components/
   ├── TaskCard.tsx (タスク表示カード)
   ├── TaskList.tsx (タスク一覧表示)
   ├── TaskForm.tsx (タスク作成/編集フォーム)
   └── ui/ (Shadcn/uiコンポーネント)
   ```

3. **状態管理**
   - React Query によるサーバーステート管理
   - Zod によるデータバリデーション
   - ローカルステート最小化

### バックエンド構成

#### 1. Cosmos DB設定
```typescript
// lib/cosmosdb.ts
const config = {
  databaseName: "taskflow-db",
  containerId: "tasks",
  partitionKey: "/id"
};
```

#### 2. API層
```
app/api/
├── tasks/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       └── route.ts (PATCH, DELETE)
```

## データモデル

### タスクモデル
```typescript
// lib/types.ts
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// Cosmos DB用拡張モデル
interface CosmosTask extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: string;  // ISO 8601形式
  updatedAt: string;  // ISO 8601形式
  type: 'task';       // ドキュメント種別識別用
  _partitionKey: string; // パーティションキー（idと同値）
}
```

## API設計

### エンドポイント仕様

#### 1. タスク一覧取得
```typescript
GET /api/tasks

// レスポンス
{
  tasks: Task[]
}
```

#### 2. タスク取得
```typescript
GET /api/tasks/:id

// レスポンス
Task
```

#### 3. タスク作成
```typescript
POST /api/tasks
Content-Type: application/json

// リクエストボディ
{
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// レスポンス
Task
```

#### 4. タスク更新
```typescript
PATCH /api/tasks/:id
Content-Type: application/json

// リクエストボディ
{
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  title?: string;
  description?: string;
}

// レスポンス
Task
```

#### 5. タスク削除
```typescript
DELETE /api/tasks/:id

// レスポンス
204 No Content
```

## 実装詳細

### コンポーネント仕様

#### TaskCard
- タスクの表示と基本操作を提供
- 優先度に応じた色分け表示
- ステータス変更のインタラクション
- 削除機能

#### TaskList
- タスクのリスト表示
- React Queryを使用したデータフェッチ
- フィルタリング機能
- ソート機能
- ページネーション

#### TaskForm
- タスクの作成/編集フォーム
- Zodによるバリデーション
- エラーハンドリング
- React Queryによる非同期処理

### データアクセス層

#### Cosmos DBクライアント
```typescript
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING!);
const database = client.database(process.env.AZURE_COSMOS_DATABASE_NAME!);
const container = database.container(process.env.AZURE_COSMOS_CONTAINER_NAME!);

export { container };
```

#### クエリ最適化
1. インデックス設定
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

2. パーティションキー戦略
- タスクIDをパーティションキーとして使用
- 単一タスクの読み取り/更新を効率化

### エラーハンドリング

#### カスタムエラークラス
```typescript
class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

#### エラー処理パターン
```typescript
try {
  const { resource } = await container.items.create(task);
  return NextResponse.json(resource);
} catch (error) {
  if (error.code === 409) {
    return NextResponse.json(
      { error: 'タスクが既に存在します' },
      { status: 409 }
    );
  }
  return NextResponse.json(
    { error: 'タスクの作成に失敗しました' },
    { status: 500 }
  );
}
```

## パフォーマンス最適化

### 1. フロントエンド
- React Query によるキャッシュ管理
- コンポーネントのメモ化
- 画像の最適化
- Code Splitting

### 2. バックエンド
- Cosmos DB クエリの最適化
- 適切なパーティション戦略
- インデックスの最適化
- キャッシュ戦略の実装

## 開発環境設定

### 必要な環境変数
```env
AZURE_COSMOS_CONNECTION_STRING=your_connection_string
AZURE_COSMOS_DATABASE_NAME=taskflow-db
AZURE_COSMOS_CONTAINER_NAME=tasks
```

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test
npm run test:e2e

# リント
npm run lint
```