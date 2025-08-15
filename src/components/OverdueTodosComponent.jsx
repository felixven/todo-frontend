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
            <div key={todo.id} className="bg-red-100 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-1">{todo.title}</h3>
              <p className="text-gray-700 mb-2 line-clamp-3">{todo.description}</p>

              <p className="text-sm font-semibold text-red-600 mb-2">
                截止日期：{todo.dueDate}（已逾期）
              </p>

              <p className="text-sm font-semibold text-gray-600 mb-2">
                狀態：{todo.completed ? '已完成' : '未完成'}
              </p>

              {todo.completedBy && (
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  完成者：{todo.completedBy}｜
                  {todo.completedAt
                    ? dayjs.utc(todo.completedAt).local().format('YYYY-MM-DD HH:mm')
                    : '無紀錄'}
                </p>
              )}

              {todo.reviewed && (
                <p className="text-sm font-semibold text-gray-600">
                  已審核：{todo.reviewedBy}｜{dayjs(todo.reviewedAt).format('YYYY-MM-DD')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverdueTodosComponent;
