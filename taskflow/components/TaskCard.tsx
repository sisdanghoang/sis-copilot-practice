import React from 'react';
import useTasks from '../hooks/useTasks';
import { Task } from '../lib/types';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();

  const handleStatusChange = () => {
    const newStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'todo';
    updateTask({ ...task, status: newStatus });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <button onClick={handleStatusChange}>
        {task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
      </button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default TaskCard;