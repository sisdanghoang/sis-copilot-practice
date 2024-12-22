"use client"
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Task } from '../lib/types';

const fetchTasks = async (): Promise<Task[]|void> => {
  const { data } = await axios.get('/api/tasks');
  return data;
};

const createTask = async (task: Task) : Promise<void>=> {
  const { data } = await axios.post('/api/tasks', task);
  return data;
};

const updateTask = async (task: Task) : Promise<void>=>  {
    const { data } = await axios.patch(`/api/tasks/${task.id}`, { status: task.status });
    return data;
};

const deleteTask = async (taskId: string) => {
  await axios.delete(`/api/tasks/${taskId}`);
};

const useTasks = () => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery('tasks', fetchTasks);

  const createMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    }
  });

  const updateMutation = useMutation(updateTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    }
  });

  const deleteMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    }
  });

  return {
    tasks: tasksQuery.data,
    status: tasksQuery.status,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate
  };
};

export default useTasks;