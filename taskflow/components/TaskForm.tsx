"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useTasks from "../hooks/useTasks";
import { TaskFormSchema, TaskFormValues  } from "../lib/types";

interface TaskFormProps {
  initialValues?: TaskFormValues;
  taskId?: string;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialValues, taskId, onClose}) => {
  const { createTask, updateTask } = useTasks();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      console.log("Submitting form:", values);
      const dueDate = new Date(values.dueDate!);
      if (taskId) {
        await updateTask({ ...values, id: taskId, dueDate: dueDate, updatedAt: new Date(), createdAt: new Date() });
      } else {
        await createTask({id: crypto.randomUUID(), ...values, dueDate: dueDate, createdAt: new Date(), updatedAt: new Date() });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
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
          {...register("title")}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          説明
        </label>
        <textarea
          id="description"
          {...register("description")}
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
          {...register("dueDate", { valueAsDate: true })}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="status" className="text-sm font-medium text-gray-700">
          状態
        </label>
        <select
          id="status"
          {...register("status")}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="not_started">未開始</option>
          <option value="in_progress">進行中</option>
          <option value="completed">完了</option>
        </select>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="priority" className="text-sm font-medium text-gray-700">
          優先度
        </label>
        <select
          id="priority"
          {...register("priority")}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
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

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: TaskFormValues;
  taskId?: string;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  taskId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 dark:bg-opacity-80">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              タスク作成
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              ×
            </button>
          </div>
          <TaskForm initialValues={initialValues} taskId={taskId} onClose={onClose}/>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
