## **SIS-Copilotを活用したTaskFlow開発デモ手順 (30分)**

**プロジェクト概要説明 (2分)**
*   今回開発するアプリケーションは、タスク管理アプリケーション「TaskFlow」
*   主な機能はタスクのCRUD操作
*   フロントエンドは `Next.js`、バックエンドは `Azure Cosmos DB` を使用
*   `React Query` を用いて、データの取得・更新を効率化
*   `Zod` によるバリデーションでデータの整合性を担保

このデモでは、以下の点に焦点を当てて説明します：

1. **コード理解と分析**: SIS Copilotが既存のコードをどのように理解し、説明、分析するか
2. **開発支援**: 新しいコードを生成する際の、メンターエージェントやテスト生成エージェントの活用方法
3. **質問のベストプラクティス**: 効果的な質問パターンと避けるべき質問パターン

なお、このデモで紹介する機能は、あくまでも開発の補助を目的としたものであり、完全な自動化を意図したものではありません。AIの提案を鵜呑みにするのではなく、開発者自身がその内容を理解し、適切に判断することが重要です。

それでは、デモを開始します。

---

**1. プロジェクトセットアップ (3分)**

*   **1.1 Next.jsプロジェクト作成**
    ```bash
    npx create-next-app@latest taskflow --typescript --tailwind --eslint --src-dir --app
    cd taskflow
    ```
*   **1.2 必要なパッケージのインストール**
    ```bash
    # UI関連
    npm install @shadcn/ui@latest @tanstack/react-query@latest zod@latest lucide-react@latest

    # Azure Cosmos DB関連
    npm install @azure/cosmos@latest
    ```
*   **1.3 SIS-Copilotの初期設定**
    *   VSCodeでプロジェクトを開く
    *   SIS-Copilotのサイドバーを表示
    *   「Scan Project」を実行してプロジェクト分析を開始
*   **1.4 Azure Cosmos DB設定**
    *   Azure PortalでCosmos DBアカウントとデータベース、コンテナを作成（`taskflow-db`, `tasks`）
    *   コンテナのパーティションキーを `/id` に設定
    *   `.env.local`ファイルの作成:
    ```env
    AZURE_COSMOSDB_ENDPOINT=YOUR_COSMOS_DB_ENDPOINT
    AZURE_COSMOSDB_KEY=YOUR_COSMOS_DB_KEY
    AZURE_COSMOS_DATABASE_NAME=taskflow-db
    AZURE_COSMOS_CONTAINER_NAME=tasks
    ```
    **注意:** `YOUR_COSMOS_DB_CONNECTION_STRING` は実際の接続文字列に置き換えてください。

**2. データモデルとユーティリティの実装 (5分)**

*   **2.1 型定義の作成**
    *   `taskflow/lib/types.ts`を作成
    *   **エージェントへの指示**:
        ```
        「docs/technical_specifications/data_model.md のデータモデルのセクションを参考に、Task モデルと CosmosTask モデルの型定義を taskflow/lib/types.ts に実装してください。TaskFormValues の型定義も含めてください。zod を用いた以下２つのバリデーションスキーマ TaskSchema、TaskFormSchema も定義してください。」
        ```
*   **2.2 Cosmos DB設定**
    *   `taskflow/lib/cosmosdb.ts`を作成
    *   **エージェントへの指示**:
        ```
        「`docs/development_guide/cosmosdb_integration.md` のCosmos DBクライアント設定のセクションを参考に、Cosmos DBクライアントのセットアップコードを `taskflow/lib/cosmosdb.ts` に実装してください。」
        ```
