import { getTask, updateTask, deleteTask } from '@/lib/cosmosHelpers';
import { Task } from '@/lib/types';
import { NextResponse } from 'next/server';

type PathParams = { params: { id: string } };

export async function GET(request: Request, { params }: PathParams) {
  const { id } = await  params;
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
  const { id } = await params;
  try {
    console.log('id:', id);
    const body:Task = await request.json();
    console.log('body:', body);
    //const updates = TaskSchema.parse(body);
    const updatedTask = await updateTask(id, body);
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task', details: error }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: PathParams) {
  const { id } = await params;
  try {
    await deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task', details: error }, { status: 500 });
  }
}