# API デザイン

TaskFlowのAPIは、Next.jsのAPI Routes機能を使用して構築されています。APIエンドポイントは `/app/api` ディレクトリ内に配置され、`/api/tasks` をベースパスとしてタスクリソースへのアクセスを提供します。

## エンドポイント一覧

### タスク (`/api/tasks`)

#### 1. タスク一覧取得 (GET /api/tasks)

-   **メソッド**: `GET`
-   **リクエスト**:
    -   クエリパラメータ: なし
-   **レスポンス**:
    -   成功時 (200 OK):
        ```json
        [
          {
            "id": "string (UUID)",
            "title": "string",
            "description": "string",
            "status": "not_started" | "in_progress" | "completed",
            "priority": "low" | "medium" | "high",
            "dueDate": "string (ISO 8601)",
            "createdAt": "string (ISO 8601)",
            "updatedAt": "string (ISO 8601)"
          },
          // ... more tasks
        ]
        ```
    -   失敗時 (500 Internal Server Error):
        ```json
        {
          "error": "string"
        }
        ```

#### 2. タスク作成 (POST /api/tasks)

-   **メソッド**: `POST`
-   **リクエストボディ**:
    ```json
    {
      "title": "string",
      "description": "string",
      "status": "not_started" | "in_progress" | "completed",
      "priority": "low" | "medium" | "high",
      "dueDate": "string (YYYY-MM-DD)"
    }
    ```
-   **レスポンス**:
    -   成功時 (201 Created):
        ```json
        {
          "id": "string (UUID)",
          "title": "string",
          "description": "string",
          "status": "not_started" | "in_progress" | "completed",
          "priority": "low" | "medium" | "high",
          "dueDate": "string (ISO 8601)",
          "createdAt": "string (ISO 8601)",
          "updatedAt": "string (ISO 8601)"
        }
        ```
    -   失敗時 (400 Bad Request):
        ```json
        {
          "error": "string",
          "details": "object"
        }
        ```
    -   失敗時 (500 Internal Server Error):
        ```json
        {
          "error": "string"
        }
        ```

### 個別タスク (`/api/tasks/[id]`)

#### 3. タスク取得 (GET /api/tasks/[id])

-   **メソッド**: `GET`
-   **リクエスト**:
    -   パスパラメータ:
        -   `id`: 取得するタスクのID (UUID)
-   **レスポンス**:
    -   成功時 (200 OK):
        ```json
        {
          "id": "string (UUID)",
          "title": "string",
          "description": "string",
          "status": "not_started" | "in_progress" | "completed",
          "priority": "low" | "medium" | "high",
          "dueDate": "string (ISO 8601)",
          "createdAt": "string (ISO 8601)",
          "updatedAt": "string (ISO 8601)"
        }
        ```
    -   失敗時 (404 Not Found):
        ```json
        {
          "error": "Task not found"
        }
        ```
    -   失敗時 (500 Internal Server Error):
        ```json
        {
          "error": "string"
        }
        ```

#### 4. タスク更新 (PATCH /api/tasks/[id])

-   **メソッド**: `PATCH`
-   **リクエスト**:
    -   パスパラメータ:
        -   `id`: 更新するタスクのID (UUID)
    -   リクエストボディ:
        ```json
        {
          "title"?: "string",
          "description"?: "string",
          "status"?: "not_started" | "in_progress" | "completed",
          "priority"?: "low" | "medium" | "high",
          "dueDate"?: "string (YYYY-MM-DD)"
        }
        ```
-   **レスポンス**:
    -   成功時 (200 OK):
        ```json
        {
          "id": "string (UUID)",
          "title": "string",
          "description": "string",
          "status": "not_started" | "in_progress" | "completed",
          "priority": "low" | "medium" | "high",
          "dueDate": "string (ISO 8601)",
          "createdAt": "string (ISO 8601)",
          "updatedAt": "string (ISO 8601)"
        }
        ```
    -   失敗時 (400 Bad Request):
        ```json
        {
          "error": "string",
          "details": "object"
        }
        ```
    -   失敗時 (404 Not Found):
        ```json
        {
          "error": "Task not found"
        }
        ```
    -   失敗時 (500 Internal Server Error):
        ```json
        {
          "error": "string"
        }
        ```

#### 5. タスク削除 (DELETE /api/tasks/[id])

-   **メソッド**: `DELETE`
-   **リクエスト**:
    -   パスパラメータ:
        -   `id`: 削除するタスクのID (UUID)
-   **レスポンス**:
    -   成功時 (204 No Content)
    -   失敗時 (404 Not Found):
        ```json
        {
          "error": "Task not found"
        }
        ```
    -   失敗時 (500 Internal Server Error):
        ```json
        {
          "error": "string"
        }
        ```

## エラーハンドリング

APIは標準的なHTTPステータスコードを使用してエラーを報告します。

-   **200 OK**: リクエストが成功した場合
-   **201 Created**: タスクの作成が成功した場合
-   **204 No Content**: タスクの削除が成功した場合
-   **400 Bad Request**: クライアントエラー。リクエストボディのバリデーションエラーなどが含まれます。
-   **404 Not Found**: リクエストされたリソースが存在しない場合
-   **500 Internal Server Error**: サーバーエラー。予期せぬエラーが発生した場合

エラーレスポンスのボディには、エラーの詳細情報が含まれます。

```json
{
  "error": "エラーメッセージ",
  "details": {
    // エラーの詳細情報（オブジェクト）
  }
}
```

-   `error`: エラーの概要を示す文字列
-   `details`: エラーの詳細情報を含むオブジェクト（オプション）

## 実装例

APIルートの実装例は、`app/api/tasks/route.ts` および `app/api/tasks/[id]/route.ts` を参照してください。