*   **2.3 ヘルパー関数の実装 (ビジネスロジック層)**
    *   `taskflow/lib/cosmosHelpers.ts`を作成
    *   **エージェントへの指示**:
        ```
        「`docs/development_guide/cosmosdb_integration.md` のデータアクセス層のセクションを参考に、以下の機能を持つ `cosmosHelpers.ts` を実装してください。

        データ変換関数:
        - Cosmos DBのデータモデル (`CosmosTask`) からアプリケーションのデータモデル (`Task`) への変換関数 (`toTask`)
        - アプリケーションのデータモデル (`Task`) から Cosmos DB のデータモデル (`CosmosTask`) への変換関数 (`toCosmosTask`)

        CRUD操作関数:
        - 全てのタスクを取得する関数 (`getTasks`)
        - 特定のIDでタスクを取得する関数 (`getTask`)
        - 新しいタスクを作成する関数 (`createTask`)
        - 特定のIDのタスクを更新する関数 (`updateTask`)
        - 特定のIDのタスクを削除する関数 (`deleteTask`)

        これらのCRUD操作関数は、`lib/cosmosdb.ts` で定義された Cosmos DB クライアントを使用してデータアクセスを行います。また、`lib/errorHandling.ts` の `handleCosmosError` 関数を用いたエラーハンドリングも実装してください。」
        ```

**3. APIルートの実装 (5分)**

*   **3.1 基本的なCRUD操作の実装**
    *   `taskflow/app/api/tasks/route.ts` (GET, POST) および `taskflow/app/api/tasks/[id]/route.ts` (GET, PATCH, DELETE) を作成
    *   **エージェントへの指示**:
        ```
        「`docs/technical_specifications/api_design.md` のAPI設計のセクションを参考に、`cosmosHelpers` の関数を使用して、タスクのCRUD操作用のAPIルート (`taskflow/app/api/tasks/route.ts` と `taskflow/app/api/tasks/[id]/route.ts`) を実装してください。
        `taskflow/app/api/tasks/route.ts`では、GETメソッドで `getTasks` 関数を、POSTメソッドで `createTask` 関数を呼び出すように実装してください。
        `taskflow/app/api/tasks/[id]/route.ts` では、GETメソッドで `getTask` 関数を、PATCHメソッドで `updateTask` 関数を、DELETEメソッドで `deleteTask` 関数を呼び出すように実装してください。
        リクエストとレスポンスの型定義、および適切なHTTPステータスコードの設定と `taskflow/lib/errorHandling.ts` の `handleCosmosError` 関数を用いたエラーハンドリングも含めてください。」
        ```
*   **3.2 エラーハンドリングの実装**
    *   `taskflow/lib/errorHandling.ts`を作成
    *   **エージェントへの指示**:
        ```
        「`docs/development_guide/cosmosdb_integration.md` のエラーハンドリングのセクションを参考に、`CosmosDBError` クラスと `handleCosmosError` 関数を `taskflow/lib/errorHandling.ts` に実装してください。」
        ```

**4. フロントエンド実装 (7分)**

*   **4.1 React Queryセットアップ**
    *   `taskflow/app/providers.tsx`を作成し、`QueryClientProvider` を設定
    *   **エージェントへの指示**:
        ```
        「React Query を使用して、`/api/tasks` からタスクデータを取得し、キャッシュするための基本的な設定を `app/providers.tsx` に実装してください。また、`app/layout.tsx` で `Providers` コンポーネントをアプリケーション全体をラップするように適用してください。
        ```
*   **4.2 `useTasks` フックの実装**
    *   `taskflow/hooks/useTasks.ts` の作成
    *   **エージェントへの指示**:
        ```
        「`React Query` の `useQuery` と `useMutation` を使用して、タスクデータを取得・更新するためのカスタムフック `useTasks` を `hooks/useTasks.ts` に実装してください。
        `useTasks` フックは以下の機能を持ちます:
            - `getTasks` (`useQuery` 使用): タスク一覧を取得する。クエリキーは `'tasks'` とする。
            - `createTask` (`useMutation` 使用): 新しいタスクを作成する。成功したら `'tasks'` クエリを無効化する。
            - `updateTask` (`useMutation` 使用): 既存のタスクを更新する。成功したら `'tasks'` クエリを無効化する。
            - `deleteTask` (`useMutation` 使用): タスクを削除する。成功したら `'tasks'` クエリを無効化する。
        これらの関数は、それぞれ対応するAPIルートを呼び出すように実装してください。」
        ```
