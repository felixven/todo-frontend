import React, { useEffect } from 'react'
import { useState } from 'react'
import { getTodo, saveTodo, updateTodo } from '../services/TodoService'
import { listItems, addItem, deleteItem } from "../services/TodoItemService";
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
    const idNum = Number(itemId); // 保證型別一致
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(idNum)) {
        next.delete(idNum);
      } else {
        next.add(idNum);
      }
      return next;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const todoId = Number(id); // 確保數字型別
    const todo = { title, dueDate, description, completed };

    try {
      if (id) {
        // 更新主任務
        await updateTodo(todoId, todo);

        // 刪除已標記的子任務（逐筆執行，避免一筆失敗影響其他刪除）
        const deletes = Array.from(pendingDeletes);
        if (deletes.length > 0) {
          for (const itemId of deletes) {
            try {
              await deleteItem(todoId, itemId);
            } catch (err) {
              console.error("刪除失敗", todoId, itemId, err.response?.status, err.response?.data);
            }
          }
        }

        // 新增子任務（非空白）
        const payloads = newItems.map((i) => i.title.trim()).filter(Boolean);
        for (const t of payloads) {
          await addItem(todoId, t);
        }
      } else {
        // 新增主任務
        const { data: saved } = await saveTodo(todo);
        const todoIdNew = saved.id;

        // 新增子任務
        const payloads = newItems.map((i) => i.title.trim()).filter(Boolean);
        for (const t of payloads) {
          await addItem(todoIdNew, t);
        }
      }

      navigate("/todos"); // 全部完成後返回清單
    } catch (err) {
      console.error("更新失敗", err);
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
            <label className="block text-gray-700 mb-2">子任務（可多筆）</label>

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
                          className={`flex-1 border px-3 py-2 rounded ${marked
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => togglePendingDelete(it.id)}
                          className={`btn btn-md border
                        ${marked ? "text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-300"
                              : "text-status-overdue border-status-overdue/60 hover:bg-status-overdue/10 focus:ring-status-overdue/20"
                            }`}
                          title={marked ? "取消預刪除" : "刪除"}
                        >
                          {marked ? "還原" : "刪除"}
                        </button>

                      </div>

                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">目前沒有子任務</div>
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
                    className="btn btn-md bg-white font-normal text-gray-800
             border-[0.5px] border-status-overdue/50
             hover:bg-status-overdue/5 focus:ring-status-overdue/20"
                    title="移除這列"
                  >
                    清空
                  </button>

                </div>
              ))}
              <button
                type="button"
                onClick={onAddRow}
                className='btn-primary btn-md'
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