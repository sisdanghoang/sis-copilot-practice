import { Task, CosmosTask, TaskSchema, CosmosTaskSchema } from './types';

// TaskモデルからCosmosTaskモデルへの変換関数
const toCosmosTask = (task: Task): CosmosTask => {
  // バリデーション
  TaskSchema.parse(task);
  console.log('バリデーション成功');
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    isComplete: task.isComplete,
    dueDate: task.dueDate?.toISOString(), // DateをISO 8601文字列に変換
    _ts: Date.now() // 現在時刻のタイムスタンプ（例）
  };
};

// CosmosTaskモデルからTaskモデルへの変換関数
const toTask = (cosmosTask: CosmosTask): Task => {
  // バリデーション
  CosmosTaskSchema.parse(cosmosTask);
  console.log('バリデーション成功');
  return {
    id: cosmosTask.id,
    title: cosmosTask.title,
    description: cosmosTask.description,
    isComplete: cosmosTask.isComplete,
    dueDate: cosmosTask.dueDate ? new Date(cosmosTask.dueDate) : undefined // ISO 8601文字列をDate型に変換
  };
};

import { container } from './cosmosdb';

// 任意のクエリでタスクを取得するヘルパー関数
const queryTasks = async (query: string) => {
  const { resources } = await container.items.query(query).fetchAll();
  return resources.map(toTask);
};

export { toCosmosTask, toTask, queryTasks };