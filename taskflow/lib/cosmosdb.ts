import { CosmosClient } from "@azure/cosmos";

const COSMOSDB_ENDPOINT = process.env.AZURE_COSMOSDB_ENDPOINT;
const COSMOSDB_KEY = process.env.AZURE_COSMOSDB_KEY;
const DATABASE_NAME = process.env.AZURE_COSMOS_DATABASE_NAME;
const CONTAINER_NAME = process.env.AZURE_COSMOS_CONTAINER_NAME;

if (!COSMOSDB_ENDPOINT||!COSMOSDB_KEY || !DATABASE_NAME || !CONTAINER_NAME) {
  throw new Error("Cosmos DBの接続情報が環境変数に設定されていません");
}

const client = new CosmosClient({
  endpoint: COSMOSDB_ENDPOINT || "",
  key: COSMOSDB_KEY || ""
});
const database = client.database(DATABASE_NAME);
const container = database.container(CONTAINER_NAME);

console.log(`Cosmos DB接続情報:
  Database: ${DATABASE_NAME}
  Container: ${CONTAINER_NAME}
`);

export { client, database, container };