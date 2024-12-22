"use client"
import React from 'react';
import useTasks from '../hooks/useTasks';
import TaskCard from './TaskCard';

const TaskList = () => {
  const { tasks, status } = useTasks();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error: {"error.message"}</div>;
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return <div>No tasks found</div>;
  }

  return (
    <div className="task-list space-y-4">
      {tasks.map(task => (
        <TaskCard key={task.id} task={{...task, dueDate: new Date(task.dueDate)}} />
      ))}
    </div>
  );
};

export default TaskList;