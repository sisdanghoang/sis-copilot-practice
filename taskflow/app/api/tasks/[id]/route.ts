import { getTask, updateTask, deleteTask } from '@/lib/cosmosHelpers';
import { TaskSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

type PathParams = { params: { id: string } };

export async function GET(request: Request, { params }: PathParams) {
  const { id } = params;
  try {
    const task = await getTask(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task', details: error }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: PathParams) {
  const { id } = params;
  try {
    const body = await request.json();
    const updates = TaskSchema.parse(body);
    const updatedTask = await updateTask(id, updates);
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task', details: error }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: PathParams) {
  const { id } = params;
  try {
    await deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task', details: error }, { status: 500 });
  }
}