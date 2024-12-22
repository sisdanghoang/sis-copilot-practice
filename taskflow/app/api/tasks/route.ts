import { getContainer } from '@/lib/cosmosdb';
import { NextResponse } from 'next/server';

// タスク一覧取得
export async function GET() {
  try {
    const container = await getContainer();
    const { resources: tasks } = await container.items.query("SELECT * FROM tasks").fetchAll();
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: `タスクの取得に失敗しました, ${error}` }, { status: 500 });
  }
}

// タスク作成
export async function POST(request: Request) {
  try {
    const container = await getContainer();
    const { title, description, priority } = await request.json();
    const newTask = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'task',
      _partitionKey: crypto.randomUUID(),
    };
    await container.items.create(newTask);
    return NextResponse.json(newTask);
  } catch (error: unknown) {
    if (isCosmosError(error) && error.code === 409) {
      return NextResponse.json(
        { error: 'タスクが既に存在します' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}

function isCosmosError(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error;
}