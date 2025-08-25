import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getTodo, completeTodo, inCompleteTodo, reviewTodo, getParticipation } from "../services/TodoService"; // 路徑依專案調整
import { isAdminUser } from "../services/AuthService";
import TodoItems from "./TodoItems";
import MessageComponent from "./MessageComponent";
import Loader from './Loader'
dayjs.extend(utc);

const TodoDetail = () => {
  const { id } = useParams();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminUser();

  // 由子元件回報的 items summary
  const [itemsSummary, setItemsSummary] = useState({ total: 0, completed: 0 });

  // ★ 新增：參與度狀態（沿用你先前的簡單資料結構）
  const [participation, setParticipation] = useState([]);
  const [pLoading, setPLoading] = useState(true);

  // ★ 新增：抽出獨立的參與度抓取函式（供載入與 itemsSummary 變更時重抓）
  const fetchParticipation = async () => {
    setPLoading(true);
    try {
      // 後端回傳 Map<String, Long>（username -> count）
      const res = await getParticipation(id);
      const map = res?.data || {};
      const total = Object.values(map).reduce((a, b) => a + (Number(b) || 0), 0);

      // 轉成前端易渲染的陣列
      const list = Object.entries(map).map(([username, count]) => {
        const cnt = Number(count) || 0;
        const pct = total > 0 ? (cnt / total) * 100 : 0;
        return {
          username,
          count: cnt,
          percentage: pct,
        };
      });

      setParticipation(list);
    } catch (e) {
      setParticipation([]);
    }
    setPLoading(false);
  };

  const load = async () => {
    // === 原本的任務載入 ===
    const { data } = await getTodo(id);
    setTodo(data);
    setLoading(false);

    // ★ 新增：同時抓取參與度
    await fetchParticipation();
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ★ 新增：只要細項摘要改變（使用者在本頁勾/取消 item），就即時刷新參與度
  useEffect(() => {
    // 避免第一次 todo 還沒載入就打；若你希望更嚴謹，可加：if (!todo) return;
    fetchParticipation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSummary.completed, itemsSummary.total]);

  if (loading) return <Loader text="任務資料載入中..." />;
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

        {/* 基本資訊（保持直式顯示） */}
        <div className="space-y-2 text-sm">
          {todo.createdDate && (
    <div className="flex items-center gap-2">
      <span className="text-gray-600">建立</span>
      <time
        className="text-gray-700 tabular-nums"
        dateTime={dayjs(todo.createdDate).format("YYYY-MM-DD")}
      >
        {dayjs(todo.createdDate).format("YYYY/MM/DD")}
      </time>
    </div>
  )}

  {todo.dueDate && (
    <div className="flex items-center gap-2">
      <span className="text-gray-600">截止</span>
      <time
        className="text-gray-700 tabular-nums"
        dateTime={dayjs(todo.dueDate).format("YYYY-MM-DD")}
      >
        {dayjs(todo.dueDate).format("YYYY/MM/DD")}
      </time>

      {!todo.completed && (
        <span className="badge" data-kind={dueInDays < 0 ? "overdue" : "todo"}>
          {dueInDays < 0
            ? `已逾期 ${Math.abs(dueInDays)} 天`
            : dueInDays === 0
            ? "今天到期"
            : `剩 ${dueInDays} 天`}
        </span>
      )}
    </div>
  )}
          <div className="flex items-center gap-2 text-sm">
            {todo.completed ? (
              <>
              {todo.overdue && (
                  <span className="badge" data-kind="wasoverdue">曾逾期</span>
                )}
                <span className="badge" data-kind="completed">已完成</span>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate max-w-[10rem]">{todo.completedByName || "—"}</span>
                  <span className="h-3 w-px bg-gray-200" aria-hidden="true"></span>
                  <time
                    className="tabular-nums text-gray-500"
                    dateTime={todo.completedAt ? dayjs.utc(todo.completedAt).local().toISOString() : undefined}
                  >
                    {todo.completedAt
                      ? dayjs.utc(todo.completedAt).local().format("YYYY/MM/DD HH:mm")
                      : "—"}
                  </time>
                </div>
              </>
            ) : (
              <>
                <span className="badge" data-kind="todo">未完成</span>
                {todo.overdue && <span className="badge" data-kind="overdue">已逾期</span>}
              </>
            )}
          </div>



          {todo.reviewed && (
            <div>
              審核：{todo.reviewedBy || "—"} ｜{" "}
              {todo.reviewedAt
                ? dayjs.utc(todo.reviewedAt).local().format("YYYY-MM-DD HH:mm")
                : "—"}
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
            className={disableComplete ? 'btn-disabled btn-md' : 'btn-success btn-md'}
          >
            標記完成
          </button>

          <button
            onClick={async () => {
              await inCompleteTodo(id);
              await load();
            }}
            disabled={todo.reviewed}
            className={todo.reviewed ? 'btn-variant-disabled btn-md' : 'btn-variant-neutral btn-md'}
          >
            標記未完成
          </button>

          {isAdmin && todo.completed && !todo.reviewed && (
            <button
              onClick={async () => {
                await reviewTodo(id);
                await load();
              }}
              className="btn-review"
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
              子任務需全部完成後才能把任務「標記完成」。
            </div>
          )}
        </div>
      </div>

      {/* 參與度（2×2 bar + %（個人/總）） */}
      <div className="mt-6 rounded border border-gray-200 bg-white p-4">
        <div className="mb-2 border-b pb-2 text-sm font-medium text-gray-700">
          參與度
        </div>

        {pLoading ? (
          // ★ 新增：簡單骨架（不引入任何套件）
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
                <div className="h-2 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : participation.length === 0 ? (
          <div className="text-gray-500">目前尚無參與紀錄</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              // ★ 新增：計算總完成細項數（若後端沒給 total，用前端加總）
              const total =
                participation.reduce((a, p) => a + (Number(p?.count) || 0), 0) ||
                0;

              return participation.map((p, i) => {
                // 名稱容錯（目前你用 username，保留退回路徑）
                const name =
                  p?.firstName ?? p?.username ?? p?.name ?? p?.userName ?? "—";
                const count = Number(p?.count) || 0;

                // 百分比：若後端已計算則直接用，否則以 count/total 推
                const rawPct = Number(p?.percentage);
                const pct = Number.isFinite(rawPct)
                  ? rawPct
                  : total > 0
                    ? (count / total) * 100
                    : 0;
                const pctClamped = Math.max(0, Math.min(100, pct));

                return (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      {/* 名稱固定寬度避免被擠掉，超長時省略號 */}
                       <span className="badge" data-kind="completed"
                        title={name}
                      >
                        {name}
                      </span>
                      {/* 顯示 百分比（個人完成/總完成） */}
                      <span className="tabular-nums text-gray-600">
                        {Math.round(pctClamped)}%（{count}/{total}）
                      </span>
                    </div>

                    {/* bar */}
                    <div className="h-2 w-full rounded bg-gray-200" aria-hidden>
                      <div
                        className="h-2 rounded bg-blue-500"
                        style={{ width: `${pctClamped}%` }}
                        aria-valuenow={pctClamped}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* 留言板 */}
      <div className="mt-6">
        <MessageComponent todoId={id} />
      </div>
    </div>
  );
}
export default TodoDetail;