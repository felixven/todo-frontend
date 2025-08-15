import React, { useEffect, useState } from 'react';
import { getPendingReviewTodos, reviewTodo } from '../services/TodoService';
import { isAdminUser } from '../services/AuthService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const PendingReviewTodosComponent = () => {
  const [todos, setTodos] = useState([]);
  const isAdmin = isAdminUser();

  // 封裝成 listTodos 方法，審核後也能重用
  const listTodos = () => {
    getPendingReviewTodos() // 無論是否為 admin 都要能看到
      .then((response) => setTodos(response.data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    listTodos();
  }, [isAdmin]);

  // 處理審核請求
  const handleReview = (id) => {
    reviewTodo(id)
      .then(() => listTodos()) // 成功後刷新列表
      .catch((error) => console.error(error));
  };

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
              <p className="text-sm font-semibold text-gray-600 mb-3">
                狀態：已完成（待審核）
              </p>

              {/* ✅ 新增完成者資訊 */}
              <p className="text-sm font-semibold text-gray-600 mb-3">
                完成者：{todo.completedBy}｜
                {todo.completedAt
                  ? dayjs.utc(todo.completedAt).local().format('YYYY-MM-DD HH:mm')
                  : '無紀錄'}
              </p>

              {/* ✅ 審核按鈕 */}
              {isAdmin && (
                <button
                  onClick={() => handleReview(todo.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
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
