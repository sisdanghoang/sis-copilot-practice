import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskFormModal from './TaskForm';
import { Task } from '../lib/types';
import { TrashIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();

  const [isEditing, setIsEditing] = useState(false);
  const openEditModal = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  const handleStatusChange = () => {
    const newStatus =
      task.status === 'not_started'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'completed'
        : 'not_started';
    updateTask({ ...task, status: newStatus });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <div className="shadow-lg p-6 rounded-lg bg-white transition hover:shadow-xl dark:bg-gray-800">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex justify-between items-center">
    {task.title}
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700"
    >
      <TrashIcon name="trash" />
    </button>
  </h3>
  <p className="text-gray-700 dark:text-gray-300 mb-4">
    {task.description}
  </p>
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
    Status: {task.status}
  </p>
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
    Due Date: {new Date(task.dueDate).toLocaleDateString()}
  </p>
  <div className="flex space-x-2">
    <button
      onClick={handleStatusChange}
      className={`px-4 py-2 rounded text-white transition ${
        task.status === 'completed'
          ? 'bg-yellow-500 hover:bg-yellow-600'
          : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      {task.status === 'completed' ? 'Mark In Progress' : 'Mark as Completed'}
    </button>
    <button
      onClick={openEditModal}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      編集
    </button>
  </div>
  <TaskFormModal
    isOpen={isEditing}
    onClose={closeEditModal}
    initialValues={{...task, dueDate: task.dueDate.toISOString().split('T')[0]}}
    taskId={task.id}
  />
</div>
  );
};

export default TaskCard;