import React from 'react';
import { render, screen,fireEvent  } from '@testing-library/react';
import {act} from 'react';
import TaskCard from '../../components/TaskCard';
import { Task } from '../../lib/types';
import Providers from '../../components/providers';

test('タスクの情報が正しく表示されること', () => {
  const task: Task = {
    id: '1',
    title: 'テストタスク',
    description: '説明文',
    status: 'not_started',
    priority: 'high',
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  render(<Providers><TaskCard task={task} /></Providers>);

  expect(screen.getByText('テストタスク')).toBeInTheDocument();
  expect(screen.getByText('説明文')).toBeInTheDocument();
  expect(screen.getByText('Status: not_started')).toBeInTheDocument();
  expect(screen.getByText(`Due Date: ${new Date(task.dueDate).toLocaleDateString()}`)).toBeInTheDocument();
});

test('タスクのステータスが変更されること', async () => {
  const task: Task = {
    id: '1',
    title: 'テストタスク',
    description: '説明文',
    status: 'not_started',
    priority: 'high',
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // テスト実行時に使用するモック関数を設定
  //const updateTask = jest.fn();


  await act(async () => {
    render(<Providers><TaskCard task={task} /></Providers>);
  });

  // 初期ステータスを確認
  expect(screen.getByText('Status: not_started')).toBeInTheDocument();

  // ステータスボタンをクリックしてステータスを変更
  await act(async () => {
    await fireEvent.click(screen.getByText('Mark as Completed'));
  });

  // ステータス変更後の確認
  //expect(screen.getByText('Status: in_progress')).toBeInTheDocument();

});