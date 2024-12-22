
import { GET, POST } from '../../app/api/tasks/route';
import { createTask, getTasks } from '../../lib/cosmosHelpers';

// Mock cosmosHelpers
jest.mock('../../lib/cosmosHelpers', () => ({
    getTasks: jest.fn(),
    createTask: jest.fn()
  }));

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return a list of tasks', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task', description: '', status: 'not_started', priority: 'medium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      (getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks).toEqual(mockTasks);
      expect(getTasks).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      (getTasks as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await GET();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch tasks');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTaskPayload = { title: 'New Task', description: 'Description', status: 'not_started', priority: 'low' };
      const createdTask = { id: '2', ...newTaskPayload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      (createTask as jest.Mock).mockResolvedValue(createdTask);

      const response = await POST(new Request('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTaskPayload),
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdTask);
      expect(createTask).toHaveBeenCalledWith(newTaskPayload);
    });

    it('should handle validation errors', async () => {
      const invalidTaskPayload = { title: '' }; // Missing title
      const response = await POST(new Request('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTaskPayload),
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Failed to create task');
    });
  });
});