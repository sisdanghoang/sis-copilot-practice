# アーキテクチャ仕様

## システム構成

TaskFlowは、フロントエンドにNext.js 14、バックエンドにAzure Cosmos DBを採用したシングルページアプリケーション (SPA) です。

-   **フロントエンド**: Next.js 14 (App Router)
    -   ユーザーインターフェースの構築とユーザーインタラクションの処理を担当します。
    -   React Queryを使用して、サーバー状態の取得、キャッシュ、同期、更新を効率的に管理します。
    -   API Routesを介してバックエンドと通信します。
-   **バックエンド**: Azure Cosmos DB
    -   NoSQLドキュメントデータベースとして、タスクデータを永続化します。
    -   高いスケーラビリティと可用性を提供します。
-   **認証**: 未定 (将来的にAzure AD B2Cを検討)
    -   現時点では認証機能は実装されていませんが、将来的にAzure AD B2Cを導入してユーザー認証とアクセス制御を実装する予定です。

## フロントエンド構成

### フレームワーク

Next.js 14 (App Router) を採用しています。

### ディレクトリ構造

```
taskflow/
├── app/                  # アプリケーションのメインコード
│   ├── api/              # APIルート
│   │   └── tasks/
│   │       └── [id]/
│   │           └── route.ts # 個別タスクの取得、更新、削除
│   │       └── route.ts     # タスク一覧の取得、作成
│   ├── globals.css       # グローバルCSS
│   └── page.tsx          # ホームページ (ダッシュボード)
├── components/           # 再利用可能なコンポーネント
│   ├── TaskCard.tsx      # タスクカードコンポーネント
│   ├── TaskForm.tsx      # タスクフォームコンポーネント
│   ├── TaskList.tsx      # タスクリストコンポーネント
│   └── providers.tsx     # React Queryプロバイダー
├── hooks/                # カスタムフック
│   └── useTasks.ts       # タスクデータ取得・操作フック
├── lib/                  # ユーティリティ関数、型定義など
│   ├── cosmosdb.ts       # Cosmos DBクライアント設定
│   ├── cosmosHelpers.ts  # Cosmos DB操作ヘルパー関数
│   ├── errorHandling.ts # エラーハンドリングユーティリティ
│   └── types.ts          # 型定義
├── tests/                # テスト関連ファイル
│   ├── e2e/              # E2Eテスト
│   └── unit/             # ユニットテスト
├── .env.local            # 環境変数設定ファイル (サンプル)
├── jest.config.js        # Jest設定ファイル
├── next.config.js        # Next.js設定ファイル
├── package.json          # プロジェクト依存関係、スクリプト定義
├── playwright.config.ts  # Playwright設定ファイル
├── setupTests.ts         # テストセットアップファイル
└── tsconfig.json         # TypeScript設定ファイル
```

### 状態管理

-   **React Query**: サーバーステート（タスクデータ）の取得、キャッシュ、同期、更新を管理します。
    -   `useTasks` フックで `useQuery`, `useMutation` をラップし、データ取得と操作のロジックをカプセル化します。
-   **ローカルステート**: 最小限の使用に留め、主にUIの状態管理に使用します（例：モーダルの開閉状態）。

### スタイリング

-   **Tailwind CSS**: ユーティリティファーストのCSSフレームワークを使用して、UIのスタイリングを行います。
-   **Shadcn/ui**: Tailwind CSSをベースにした、再利用可能なUIコンポーネントライブラリを使用します。

## バックエンド構成

### データベース

-   **Azure Cosmos DB**:
    -   データベース名: `taskflow-db`
    -   コンテナー名: `tasks`
    -   パーティションキー: `/id`
    -   データはJSONドキュメントとして格納されます。

### API層

-   **Next.js API Routes**:
    -   Next.jsのAPI Routes機能を使用して、RESTful APIを構築します。
    -   APIエンドポイントは `/app/api` ディレクトリ内に配置されます。
    -   `cosmosHelpers` モジュールを介してCosmos DBとやり取りします。

### データアクセス

-   **`lib/cosmosdb.ts`**: Cosmos DBクライアントの初期化と設定を行います。
-   **`lib/cosmosHelpers.ts`**: Cosmos DBへのデータアクセスを抽象化するヘルパー関数群を提供します。データのCRUD操作や、アプリケーションで使用するデータモデルへの変換などを担当します。
-   **`lib/errorHandling.ts`**: エラーハンドリングのためのユーティリティ関数を提供します。
