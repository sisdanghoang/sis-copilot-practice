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

  return (
    <div className="task-list">
      {tasks!.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;