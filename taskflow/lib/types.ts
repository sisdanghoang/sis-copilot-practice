import { z } from 'zod';

// Taskモデルの型定義
export interface Task {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  dueDate?: Date;
}

// CosmosTaskモデルの型定義
export interface CosmosTask {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  dueDate?: string;  // CosmosDBはISO 8601の文字列として日付を扱うことが多いため
  _ts: number;  // タイムスタンプなど、CosmosDB固有のフィールド
}

// TaskモデルのZodスキーマ
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isComplete: z.boolean(),
  dueDate: z.date().optional()
});

// CosmosTaskモデルのZodスキーマ
export const CosmosTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isComplete: z.boolean(),
  dueDate: z.string().optional(),  // 文字列でのバリデーション
  _ts: z.number()
});

// バリデーションの例
const exampleTask = {
  id: "1",
  title: "Write TypeScript types",
  isComplete: false,
  dueDate: new Date()
};

const exampleCosmosTask = {
  id: "1",
  title: "Write TypeScript types",
  isComplete: false,
  dueDate: new Date().toISOString(),
  _ts: Date.now()
};

// バリデーションの実行例
try {
  TaskSchema.parse(exampleTask);
  CosmosTaskSchema.parse(exampleCosmosTask);
  console.log('バリデーション成功');
} catch (e) {
  console.error('バリデーションエラー', e);
}