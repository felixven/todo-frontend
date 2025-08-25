import React from 'react'
import { useEffect, useState } from "react";
import { listItems, addItem, deleteItem, completeItem, uncompleteItem, getSummary } from "../services/TodoItemService";
import { isAdminUser, getLoggedInUser } from "../services/AuthService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const TodoItems = ({ todoId, onSummary }) => {
    const isAdmin = isAdminUser();
    const me = getLoggedInUser();

    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sum, setSum] = useState({ total: 0, completed: 0, progress: 0 });

    const loadAll = async () => {
        setLoading(true);
        try {
            const [itemsRes, sumRes] = await Promise.all([listItems(todoId), getSummary(todoId)]);
            setItems(itemsRes.data);
            setSum(sumRes.data);
            onSummary?.(sumRes.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (todoId) loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todoId]);

    const toggleItem = async (it) => {
        if (it.completed) {
            await uncompleteItem(todoId, it.id);
        } else {
            await completeItem(todoId, it.id);
        }
        await loadAll();
    };

    const onAdd = async (e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        setSaving(true);
        try {
            await addItem(todoId, t);
            setTitle("");
            await loadAll();
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (itemId) => {
        if (!confirm("確定刪除子任務？")) return;
        await deleteItem(todoId, itemId);
        await loadAll();
    };

    const percent = Math.round(sum.progress * 100);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">任務進度</h3>
                <div className="text-sm text-gray-600">
                    {sum.completed} / {sum.total}（{percent}%）
                </div>
            </div>

            {/* progress bar */}
            <div className="mb-4 h-3 w-full overflow-hidden rounded bg-gray-200">
                <div
                    className="h-3 rounded bg-green-500 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* 新增（Admin） */}
            {isAdmin && (
                <form onSubmit={onAdd} className="mb-3 flex gap-2">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="新增子任務…"
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                        disabled={saving}
                        className='btn-primary btn-md shrink-0 font-semibold'
                    >
                        新增
                    </button>
                </form>
            )}

            {/* 列表 */}
            {loading ? (
                <div className="text-sm text-gray-500">載入中…</div>
            ) : items.length === 0 ? (
                <div className="text-sm text-gray-500">尚無子任務</div>
            ) : (
                <ul className="space-y-2">
                    {items.map((it) => (
                        <li
                            key={it.id}
                            className="flex items-start justify-between rounded border border-gray-200 p-2"
                        >
                            <label className="flex cursor-pointer items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={it.completed}
                                    onChange={() => toggleItem(it)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className={`mb-1 text-sm ${it.completed ? "line-through text-gray-500" : ""}`}>
                                        {it.title}
                                    </div>

                                    {it.completed && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span className="badge" data-kind="completed">
                                                {it.completedByName || "—"}
                                            </span>
                                            <time
                                                className="tabular-nums text-gray-500"
                                                dateTime={it.completedAt ? dayjs.utc(it.completedAt).local().toISOString() : undefined}
                                            >
                                                {it.completedAt
                                                    ? dayjs.utc(it.completedAt).local().format("YYYY/MM/DD HH:mm")
                                                    : "—"}
                                            </time>
                                        </div>
                                    )}
                                </div>

                            </label>

                            {isAdmin && (
                                <button
                                    onClick={() => onDelete(it.id)}
                                    className="text-xs text-red-600 hover:underline"
                                    title="刪除子任務"
                                >
                                    刪除
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodoItems;