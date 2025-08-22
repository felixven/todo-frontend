import React, { useEffect, useState } from 'react';
import { getOverdueTodos } from '../services/TodoService';
import { isAdminUser } from '../services/AuthService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const OverdueTodosComponent = () => {
  const [todos, setTodos] = useState([]);
  const isAdmin = isAdminUser();

  useEffect(() => {
    getOverdueTodos()
      .then((response) => setTodos(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">已逾期任務</h2>

      {todos.length === 0 ? (
        <p>目前沒有逾期的任務。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <div key={todo.id} className="p-4 bg-red-100 rounded shadow">
  <h3 className="text-lg font-semibold mb-1">{todo.title}</h3>
  <p className="text-gray-700 mb-2 line-clamp-3">{todo.description}</p>

  <div className="text-sm space-y-2">
    {/* 1) 截止日 + 逾期膠囊 */}
    {todo.dueDate && (
      <div className="flex items-center gap-2">
        <span className="text-gray-600">截止</span>
        <time className="text-gray-700 tabular-nums" dateTime={dayjs(todo.dueDate).format('YYYY-MM-DD')}>
          {dayjs(todo.dueDate).format('YYYY/MM/DD')}
        </time>
        <span className="badge" data-kind="overdue">已逾期</span>
      </div>
    )}

    {/* 2) 狀態膠囊們（完成 / 審核） */}
    <div className="flex items-center gap-2">
      <span className="badge" data-kind={todo.completed ? 'completed' : 'todo'}>
        {todo.completed ? '已完成' : '未完成'}
      </span>
      <span className="badge" data-kind={todo.reviewed ? 'reviewed' : 'todo'}>
        {todo.reviewed ? '已審核' : '未審核'}
      </span>
    </div>

    {/* 3) 完成者＋完成時間（膠囊 + 中性時間膠囊） */}
    {todo.completedBy && (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="badge" data-kind="completed">{todo.completedBy || '—'}</span>
        <time
          className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 text-gray-600 tabular-nums"
          dateTime={todo.completedAt ? dayjs.utc(todo.completedAt).local().toISOString() : undefined}
        >
          {todo.completedAt
            ? dayjs.utc(todo.completedAt).local().format('YYYY/MM/DD HH:mm')
            : '無紀錄'}
        </time>
      </div>
    )}

    {/* 4) 審核者＋審核時間（如果有） */}
    {todo.reviewed && (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="badge" data-kind="reviewed">{todo.reviewedBy || '—'}</span>
        <time
          className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 text-gray-600 tabular-nums"
          dateTime={todo.reviewedAt ? dayjs(todo.reviewedAt).toISOString() : undefined}
        >
          {todo.reviewedAt
            ? dayjs(todo.reviewedAt).format('YYYY/MM/DD')
            : '無紀錄'}
        </time>
      </div>
    )}
  </div>
</div>

          ))}
        </div>
      )}
    </div>
  );
};

export default OverdueTodosComponent;
