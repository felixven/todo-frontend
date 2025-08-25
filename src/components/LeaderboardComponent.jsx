import React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {getCollabBoard,getCollabDetails,getFinisherBoardById,getFinisherDetailsByUserId,} from "../services/LeaderboardService";
import Loader from "./Loader"; // 共用 Loader（支援 height/size）
dayjs.extend(utc);

// 簡單 Modal
const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
          >
            關閉
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
};

const LeaderBoardComponent = () => {
  const [tab, setTab] = useState("collab"); // collab | finish
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // 主表格資料
  const [error, setError] = useState("");

  // Modal 狀態
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRows, setDetailRows] = useState([]);

  // 依分頁載入榜單
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp =
          tab === "collab" ? await getCollabBoard() : await getFinisherBoardById();
        const data = resp.data;
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || "載入失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // 點數字開明細
  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetailTitle(
      tab === "collab"
        ? `子任務參與度紀錄 - ${row.userName}（userId: ${row.userId}）`
        : `任務完成紀錄 - ${row.userName}（userId: ${row.userId}）`
    );
    setDetailLoading(true);
    setDetailError("");
    setDetailRows([]);

    try {
      const resp =
        tab === "collab"
          ? await getCollabDetails(row.userId)
          : await getFinisherDetailsByUserId(row.userId);
      const data = resp.data;
      setDetailRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setDetailError(e?.response?.data?.message || "載入明細失敗");
    } finally {
      setDetailLoading(false);
    }
  };

  // 表格欄定義（兩個分頁共用 UI，不同資料）
  const header =
    tab === "collab" ? ["使用者", "協作參與次數"] : ["使用者", "任務完成數"];

  // 頁面級載入 / 錯誤快速返回
  if (loading) {
    return (
      <Loader
        text={tab === "collab" ? "協作榜載入中..." : "完成者榜載入中..."}
        height="200px"
        size={40}
      />
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">排行榜</h1>
        <p className="text-sm text-gray-600">協作榜與完成者榜</p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("collab")}
          className={`rounded px-3 py-1 text-sm ${
            tab === "collab"
              ? "btn-primary btn-md"
              : "btn-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          協作榜
        </button>
        <button
          type="button"
          onClick={() => setTab("finish")}
          className={`rounded px-3 py-1 text-sm ${
            tab === "finish"
              ? "btn-success btn-md"
              : "btn-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          完成者榜
        </button>
      </div>

      {/* 卡片 */}
      <div className="rounded-lg border border-gray-300 bg-white shadow">
        <div className="border-b px-4 py-3">
          <span className="text-sm text-gray-700">
            {tab === "collab"
              ? "協作參與度為完成過的所有子任務"
              : "任務完成數為曾點擊『完成』的任務數"}
          </span>
        </div>

        {/* 內容（已簡化：不再判斷 loading/error，因為上層已 return） */}
        <div className="p-4">
          {rows.length === 0 ? (
            <div className="py-6 text-center text-gray-500">目前沒有資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-gray-600">
                      {header[0]}
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-600">
                      {header[1]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{r.userName}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => openDetail(r)}
                          className="text-blue-600 underline-offset-2 hover:underline"
                          title="查看明細"
                        >
                          {tab === "collab" ? r.collabCount : r.finishCount}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 明細 Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
      >
        {detailLoading ? (
          <Loader text="明細載入中..." height="150px" size={30} />
        ) : detailError ? (
          <div className="py-6 text-center text-red-600">{detailError}</div>
        ) : detailRows.length === 0 ? (
          <div className="py-6 text-center text-gray-500">沒有明細</div>
        ) : tab === "collab" ? (
          // 協作明細：[{ todoId, todoTitle, itemId, itemTitle, completedAt }]
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-gray-600">任務</th>
                <th className="px-3 py-2 font-medium text-gray-600">子任務</th>
                <th className="px-3 py-2 font-medium text-gray-600">完成時間</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{d.todoTitle}</td>
                  <td className="px-3 py-2">{d.itemTitle}</td>
                  <td className="px-3 py-2">
                    {d.completedAt
                      ? dayjs.utc(d.completedAt).local().format("YYYY-MM-DD HH:mm")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // 完成者明細：[{ todoId, todoTitle, completedAt }]
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-gray-600">任務</th>
                <th className="px-3 py-2 font-medium text-gray-600">完成時間</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{d.todoTitle}</td>
                  <td className="px-3 py-2">
                    {d.completedAt
                      ? dayjs.utc(d.completedAt).local().format("YYYY-MM-DD HH:mm")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
};

export default LeaderBoardComponent;
