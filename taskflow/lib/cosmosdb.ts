import { CosmosClient } from "@azure/cosmos";

// 環境変数から読み込む
const endpoint = process.env.COSMOS_DB_ENDPOINT ?? "デフォルトのエンドポイント";
const key = process.env.COSMOS_DB_KEY ?? "デフォルトのキー";

// 未定義でないことを確認（エラーをスローする例）
if (!endpoint || !key) {
  throw new Error("COSMOS_DB_ENDPOINTまたはCOSMOS_DB_KEYが設定されていません。");
}

// クライアントの初期化
const client = new CosmosClient({ endpoint, key });

// データベースとコンテナのID
const databaseId = "taskflow-db";
const containerId = "tasks";

// データベースとコンテナの参照を取得するヘルパー関数
async function getContainer() {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({ id: containerId });
  return container;
}

export { client, databaseId, containerId, getContainer };