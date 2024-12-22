"use client";
import TaskList from '../components/TaskList';
import TaskFormModal from '../components/TaskForm';
import Providers from '../components/providers';
import { useState } from 'react';
import './globals.css';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Providers>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <button onClick={openModal} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">タスクを作成</button>
          <TaskList />
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        </footer>
      </div>
      <TaskFormModal isOpen={isModalOpen} onClose={closeModal} />
    </Providers>
  );
}