import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getTodo, completeTodo, inCompleteTodo, reviewTodo } from "../services/TodoService"; // 路徑依專案調整
import { isAdminUser } from "../services/AuthService";
import TodoItems from "./TodoItems";
import MessageComponent from "./MessageComponent"; 
dayjs.extend(utc);

export default function TodoDetail() {
  const { id } = useParams();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminUser();

  // 由子元件回報的 items summary
  const [itemsSummary, setItemsSummary] = useState({ total: 0, completed: 0 });

  const load = async () => {
    const { data } = await getTodo(id);
    setTodo(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-6">載入中…</div>;
  if (!todo) return <div className="p-6">找不到任務</div>;

  const dueInDays = todo.dueDate ? dayjs(todo.dueDate).diff(dayjs(), "day") : null;

  // 細項規則：有細項且未全完成 → 禁用「標記完成」
  const hasItems = (itemsSummary?.total || 0) > 0;
  const allItemsDone = hasItems && itemsSummary.completed === itemsSummary.total;
  const disableComplete = todo.reviewed || (hasItems && !allItemsDone);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← 返回清單
        </Link>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">{todo.title}</h1>
        <p className="mb-4 whitespace-pre-wrap text-gray-700">{todo.description}</p>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {todo.createdDate && <div>建立日期：{dayjs(todo.createdDate).format("YYYY-MM-DD")}</div>}
          {todo.dueDate && (
            <div>
              截止日期：{todo.dueDate}
              {dueInDays < 0 && !todo.completed ? (
                <span className="ml-1 text-red-600">| 已逾期</span>
              ) : !todo.completed ? (
                <span className="ml-1 text-gray-600">｜剩 {dueInDays} 天</span>
              ) : null}
            </div>
          )}
          <div className="col-span-full">
            完成狀態：
            {todo.completed ? (
              <span className="text-green-600">
                已完成（{todo.completedBy}｜
                {todo.completedAt ? dayjs.utc(todo.completedAt).local().format("YYYY-MM-DD HH:mm") : "—"}
                {todo.overdue && <span className="ml-1 text-red-600">逾期</span>}
                ）
              </span>
            ) : (
              <span className="text-red-600">未完成</span>
            )}
          </div>
          {todo.reviewed && (
            <div className="col-span-full">
              審核：{todo.reviewedBy || "—"} ｜{" "}
              {todo.reviewedAt ? dayjs.utc(todo.reviewedAt).local().format("YYYY-MM-DD HH:mm") : "—"}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              await completeTodo(id);
              await load();
            }}
            disabled={disableComplete}
            className={`rounded px-3 py-1 text-sm ${
              disableComplete
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            標記完成
          </button>

          <button
            onClick={async () => {
              await inCompleteTodo(id);
              await load();
            }}
            disabled={todo.reviewed}
            className={`rounded px-3 py-1 text-sm ${
              todo.reviewed
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : "bg-gray-500 text-white hover:bg-gray-600"
            }`}
          >
            標記未完成
          </button>

          {isAdmin && todo.completed && !todo.reviewed && (
            <button
              onClick={async () => {
                await reviewTodo(id);
                await load();
              }}
              className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            >
              審核
            </button>
          )}
        </div>

        {/* 細項（Checklist + 進度） */}
        <div className="mt-6">
          <TodoItems todoId={id} onSummary={setItemsSummary} />
          {hasItems && !allItemsDone && (
            <div className="mt-2 text-sm text-gray-500">
              有細項的任務需全部完成後才能「標記完成」。
            </div>
          )}
        </div>
      </div>

      {/* 留言板 */}
      <div className="mt-6">
        <MessageComponent todoId={id} />
      </div>
    </div>
  );
}
