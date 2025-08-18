import React, { useEffect } from 'react'
import { useState } from 'react'
import { getTodo, saveTodo, updateTodo } from '../services/TodoService'
import { listItems, addItem } from "../services/TodoItemService";
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);



dayjs.extend(utc);

const TodoComponent = () => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  // 新增中的細項輸入列（可多筆）
  const [newItems, setNewItems] = useState([{ title: "" }]);
  // 既有細項（編輯模式）
  const [existingItems, setExistingItems] = useState([]);
  // 預刪除集合：提交時才真的刪
  const [pendingDeletes, setPendingDeletes] = useState(new Set());

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    getTodo(id)
      .then(({ data }) => {
        setTitle(data.title);
        setDueDate(data.dueDate);
        setDescription(data.description);
        setCompleted(data.completed);
      })
      .catch(console.error);

    listItems(id)
      .then(({ data }) => setExistingItems(data))
      .catch(() => setExistingItems([]));
  }, [id]);

  // 新增細項列操作
  const onAddRow = () => setNewItems((arr) => [...arr, { title: "" }]);
  const onRemoveRow = (idx) =>
    setNewItems((arr) =>
      arr.length === 1 ? [{ title: "" }] : arr.filter((_, i) => i !== idx)
    );
  const onChangeRow = (idx, v) =>
    setNewItems((arr) => arr.map((it, i) => (i === idx ? { ...it, title: v } : it)));

  // 標記 / 取消預刪除
  const togglePendingDelete = (itemId) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const todo = { title, dueDate, description, completed };

    try {
      if (id) {
        // 更新主任務
        await updateTodo(id, todo);

        // 先處理預刪除（既有細項）
        if (pendingDeletes.size > 0) {
          await Promise.all(
            Array.from(pendingDeletes).map((itemId) => deleteItem(id, itemId))
          );
        }

        // 再新增「新增列」裡非空白的細項
        const payloads = newItems.map((i) => i.title.trim()).filter(Boolean);
        for (const t of payloads) await addItem(id, t);
      } else {
        // 新增主任務
        const { data: saved } = await saveTodo(todo);
        const todoId = saved.id;

        // 新增細項
        const payloads = newItems.map((i) => i.title.trim()).filter(Boolean);
        for (const t of payloads) await addItem(todoId, t);
      }

      navigate("/todos");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-10 bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded px-8 py-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {id ? "編輯任務" : "新增任務"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* 標題 */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">任務標題</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入任務標題"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 說明 */}
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

          {/* 截止日 */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">截止日期</label>
            <input
              type="date"
              min={dayjs().format("YYYY-MM-DD")}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* 狀態 */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">任務狀態</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none"
              value={String(completed)}
              onChange={(e) => setCompleted(e.target.value === "true")}
            >
              <option value="false">未完成</option>
              <option value="true">已完成</option>
            </select>
          </div>

          {/* 細項（新增 / 編輯一致） */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">細項（可多筆）</label>

            {/* 既有細項（編輯模式；預刪除） */}
            {id && (
              <div className="mb-3 space-y-2">
                {existingItems.length > 0 ? (
                  existingItems.map((it) => {
                    const marked = pendingDeletes.has(it.id);
                    return (
                      <div key={it.id} className="flex items-center gap-2">
  <input
    value={it.title}
    readOnly
    className={`flex-1 border px-3 py-2 rounded ${
      marked
        ? "bg-red-50 border-red-300 text-red-700"
        : "bg-gray-50 border-gray-200 text-gray-700"
    }`}
  />
  <button
    type="button"
    onClick={() => togglePendingDelete(it.id)}
    className={`inline-flex items-center justify-center shrink-0 whitespace-nowrap
                h-8 px-2 rounded-md border text-xs font-medium
                ${marked ? "text-gray-700 border-gray-300" : "text-red-600 border-red-300"}
                hover:bg-gray-100`}
    title={marked ? "取消預刪除" : "預刪除"}
  >
    {marked ? "還原" : "預刪除"}
  </button>
</div>

                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">目前沒有細項</div>
                )}
              </div>
            )}

            {/* 新增細項輸入列 */}
            <div className="space-y-2">
              {newItems.map((it, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={it.title}
                    onChange={(e) => onChangeRow(idx, e.target.value)}
                    placeholder={`細項 #${idx + 1}`}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                 <button
  type="button"
  onClick={() => onRemoveRow(idx)}
  className="inline-flex items-center justify-center shrink-0 whitespace-nowrap
             h-8 px-2 rounded-md border text-xs text-gray-700 hover:bg-gray-100"
  title="移除這列"
>
  移除
</button>

                </div>
              ))}
              <button
                type="button"
                onClick={onAddRow}
                className="mt-1 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                + 新增一列
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-60"
          >
            {saving ? "儲存中…" : id ? "更新任務" : "送出任務"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TodoComponent;