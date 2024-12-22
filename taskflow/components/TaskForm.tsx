"use client"
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useTasks from '@/hooks/useTasks';
import { TaskSchema } from '@/lib/types';

type TaskFormValues = z.infer<typeof TaskSchema>;

interface TaskFormProps {
  initialValues?: TaskFormValues;
  taskId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialValues, taskId }) => {
  const { createTask, updateTask } = useTasks();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      console.log('Submitting form:', values);
      if (taskId) {
        await updateTask({ ...values, id: taskId });
      } else {
        await createTask(values);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 bg-white shadow-lg rounded-lg"
    >
      <div className="flex flex-col space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          id="title"
          {...register('title')}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          期限日
        </label>
        <input
          type="date"
          id="dueDate"
          {...register('dueDate', { valueAsDate: true })}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        提出する
      </button>
    </form>
  );
};

export default TaskForm;