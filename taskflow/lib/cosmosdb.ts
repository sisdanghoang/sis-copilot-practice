import { CosmosClient } from "@azure/cosmos";

const CONNECTION_STRING = process.env.AZURE_COSMOS_CONNECTION_STRING;
const DATABASE_NAME = process.env.AZURE_COSMOS_DATABASE_NAME;
const CONTAINER_NAME = process.env.AZURE_COSMOS_CONTAINER_NAME;

if (!CONNECTION_STRING || !DATABASE_NAME || !CONTAINER_NAME) {
  throw new Error("Cosmos DBの接続情報が環境変数に設定されていません");
}

const client = new CosmosClient(CONNECTION_STRING);
const database = client.database(DATABASE_NAME);
const container = database.container(CONTAINER_NAME);

console.log(`Cosmos DB接続情報:
  Database: ${DATABASE_NAME}
  Container: ${CONTAINER_NAME}
`);

export { client, database, container };