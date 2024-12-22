import { Task, CosmosTask } from './types';

// CosmosTaskをTaskに変換するヘルパー関数
export function cosmosTaskToTask(cosmosTask: CosmosTask): Task {
  return {
    id: cosmosTask.id,
    title: cosmosTask.title,
    description: cosmosTask.description,
    completed: cosmosTask.completed,
    createdAt: cosmosTask.createdAt,
    updatedAt: cosmosTask.updatedAt,
  };
}

// TaskをCosmosTaskに変換するヘルパー関数
export function taskToCosmosTask(task: Task): CosmosTask {
  return {
    ...task,
    _partitionKey: 'partitionKey-value', // 適切なパーティションキーを設定してください
    _rid: '',
    _self: '',
    _etag: '',
    _attachments: '',
    _ts: Date.now(),
  };
}
