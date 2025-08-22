import React, { useEffect, useState } from 'react'
import { completeTodo, deleteTodo, getAllTodos, inCompleteTodo, reviewTodo } from '../services/TodoService';
import { useNavigate } from 'react-router-dom';
import { isAdminUser } from '../services/AuthService';
import { getSummary } from "../services/TodoItemService";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Loader from "./Loader";
dayjs.extend(utc);

const ListTodoComponent = () => {
    const [todos, setTodos] = useState([]);
    const navigate = useNavigate();
    const isAdmin = isAdminUser();

    const [loading, setLoading] = useState(true);   // ★ 新增
    const [error, setError] = useState("");

    useEffect(() => {
        listTodos();
    }, []);

    const listTodos = async () => {
        try {
            setLoading(true);
            const res = await getAllTodos();
            const todosWithSummary = await Promise.all(
                res.data.map(async (t) => {
                    try {
                        const { data: summary } = await getSummary(t.id);
                        return { ...t, summary };
                    } catch {
                        // 沒細項或出錯就給預設
                        return { ...t, summary: { total: 0, completed: 0, progress: 0 } };
                    }
                })
            );
            setTodos(todosWithSummary);
            setError("");
        } catch (error) {
            console.error(error);
            setError("任務清單載入失敗");
        }
        finally {
            setLoading(false); // ★ 新增：結束載入
        }
    }


    const addNewTodo = () => {
        navigate('/add-todo');
    };

    const updateTodo = (id) => {
        navigate(`/update-todo/${id}`);
    };

    const removeTodo = (id) => {
        deleteTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    };

    const markCompleteTodo = (id) => {
        completeTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    };

    const markInCompleteTodo = (id) => {
        inCompleteTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    };

    const handleReviewTodo = (id) => {
        reviewTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    };


    if (loading) return <Loader text="任務清單載入中..." />;
    if (error) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 min-h-screen">
                <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-6">任務清單</h2>

            {isAdmin && (
                <div className="text-right mb-6">
                    <button
                        onClick={addNewTodo}
                        className='btn-primary btn-lg'
                    >
                        新增任務
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
                {todos.map((todo) => {
                    const dueInDays = todo.dueDate ? dayjs(todo.dueDate).diff(dayjs(), 'day') : null;

                    const disableComplete =
                        todo.reviewed ||
                        (todo.summary && todo.summary.total > 0 && todo.summary.completed < todo.summary.total);

                    const disableIncomplete = disableComplete || !todo.completed;

                    // 根據截止日期計算卡片背景色
                    const cardStyle = dueInDays !== null && !todo.completed
                        ? dueInDays < 0
                            ? 'bg-red-100 border-red-300'      // 已逾期（未完成）
                            : dueInDays <= 3
                                ? 'bg-yellow-100 border-yellow-300' // 三天內警示（未完成）
                                : 'bg-white border-gray-300'        // 正常
                        : 'bg-white border-gray-300';

                    return (
                        <div
                            key={todo.id}
                            className={`p-6 rounded-lg shadow-md border ${cardStyle}`}
                        >

                            <h3 className="text-xl font-semibold mb-2">{todo.title}</h3>
                            <p className="text-gray-700 mb-2 line-clamp-3 overflow-hidden text-ellipsis">
                                {todo.description}
                            </p>

                            {todo.createdDate && (
                                <p className="text-sm text-gray-500 mb-2">
                                    <time className="mr-2 tabular-nums" dateTime={todo.createdDate}>
                                        建立日期：{dayjs(todo.createdDate).format('YYYY-MM-DD')}
                                    </time>
                                </p>
                            )}

                            {todo.dueDate && (
                                <p className="text-sm mb-2 font-semibold">
                                    截止日期：
                                    <time className="mr-2 tabular-nums" dateTime={todo.dueDate}>
                                        {dayjs(todo.dueDate).format("YYYY-MM-DD")}
                                    </time>

                                    {!todo.completed && (
                                        <span className="badge" data-kind={dueInDays < 0 ? "overdue" : "todo"}>
                                            {dueInDays < 0 ? `已逾期 ${Math.abs(dueInDays)} 天`
                                                : dueInDays === 0 ? "今天到期" : `剩 ${dueInDays} 天`}
                                        </span>
                                    )}
                                </p>

                            )}

                           <p className="text-sm mb-1">
  <span className="text-gray-700 font-semibold">完成狀態：</span>
  {todo.completed ? (
    <>
      <span className="inline-flex items-center gap-1.5">
        {todo.overdue && (
          <span className="badge" data-kind="wasoverdue">曾逾期</span>
        )}
        <span className="badge" data-kind="completed">
          {todo.completedByName || "—"}
        </span>
      </span>

      <time
        className="ml-2 tabular-nums text-gray-500"
        dateTime={todo.completedAt ? dayjs.utc(todo.completedAt).local().toISOString() : undefined}
      >
        {todo.completedAt
          ? dayjs.utc(todo.completedAt).local().format("YYYY/MM/DD HH:mm")
          : "—"}
      </time>
    </>
  ) : (
    <span className="badge" data-kind="todo">未完成</span>
  )}
</p>




                            {/* {todo.completed && todo.completedBy && (
                            <p className="text-sm text-gray-600 mb-1">
                                完成者：{todo.completedBy}
                            </p>
                        )}
                        {todo.reviewed && todo.reviewedBy && (
                            <p className="text-sm text-gray-600">
                                審核者：{todo.reviewedBy}
                            </p>
                        )} */}

                            <div className="flex flex-wrap gap-2">
                                {isAdmin && (
                                    <>
                                        {/* 編輯按鈕：reviewed=true 時不可點擊 */}
                                        <button
                                            onClick={() => updateTodo(todo.id)}
                                            disabled={todo.reviewed}
                                            className={todo.reviewed ? 'btn-disabled btn-md' : 'btn-edit btn-md'}
                                        >
                                            編輯
                                        </button>

                                        {/* 刪除按鈕：永遠可點擊 */}
                                        <button
                                            onClick={() => removeTodo(todo.id)}
                                            className="btn-danger btn-md"
                                        >
                                            刪除
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => markCompleteTodo(todo.id)}
                                    disabled={disableComplete}
                                    className={disableComplete ? 'btn-disabled btn-md' : 'btn-success btn-md'}
                                >
                                    標記完成
                                </button>


                                <button
                                    onClick={() => markInCompleteTodo(todo.id)}
                                    disabled={disableIncomplete}
                                    className={disableIncomplete
                                        ? 'btn-variant-disabled btn-md'
                                        : 'btn-variant-neutral btn-md'}

                                    title={disableIncomplete ? '需符合完成條件且任務已完成' : ''}
                                >
                                    標記未完成
                                </button>


                                <button
                                    onClick={() => navigate(`/todos/${todo.id}`)}
                                    className="btn-primary btn-sm"
                                >
                                    進入任務
                                </button>

                                {isAdmin && todo.completed && !todo.reviewed && (
                                    <button
                                        onClick={() => handleReviewTodo(todo.id)}
                                        className="btn-review btn-md"
                                    >
                                        審核
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListTodoComponent;

