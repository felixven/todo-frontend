import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getTodo, completeTodo, inCompleteTodo, reviewTodo } from "../services/TodoService"; // 路徑依專案調整
import { isAdminUser } from "../services/AuthService";
import MessageComponent from "./MessageComponent"; // 如果你把留言元件放在 components 目錄
dayjs.extend(utc);

export default function TodoDetail() {
  const { id } = useParams();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminUser();

  const load = async () => {
    try {
      const { data } = await getTodo(id);
      setTodo(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [id]);

  if (loading) return <div className="p-6">載入中…</div>;
  if (!todo)    return <div className="p-6">找不到任務</div>;

  const dueInDays = todo.dueDate ? dayjs(todo.dueDate).diff(dayjs(), 'day') : null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/todos" className="text-sm text-blue-600 hover:underline">← 返回清單</Link>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">{todo.title}</h1>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{todo.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {todo.createdDate && (
            <div>建立日期：{dayjs(todo.createdDate).format('YYYY-MM-DD')}</div>
          )}
          {todo.dueDate && (
            <div>
              截止日期：{todo.dueDate}
              {dueInDays < 0 && !todo.completed ? (
                <span className="text-red-600 ml-1">| 已逾期</span>
              ) : !todo.completed ? (
                <span className="text-gray-600 ml-1">｜剩 {dueInDays} 天</span>
              ) : null}
            </div>
          )}
          <div className="col-span-full">
            完成狀態：
            {todo.completed ? (
              <span className="text-green-600">
                已完成（{todo.completedBy}｜
                {todo.completedAt ? dayjs.utc(todo.completedAt).local().format('YYYY-MM-DD HH:mm') : '—'}
                {todo.overdue && <span className="text-red-600 ml-1">逾期</span>}
                ）
              </span>
            ) : (
              <span className="text-red-600">未完成</span>
            )}
          </div>
          {todo.reviewed && (
            <div className="col-span-full">
              審核：{todo.reviewedBy || '—'} ｜ {todo.reviewedAt ? dayjs.utc(todo.reviewedAt).local().format('YYYY-MM-DD HH:mm') : '—'}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={async ()=>{ await completeTodo(id); await load(); }}
            disabled={todo.reviewed}
            className={`px-3 py-1 rounded text-sm ${todo.reviewed ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            標記完成
          </button>
          <button
            onClick={async ()=>{ await inCompleteTodo(id); await load(); }}
            disabled={todo.reviewed}
            className={`px-3 py-1 rounded text-sm ${todo.reviewed ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
          >
            標記未完成
          </button>
          {isAdmin && todo.completed && !todo.reviewed && (
            <button
              onClick={async ()=>{ await reviewTodo(id); await load(); }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              審核
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <MessageComponent todoId={id} />
      </div>
    </div>
  );
}
