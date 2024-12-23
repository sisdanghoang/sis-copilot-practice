# 開発環境セットアップ

このドキュメントでは、TaskFlowアプリケーションの開発環境をセットアップする手順を説明します。

## 前提条件

-   [Node.js](https://nodejs.org/) (v18以上) がインストールされていること
-   [npm](https://www.npmjs.com/) (v7以上) または [pnpm](https://pnpm.io/) がインストールされていること
-   [Git](https://git-scm.com/) がインストールされていること
-   [Azure Cosmos DB](https://azure.microsoft.com/ja-jp/products/cosmos-db) のアカウントが作成されていること

## ステップ 1: リポジトリのクローン

まず、GitHubからTaskFlowのリポジトリをクローンします。

```bash
git clone https://github.com/sisdanghoang/sis-copilot-practice.git
cd taskflow
```

## ステップ 2: 依存関係のインストール

次に、プロジェクトのルートディレクトリで、必要な依存関係をインストールします。

```bash
npm install
# または
pnpm install
```

## ステップ 3: 環境変数の設定

`.env.local.example` ファイルを `.env.local` にコピーし、必要な環境変数を設定します。

```bash
cp .env.local.example .env.local
```

`.env.local` ファイルを開き、以下の環境変数を設定します。

```
AZURE_COSMOSDB_ENDPOINT=your_cosmosdb_endpoint
AZURE_COSMOSDB_KEY=your_cosmosdb_key
AZURE_COSMOS_DATABASE_NAME=taskflow-db
AZURE_COSMOS_CONTAINER_NAME=tasks
```

-   `AZURE_COSMOSDB_ENDPOINT`: Azure Cosmos DBのエンドポイントURL
-   `AZURE_COSMOSDB_KEY`: Azure Cosmos DBのプライマリキー
-   `AZURE_COSMOS_DATABASE_NAME`: データベース名 (`taskflow-db`)
-   `AZURE_COSMOS_CONTAINER_NAME`: コンテナー名 (`tasks`)

## ステップ 4: 開発サーバーの起動

以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
# または
pnpm dev
```

ブラウザで `http://localhost:3000` を開くと、TaskFlowアプリケーションが表示されます。

## ステップ 5: (オプション) テストの実行

以下のコマンドで、ユニットテストとE2Eテストを実行できます。

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e
```

## その他のコマンド

-   `npm run build`: 本番用にアプリケーションをビルドします。
-   `npm run start`: ビルドされたアプリケーションを起動します。
-   `npm run lint`: ESLintを実行して、コードの問題をチェックします。
-   `npm run format`: Prettierを実行して、コードをフォーマットします。

## トラブルシューティング

-   開発サーバーが起動しない場合は、環境変数の設定を確認してください。
-   テストが失敗する場合は、テストコードと実装コードを確認してください。
-   依存関係のインストールに失敗する場合は、Node.jsとnpmのバージョンを確認してください。

