import { z } from 'zod';

// Taskモデルの型定義
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
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
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;  // ISO 8601形式
  updatedAt: Date;  // ISO 8601形式
  type: 'task';       // ドキュメント種別識別用
  _partitionKey: string; // パーティションキー
}

// TaskモデルのZodスキーマ
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const TaskFormSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.union([z.string(), z.date()]).optional(),
});

export type TaskFormValues = z.infer<typeof TaskFormSchema>;

// CosmosTaskモデルのZodスキーマ
export const CosmosTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _partitionKey: z.string()
});
