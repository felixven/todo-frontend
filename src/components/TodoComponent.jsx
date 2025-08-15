import React, { useEffect } from 'react'
import { useState } from 'react'
import { getTodo, saveTodo, updateTodo } from '../services/TodoService'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);



dayjs.extend(utc);

const TodoComponent = () => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getTodo(id)
                .then((response) => {
                    setTitle(response.data.title);
                    setDueDate(response.data.dueDate);
                    setDescription(response.data.description);
                    setCompleted(response.data.completed);
                })
                .catch((error) => console.error(error));
        }
    }, [id]);

    function handleSubmit(e) {
        e.preventDefault();

        const todo = { title, dueDate, description, completed };

        if (id) {
            updateTodo(id, todo)
                .then(() => navigate('/todos'))
                .catch((error) => console.error(error));
        } else {
            saveTodo(todo)
                .then(() => navigate('/todos'))
                .catch((error) => console.error(error));
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-10 bg-gray-100">
            <div className="w-full max-w-lg bg-white shadow-md rounded px-8 py-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {id ? '編輯任務' : '新增任務'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">任務標題</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="請輸入任務標題"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">任務說明</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="請輸入任務內容"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">截止日期</label>
                        <input
                            type="date"
                            min={dayjs().format('YYYY-MM-DD')} 
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1">任務狀態</label>
                        <select
                            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
                            value={completed}
                            onChange={(e) => setCompleted(e.target.value === 'true')}
                        >
                            <option value="false">未完成</option>
                            <option value="true">已完成</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                    >
                        {id ? '更新任務' : '送出任務'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TodoComponent;