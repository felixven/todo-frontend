import React, { useEffect, useState } from 'react';
import { getPendingReviewTodos, reviewTodo } from '../services/TodoService';
import { isAdminUser } from '../services/AuthService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Loader from "./Loader";
dayjs.extend(utc);

const PendingReviewTodosComponent = () => {
  const [todos, setTodos] = useState([]);
  const isAdmin = isAdminUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const listTodos = async () => {
    try {
      setLoading(true);
      const response = await getPendingReviewTodos();
      setTodos(response.data || []);
      setError('');
    } catch (e) {
      console.error(e);
      setError('待審核清單載入失敗');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    listTodos();
  }, [isAdmin]);

  const handleReview = async (id) => {
    try {
      await reviewTodo(id);
      await listTodos(); 
    } catch (e) {
      console.error(e);
      alert('審核失敗，請稍後重試');
    }
  };

  if (loading) return <Loader text="待審核清單讀取中..." />;
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
      <h2 className="text-2xl font-bold mb-6">待審核任務</h2>

      {todos.length === 0 ? (
        <p>目前沒有待審核的任務。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <div key={todo.id} className="bg-yellow-100 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-1">{todo.title}</h3>
              <p className="text-gray-700 mb-2 line-clamp-3">{todo.description}</p>
              <div className="flex items-center gap-2 text-sm mb-3">
                {/* 狀態 */}
                <span className="badge" data-kind="todo">已完成</span>
                {/* 若你想標記「曾逾期」可打開這顆 */}
                {/* {todo.overdue && <span className="badge" data-kind="wasoverdue">曾逾期</span>} */}

                {/* 完成者 */}
                <span className="badge" data-kind="todo">{todo.completedByName || "—"}</span>

                {/* 完成時間（灰色小膠囊） */}
                <time
                  className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 text-xs text-gray-600 tabular-nums"
                  dateTime={todo.completedAt ? dayjs.utc(todo.completedAt).local().toISOString() : undefined}
                >
                  {todo.completedAt
                    ? dayjs.utc(todo.completedAt).local().format('YYYY/MM/DD HH:mm')
                    : '無紀錄'}
                </time>
              </div>


              {/* ✅ 審核按鈕 */}
              {isAdmin && (
                <button
                  onClick={() => handleReview(todo.id)}
                  className='btn-review btn-md'
                >
                  審核
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingReviewTodosComponent;
