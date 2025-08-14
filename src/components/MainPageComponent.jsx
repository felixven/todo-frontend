import React, { useEffect, useState } from 'react'
import {useNavigate } from 'react-router-dom';
import { getTodoStatistics } from '../services/TodoService';

const MainPageComponent = () => {
  const role = sessionStorage.getItem("role");
  const firstName = sessionStorage.getItem("firstName");
  const lastName = sessionStorage.getItem("lastName");
  const navigator = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pendingReview: 0,
    reviewed: 0,
  });

  useEffect(() => {
    getTodoStatistics()
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('統計資料載入失敗', error);
      });
  }, []);


  return (
    
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6">任務總覽</h2>
      <p className="text-lg mb-4">
        {role === 'ROLE_ADMIN' ? `Admin ${firstName} ${lastName} 您好！` : `${firstName} ${lastName} 您好！`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 所有任務卡片 */}
        <div
          onClick={() => navigator('/todos')}
          className="bg-blue-100 border border-blue-300 p-4 rounded shadow cursor-pointer hover:bg-blue-200 transition"
        >
          <h3 className="text-lg font-semibold">所有任務</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        {/* 待審核任務卡片 */}
        <div
          onClick={() => navigator('/pending-review')}
          className="bg-yellow-100 border border-yellow-300 p-4 rounded shadow cursor-pointer hover:bg-yellow-200 transition"
        >
          <h3 className="text-lg font-semibold">待審核任務</h3>
          <p className="text-2xl font-bold">{stats.pendingReview}</p>
        </div>

        <div
          onClick={() => navigator('/reviewed-todos')}
          className="bg-green-100 border border-green-300 p-4 rounded shadow cursor-pointer hover:bg-green-200 transition"
        >
          <h3 className="text-lg font-semibold">已審核任務</h3>
          <p className="text-2xl font-bold">{stats.reviewed}</p>
        </div>

        <div
          onClick={() => navigator('/overdue')}
          className="bg-red-100 border border-red-300 p-4 rounded shadow cursor-pointer hover:bg-red-200 transition"
        >
          <h3 className="text-lg font-semibold">已逾期任務</h3>
          <p className="text-2xl font-bold">{stats.overdue}</p> {/* 修正變數名稱 */}
        </div>
      </div>
    </div>
  )
}

export default MainPageComponent