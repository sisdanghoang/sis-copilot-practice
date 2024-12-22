import { container } from "./cosmosdb";
import { Task, CosmosTask } from "./types";
import { handleCosmosError } from "./errorHandling";

// データ変換関数
export const toTask = (cosmosTask: CosmosTask): Task => ({
  id: cosmosTask.id,
  title: cosmosTask.title,
  description: cosmosTask.description,
  status: cosmosTask.status,
  priority: cosmosTask.priority,
  dueDate: cosmosTask.dueDate,
  createdAt: new Date(cosmosTask.createdAt),
  updatedAt: new Date(cosmosTask.updatedAt)
});

export const toCosmosTask = (task: Task): CosmosTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  type: 'task',
  _partitionKey: task.id
});

// CRUD操作関数
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { resources } = await container.items.query("SELECT * from c").fetchAll();
    return resources.map(toTask);
  } catch (error) {
    throw handleCosmosError(error);
  }
};


export const getTask = async (id: string): Promise<Task> => {
    try {
      const { resource } = await container.item(id, id).read();
      if (!resource) { // resourceがundefinedでないことを確認
        throw new Error(`Task with id ${id} not found.`);
      }
      return toTask(resource);
    } catch (error) {
      throw handleCosmosError(error);
    }
  };

  export const createTask = async (task: Task): Promise<Task> => {
    try {
      const cosmosTask = toCosmosTask(task);
      const { resource } = await container.items.create(cosmosTask);
      if (!resource) { // resourceがundefinedでないことを確認
        throw new Error('Failed to create task.');
      }
      return toTask(resource);
    } catch (error) {
      throw handleCosmosError(error);
    }
  };

  export const updateTask = async (id: string, task: Task): Promise<Task> => {
    try {
      const cosmosTask = toCosmosTask(task);
      const { resource } = await container.item(id, id).replace(cosmosTask);
      if (!resource) { // resourceがundefinedでないことを確認
        throw new Error(`Failed to update task with id ${id}.`);
      }
      return toTask(resource);
    } catch (error) {
      throw handleCosmosError(error);
    }
  };

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await container.item(id, id).delete();
  } catch (error) {
    throw handleCosmosError(error);
  }
};
