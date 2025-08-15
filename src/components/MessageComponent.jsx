import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getMessages, addMessage, deleteMessage } from "../services/MessageService";
import { getLoggedInUser, isAdminUser } from "../services/AuthService";

dayjs.extend(utc);

const MAX_LEN = 2000;

const MessageComponent = ({ todoId }) => {
  const me = getLoggedInUser();
  const isAdmin = isAdminUser();

  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const listRef = useRef(null); // 自動捲到底

  const fmt = (t) => (t ? dayjs.utc(t).local().format("YYYY-MM-DD HH:mm") : "—");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await getMessages(todoId);
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || "留言載入失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (todoId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoId]);

  // 列表更新後自動捲到最底
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [items]);

  async function onSubmit(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSending(true);
    setError("");
    try {
      await addMessage(todoId, content);
      setText("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "送出失敗");
    } finally {
      setSending(false);
    }
  }

  async function onDelete(id, authorUsername) {
    if (!isAdmin && authorUsername !== me) return; // 前端檢查；後端已把關
    setError("");
    try {
      await deleteMessage(todoId, id);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "刪除失敗");
    }
  }

  const remaining = MAX_LEN - text.length;
  const canSend = !sending && text.trim().length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">留言</h3>

      {/* 錯誤提示 */}
      {error && (
        <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-sm text-gray-500">留言載入中…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">還沒有留言</div>
      ) : (
        <div ref={listRef} className="space-y-3 mb-3 max-h-80 overflow-auto pr-1">
          {items.map((m) => (
            <div key={m.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{m.authorFullName}</span>
                  <span className="ml-2 text-xs text-gray-500">{fmt(m.createdAt)}</span>
                </div>
                {(isAdmin || m.username === me) && (
                  <button
                    onClick={() => onDelete(m.id, m.username)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    刪除
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 送出區 */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="寫點什麼…（Enter 送出，Shift+Enter 換行）"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) onSubmit(e);
            }}
            maxLength={MAX_LEN}
            className="w-full resize-y rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="mt-1 text-right text-xs text-gray-500">{remaining} / {MAX_LEN}</div>
        </div>

        <button
          disabled={!canSend}
          className="shrink-0 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {sending ? "送出中…" : "送出"}
        </button>
      </form>
    </div>
  );
};

export default MessageComponent;
