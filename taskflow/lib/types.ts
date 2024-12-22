// taskflow/lib/types.ts
import { z } from 'zod';

// Taskモデルの型定義
export const Task = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export type Task = z.infer<typeof Task>;

// CosmosTaskモデルの型定義
export const CosmosTask = Task.extend({
  _partitionKey: z.string(),
  _rid: z.string(),
  _self: z.string(),
  _etag: z.string(),
  _attachments: z.string(),
  _ts: z.number(),
});

export type CosmosTask = z.infer<typeof CosmosTask>;