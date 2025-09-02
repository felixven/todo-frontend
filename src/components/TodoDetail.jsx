import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getTodo, completeTodo, inCompleteTodo, reviewTodo, getParticipation } from "../services/TodoService";
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
  const [itemsSummary, setItemsSummary] = useState({ total: 0, completed: 0 });
  const [participation, setParticipation] = useState([]);
  const [pLoading, setPLoading] = useState(true);

  const fetchParticipation = async () => {
    setPLoading(true);
    try {
      const res = await getParticipation(id);
      const map = res?.data || {};
      const total = Object.values(map).reduce((a, b) => a + (Number(b) || 0), 0);

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
    const { data } = await getTodo(id);
    setTodo(data);
    setLoading(false);
    await fetchParticipation();
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [id]);

  useEffect(() => {
    fetchParticipation();
  }, [itemsSummary.completed, itemsSummary.total]);

  if (loading) return <Loader text="任務資料載入中..." />;
  if (!todo) return <div className="p-6">找不到任務</div>;

  const dueInDays = todo.dueDate ? dayjs(todo.dueDate).diff(dayjs(), "day") : null;
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

        <div className="mt-6">
          <TodoItems todoId={id} onSummary={setItemsSummary} />
          {hasItems && !allItemsDone && (
            <div className="mt-2 text-sm text-gray-500">
              子任務需全部完成後才能把任務「標記完成」。
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded border border-gray-200 bg-white p-4">
        <div className="mb-2 border-b pb-2 text-sm font-medium text-gray-700">
          參與度
        </div>

        {pLoading ? (
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
              const total =
                participation.reduce((a, p) => a + (Number(p?.count) || 0), 0) ||
                0;

              return participation.map((p, i) => {
                const name =
                  p?.firstName ?? p?.username ?? p?.name ?? p?.userName ?? "—";
                const count = Number(p?.count) || 0;

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
                      <span className="badge" data-kind="completed"
                        title={name}
                      >
                        {name}
                      </span>
                      <span className="tabular-nums text-gray-600">
                        {Math.round(pctClamped)}%（{count}/{total}）
                      </span>
                    </div>

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

      <div className="mt-6">
        <MessageComponent todoId={id} />
      </div>
    </div>
  );
}
export default TodoDetail;