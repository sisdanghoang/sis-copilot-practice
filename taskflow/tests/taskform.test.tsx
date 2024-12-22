import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import TaskFormModal from '../components/TaskForm';
import { TaskFormValues } from '../lib/types';
import Providers from '../components/providers';

const mockOnClose = jest.fn();
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();

jest.mock('../hooks/useTasks', () => ({
  __esModule: true,
  default: () => ({
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('フォームが正しくレンダリングされること', () => {
  const initialValues: TaskFormValues = {
    title: '',
    description: '',
    dueDate: undefined,
    status: 'not_started',
    priority: 'low',
  };

  render(
    <Providers>
      <TaskFormModal isOpen={true} onClose={mockOnClose} initialValues={initialValues} />
    </Providers>
  );

  expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
  expect(screen.getByLabelText('説明')).toBeInTheDocument();
  expect(screen.getByLabelText('期限日')).toBeInTheDocument();
  expect(screen.getByLabelText('状態')).toBeInTheDocument();
  expect(screen.getByLabelText('優先度')).toBeInTheDocument();
  expect(screen.getByText('提出する')).toBeInTheDocument();
});

test('フォームが送信され、createTaskが呼び出されること', async () => {
  const initialValues: TaskFormValues = {
    title: '',
    description: '',
    dueDate: undefined,
    status: 'not_started',
    priority: 'low',
  };

  render(
    <Providers>
      <TaskFormModal isOpen={true} onClose={mockOnClose} initialValues={initialValues} />
    </Providers>
  );

  const titleInput = screen.getByLabelText('タイトル');
  const descriptionInput = screen.getByLabelText('説明');
  const dueDateInput = screen.getByLabelText('期限日');
  const statusSelect = screen.getByLabelText('状態');
  const prioritySelect = screen.getByLabelText('優先度');
  const submitButton = screen.getByText('提出する');

  await act(async () => {
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    fireEvent.change(descriptionInput, { target: { value: 'タスクの説明' } });
    fireEvent.change(dueDateInput, { target: { value: '2023-12-31' } });
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.click(submitButton);
  });

  expect(mockCreateTask).toHaveBeenCalledTimes(1);
  expect(mockCreateTask).toHaveBeenCalledWith({
    id: expect.any(String),
    title: '新しいタスク',
    description: 'タスクの説明',
    dueDate: new Date('2023-12-31'),
    status: 'in_progress',
    priority: 'high',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  });

  expect(mockOnClose).toHaveBeenCalled();
});

test('フォームが送信され、updateTaskが呼び出されること', async () => {
  const initialValues: TaskFormValues = {
    title: '既存のタスク',
    description: '既存の説明',
    dueDate: new Date('2023-12-31'),
    status: 'not_started',
    priority: 'low',
  };
  const taskId = '1';

  render(
    <Providers>
      <TaskFormModal isOpen={true} onClose={mockOnClose} initialValues={initialValues} taskId={taskId} />
    </Providers>
  );

  const titleInput = screen.getByLabelText('タイトル');
  const submitButton = screen.getByText('提出する');

  await act(async () => {
    fireEvent.change(titleInput, { target: { value: '更新されたタスク' } });
    fireEvent.click(submitButton);
  });

  expect(mockUpdateTask).toHaveBeenCalledTimes(1);
  expect(mockUpdateTask).toHaveBeenCalledWith({
    id: taskId,
    title: '更新されたタスク',
    description: '既存の説明',
    dueDate: initialValues.dueDate,
    status: 'not_started',
    priority: 'low',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  });

  expect(mockOnClose).toHaveBeenCalled();
});
