import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getTodoStatistics } from '../services/TodoService';
import Loader from "./Loader"; // ★ 新增：共用 Loader

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
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);   // ★ 新增
  const [error, setError] = useState("");         // ★ 新增

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getTodoStatistics();
        setStats(res?.data ?? {});
        setError("");
      } catch (e) {
        console.error('統計資料載入失敗', e);
        setError("統計資料載入失敗");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader text="儀表板載入中..." />; // ★ 新增：整頁載入
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
      <h2 className="text-2xl font-semibold mb-6">任務總覽</h2>
      <p className="text-lg mb-4">
        {role === 'ROLE_ADMIN'
          ? `Admin ${firstName ?? ""} ${lastName ?? ""} 您好！`
          : `${firstName ?? ""} ${lastName ?? ""} 您好！`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 所有任務卡片 */}
        <div
          onClick={() => navigator('/todos')}
          className="bg-blue-100 border border-blue-300 p-4 rounded shadow cursor-pointer hover:bg-blue-200 transition"
        >
          <h3 className="text-lg font-semibold">所有任務</h3>
          <p className="text-2xl font-bold">{stats.total ?? 0}</p>
        </div>

        {/* 待審核任務卡片 */}
        <div
          onClick={() => navigator('/pending-review')}
          className="bg-yellow-100 border border-yellow-300 p-4 rounded shadow cursor-pointer hover:bg-yellow-200 transition"
        >
          <h3 className="text-lg font-semibold">待審核任務</h3>
          <p className="text-2xl font-bold">{stats.pendingReview ?? 0}</p>
        </div>

        {/* 已審核任務卡片 */}
        <div
          onClick={() => navigator('/reviewed-todos')}
          className="bg-green-100 border border-green-300 p-4 rounded shadow cursor-pointer hover:bg-green-200 transition"
        >
          <h3 className="text-lg font-semibold">已審核任務</h3>
          <p className="text-2xl font-bold">{stats.reviewed ?? 0}</p>
        </div>

        {/* 已逾期任務卡片 */}
        <div
          onClick={() => navigator('/overdue')}
          className="bg-red-100 border border-red-300 p-4 rounded shadow cursor-pointer hover:bg-red-200 transition"
        >
          <h3 className="text-lg font-semibold">已逾期任務</h3>
          <p className="text-2xl font-bold">{stats.overdue ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

export default MainPageComponent