*   **4.3 TaskCardコンポーネントの実装**
    *   `taskflow/components/TaskCard.tsx` の作成
    *   **エージェントへの指示**:
        ```
        「`docs/technical_specifications/ui_ux.md` のコンポーネント仕様セクションを参考に、タスクの情報を表示し、ステータス変更と削除機能を持つ `TaskCard` コンポーネントを `components/TaskCard.tsx` に実装してください。
        `useTasks` フックを使用して、ステータス変更 (`updateTask`) と削除 (`deleteTask`) 機能を実装してください。
        優先度 (`task.priority`) に応じて、`TaskCard` のボーダーの色を変更してください。以下のマッピングを使用してください:
        - `low`: `blue.200`
        - `medium`: `yellow.200`
        - `high`: `red.200`」
        ```
*   **4.4 TaskListコンポーネントの実装**
    *   `taskflow/components/TaskList.tsx` の作成
    *   **エージェントへの指示**:
        ```
        「`docs/technical_specifications/ui_ux.md` のコンポーネント仕様セクションを参考に、タスクの一覧を表示する `TaskList` コンポーネントを `components/TaskList.tsx` に実装してください。
        `useTasks` フックの `getTasks` を使用して `/api/tasks` からデータを取得し、`TaskCard` コンポーネントをリスト表示するようにしてください。
        また、`useTasks` から取得した `status` を使って、ロード中 (`status === 'loading'`) は `<div>Loading...</div>` を、エラー時 (`status === 'error'`) は `<div>Error: {error.message}</div>` を表示するようにしてください。」
        ```
*   **4.5 TaskFormコンポーネントの実装**
    *   `taskflow/components/TaskForm.tsx` の作成
    *   **エージェントへの指示**:
        ```
        「`docs/technical_specifications/ui_ux.md` のコンポーネント仕様と `lib/types.ts` の `TaskFormSchema` を参考に、`react-hook-form` と `zod` を使用して、タスクの作成と編集を行う `TaskForm` コンポーネントを `components/TaskForm.tsx` に実装してください。
        `useTasks` フックの `createTask` と `updateTask` を用いて API ルート (`/api/tasks` および `/api/tasks/[id]`) と連携し、フォーム送信後に React Query のキャッシュを無効化してください。
        `TaskForm` は `initialValues` プロパティでフォームの初期値を受け取れるようにし、`taskId` プロパティで編集するタスクのIDを指定できるようにしてください。」
        ```
*   **4.6 TaskFormModalコンポーネントの実装**
    *   `taskflow/components/TaskFormModal.tsx` の作成
    *   **エージェントへの指示**:
        ```
        「`docs/technical_specifications/ui_ux.md` のコンポーネント仕様を参考に、`TaskForm` コンポーネントをラップしてモーダルとして表示する `TaskFormModal` コンポーネントを `components/TaskFormModal.tsx` に実装してください。
        `TaskFormModal` は `isOpen` プロパティでモーダルの表示・非表示を制御し、`onClose` プロパティでモーダルを閉じるための関数を受け取れるようにしてください。
        また、`initialValues` と `taskId` プロパティを `TaskForm` コンポーネントに渡せるようにしてください。」
        ```
*   **4.7 アプリケーションのメインページの実装**
    *   `taskflow/app/page.tsx` を開く
    *   **エージェントへの指示**:
        ```
        「`TaskList` コンポーネント、`TaskFormModal` コンポーネント、`Providers` コンポーネントを `app/page.tsx` に追加して、アプリケーションのメインページにタスクリストとタスク作成フォームが表示されるようにしてください。
        また、`useState` を用いて `TaskFormModal` の表示状態を管理し、ボタンクリックでモーダルが表示されるようにしてください。」
        ```

**5. テスト実装 (6分)**

