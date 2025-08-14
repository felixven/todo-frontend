import React, { useEffect, useState } from 'react';
import { getReviewedTodos } from '../services/TodoService';
import dayjs from 'dayjs';

const ReviewedTodosComponent = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    getReviewedTodos()
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">已審核任務</h2>
      {todos.length === 0 ? (
        <p className="text-gray-600">目前沒有已審核的任務。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.map((todo) => (
            <div key={todo.id} className="p-4 bg-white rounded shadow border border-gray-300">
              <h3 className="text-xl font-bold mb-2">{todo.title}</h3>
              <p className="text-gray-700 mb-2">{todo.description}</p>
              <p className="text-sm font-semibold">
                完成狀態：{todo.completed ? '✅ 已完成' : '❌ 未完成'}
              </p>
              <p className="text-sm font-semibold mt-1">
                審核狀態：{todo.reviewed ? '✅ 已審核' : '❌ 未審核'}
              </p>
              <p className="text-sm mt-1">截止日：{dayjs(todo.dueDate).format('YYYY-MM-DD')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewedTodosComponent;
