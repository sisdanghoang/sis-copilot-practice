// tests/cosmosdb-debug.test.ts
import { Task } from '../lib/types';

jest.mock('@azure/cosmos');

jest.mock('../lib/cosmosHelpers', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn()
}));

// Import the mocked functions
import { getTasks, createTask } from '../lib/cosmosHelpers';

describe('Cosmos DB Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tasks', () => {
    test('タスクの作成に成功する', async () => {
      const mockTask: Task = {
        id: '123',
        title: 'テストタスク',
        description: '説明',
        priority: 'high',
        status: 'not_started',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockCreatedTask = {
        ...mockTask,
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the createTask function
      (createTask as jest.Mock).mockResolvedValueOnce(mockCreatedTask);

      const response = await global.fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockTask)
      });

      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(createTask).toHaveBeenCalledWith(mockTask);
      expect(responseData).toEqual(mockCreatedTask);
    });

    test('不正なデータでタスク作成に失敗する', async () => {
      const invalidTask = {
        title: '', // Empty title should be invalid
        description: '説明',
        priority: 'invalid_priority', // Invalid priority
        status: 'todo'
      };

      (createTask as jest.Mock).mockRejectedValueOnce(new Error('Invalid task data'));

      const response = await global.fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidTask)
      });

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    test('タスク一覧の取得に成功する', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          status: 'todo',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          priority: 'medium',
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);

      const response = await global.fetch('/api/tasks');
      const responseData = await response.json();

      expect(response.status).toBe(200);
      //expect(getTasks).toHaveBeenCalled();
      expect(responseData).toEqual(mockTasks);
    });

    test('タスク一覧の取得に失敗する', async () => {
      (getTasks as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch tasks'));

      const response = await global.fetch('/api/tasks');

      expect(response.status).toBe(200);
      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
    });
  });
});