*   **5.1 テスト環境セットアップ**
    *   必要なdevDependenciesをインストール: `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/user-event @types/jest ts-node`
    *   `jest.config.js` を作成:
        ```js
        /** @type {import('ts-jest').JestConfigWithTsJest} */
        module.exports = {
            preset: 'ts-jest',
            testEnvironment: 'node',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/$1',
            },
        };
        ```
    *   `tsconfig.json`を修正:
        ```json
        {
          "compilerOptions": {
            // ...
            "esModuleInterop": true,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": true,
            "isolatedModules": true,
            // ...
            "paths": {
              "@/*": ["./*"]
            }
          },
          // ...
        }
        ```
    *   `package.json`を修正
        ```json
        {
            // ...
            "scripts": {
                // ...
                "test": "jest"
            },
            // ...
        }
        ```

*   **5.2 ヘルパー関数のテスト**
    *   `taskflow/lib/__tests__/cosmosHelpers.test.ts` を作成
    *   **エージェントへの指示**:
        ```
        「テストエージェント、`lib/cosmosHelpers.ts` の `getTasks` 関数と `createTask` 関数に対するユニットテストを `lib/__tests__/cosmosHelpers.test.ts` に生成してください。
        `lib/cosmosdb.ts` の `container` をモックして、テスト中に実際のデータベースアクセスが発生しないようにしてください。
        `getTasks` のテストでは、`toTask` 関数が正しく呼び出され、`CosmosTask` オブジェクトが `Task` オブジェクトに変換されることを確認してください。
        `createTask` のテストでは、`toCosmosTask` 関数が正しく呼び出され、新しいタスクが作成されることを確認してください。」
        ```

*   **5.3 APIルートのテスト**
    *   `taskflow/app/api/tasks/__tests__/route.test.ts` を作成
    *   **エージェントへの指示**:
        ```
        「テストエージェント、`app/api/tasks/route.ts` の GET および POST メソッドに対するユニットテストを `app/api/tasks/__tests__/route.test.ts` に生成してください。
        `lib/cosmosHelpers.ts` の `getTasks` 関数と `createTask` 関数をモックして、APIルートのロジックをテストしてください。
        GETメソッドのテストでは、`getTasks` 関数が呼び出され、タスクの配列がJSON形式で返されることを確認してください。
        POSTメソッドのテストでは、`createTask` 関数が呼び出され、新しいタスクが作成されることを確認してください。また、バリデーションエラーが発生した場合に、適切なエラーステータスコードとエラーメッセージが返されることも確認してください。」
        ```

*   **5.4 コンポーネントのテスト**
    *   `taskflow/components/__tests__/TaskCard.test.tsx` を作成
    *   **エージェントへの指示**:
        ```
        「テストエージェント、`TaskCard` コンポーネントのユニットテストを `components/__tests__/TaskCard.test.tsx` に生成してください。
        `useTasks` フックをモックして、`updateTask` と `deleteTask` 関数が呼び出されることを確認してください。
        また、優先度に応じた色が正しく表示されることもテストに含めてください。
        テストケースとして、以下の3つを含めてください:
        1. タスクの情報が正しく表示されること
        2. ステータス変更ボタンをクリックしたときに `updateTask` 関数が呼び出されること
        3. 削除ボタンをクリックしたときに `deleteTask` 関数が呼び出されること」
        ```

**6. 質疑応答 (5分)**

*   参加者からの質問に回答し、SIS Copilotの活用方法や機能についての理解を深める。

**デモを成功させるためのポイント**

*   **各ステップで、具体的な指示をエージェントに与えることが重要です。**
*   **エージェントの回答を鵜呑みにせず、生成されたコードを確認し、必要に応じて修正します。**
*   **時間内にデモを完了するために、各ステップの時間を厳守します。**
*   **参加者が理解しやすいように、専門用語を避け、平易な言葉で説明します。**

このデモを通じて、SIS Copilotが開発者の強力なパートナーとなり得ることを示し、参加者がその効果的な活用方法を理解できるように努めましょう。特に、テスト生成機能は時間短縮に効果的であることを強調しましょう。

