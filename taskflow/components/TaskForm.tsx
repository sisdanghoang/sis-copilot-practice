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
    <form onSubmit={handleSubmit(onSubmit)} className="task-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input id="title" {...register('title')} />
        {errors.title && <p>{errors.title.message}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register('description')} />
      </div>
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input type="date" id="dueDate" {...register('dueDate', { valueAsDate: true })} />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default TaskForm;