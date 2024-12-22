import { z } from 'zod';

// Taskモデルの型定義
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// CosmosTaskモデルの型定義
export interface CosmosTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: string;  // ISO 8601形式
  updatedAt: string;  // ISO 8601形式
  type: 'task';       // ドキュメント種別識別用
  _partitionKey: string; // パーティションキー
}

// TaskモデルのZodスキーマ
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});


// CosmosTaskモデルのZodスキーマ
export const CosmosTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _partitionKey: z.string()
});
