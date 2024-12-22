import { getTasks,createTask } from '@/lib/cosmosHelpers';
import { TaskSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks, {status: 200});
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error}`}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = TaskSchema.parse(body);
    const newTask = await createTask(validatedBody);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task', details: error }, { status: 400 });
  }
}