import React, { useEffect, useState } from 'react'
import { completeTodo, deleteTodo, getAllTodos, inCompleteTodo, reviewTodo } from '../services/TodoService';
import { useNavigate } from 'react-router-dom';
import { isAdminUser } from '../services/AuthService';
import dayjs from 'dayjs';

const ListTodoComponent = () => {
    const [todos, setTodos] = useState([]);
    const navigate = useNavigate();
    const isAdmin = isAdminUser();

    useEffect(() => {
        listTodos();
    }, []);

    function listTodos() {
        getAllTodos()
            .then((response) => {
                setTodos(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function addNewTodo() {
        navigate('/add-todo');
    }

    function updateTodo(id) {
        navigate(`/update-todo/${id}`);
    }

    function removeTodo(id) {
        deleteTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    }

    function markCompleteTodo(id) {
        completeTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    }

    function markInCompleteTodo(id) {
        inCompleteTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    }

    function handleReviewTodo(id) {
        reviewTodo(id)
            .then(() => listTodos())
            .catch((error) => console.error(error));
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-6">任務清單</h2>

            {isAdmin && (
                <div className="text-right mb-6">
                    <button
                        onClick={addNewTodo}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        新增任務
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
                {todos.map((todo) => {
                    const dueInDays = todo.dueDate ? dayjs(todo.dueDate).diff(dayjs(), 'day') : null;

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
                                    建立日期：{dayjs(todo.createdDate).format('YYYY-MM-DD')}
                                </p>
                            )}

                            {todo.dueDate && (
                                <p className="text-sm mb-2 font-semibold">
                                    截止日期：{todo.dueDate}
                                    {dayjs(todo.dueDate).diff(dayjs(), 'day') < 0 && !todo.completed ? (
                                        <span className="text-red-600 ml-1">| 已逾期</span>
                                    ) : (
                                        !todo.completed && (
                                            <span className="text-gray-600 ml-1">
                                                ｜ 剩 {dayjs(todo.dueDate).diff(dayjs(), 'day')} 天
                                            </span>
                                        )
                                    )}
                                </p>
                            )}

                            <p className="text-sm mb-1 font-semibold">
  完成狀態：
  {todo.completed ? (
    <span className="text-green-600">
      已完成（{todo.completedBy}｜{dayjs(todo.completedAt).format('YYYY-MM-DD HH:mm')}
      {todo.overdue && (
        <span className="text-red-600 ml-1">逾期</span>
      )}
      ）
    </span>
  ) : (
    <span className="text-red-600">未完成</span>
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
                                            className={`px-3 py-1 rounded text-sm ${todo.reviewed
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-yellow-400 hover:bg-yellow-500 text-white'
                                                }`}
                                        >
                                            編輯
                                        </button>

                                        {/* 刪除按鈕：永遠可點擊 */}
                                        <button
                                            onClick={() => removeTodo(todo.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            刪除
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => markCompleteTodo(todo.id)}
                                    disabled={todo.reviewed}
                                    className={`px-3 py-1 rounded text-sm ${todo.reviewed
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    標記完成
                                </button>
                                <button
                                    onClick={() => markInCompleteTodo(todo.id)}
                                    disabled={todo.reviewed}
                                    className={`px-3 py-1 rounded text-sm ${todo.reviewed
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                                        }`}
                                >
                                    標記未完成
                                </button>

                                {isAdmin && todo.completed && !todo.reviewed && (
                                    <button
                                        onClick={() => handleReviewTodo(todo.id)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
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

