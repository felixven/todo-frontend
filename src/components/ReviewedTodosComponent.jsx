import React, { useEffect, useState } from 'react';
import { getReviewedTodos } from '../services/TodoService';
import dayjs from 'dayjs';
import Loader from "./Loader";

const ReviewedTodosComponent = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true); // ★ 新增：整頁載入狀態
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);                         // ★ 開始載入
      try {
        const res = await getReviewedTodos();
        setTodos(res?.data ?? []);
        setError('');
      } catch (e) {
        console.error('已審核任務載入失敗', e);
        setError('已審核任務載入失敗');
      } finally {
        setLoading(false);                      // ★ 結束載入
      }
    })();
  }, []);

  if (loading) return <Loader text="已審核任務載入中..." />;
  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">已審核任務</h2>
      {todos.length === 0 ? (
        <p className="text-gray-600">目前沒有已審核的任務。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <div key={todo.id} className="p-4 bg-white rounded shadow border border-gray-300">
              <h3 className="text-lg font-semibold mb-1">{todo.title}</h3>
              <p className="text-gray-700 mb-2 line-clamp-3">{todo.description}</p>

              <div className="text-sm space-y-2">
                {/* 1) 截止日 */}
                {todo.dueDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">截止</span>
                    <time
                      className="text-gray-700 tabular-nums"
                      dateTime={dayjs(todo.dueDate).format('YYYY-MM-DD')}
                    >
                      {dayjs(todo.dueDate).format('YYYY/MM/DD')}
                    </time>
                  </div>
                )}

                {/* 2+3) 完成膠囊 + 審核膠囊 */}
                <div className="flex items-center gap-2">
                  <span className="badge" data-kind={todo.completed ? 'completed' : 'todo'}>
                    {todo.completed ? '已完成' : '未完成'}
                  </span>
                  <span className="badge" data-kind={todo.reviewed ? 'reviewed' : 'todo'}>
                    {todo.reviewed ? '已審核' : '未審核'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewedTodosComponent;
