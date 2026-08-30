"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaBell, FaCheckDouble, FaTrash, FaCircle, FaRegClock } from "react-icons/fa";
import { FiX } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_IS_PROD === "true"
  ? "https://localhelp-hu2d.onrender.com"
  : "http://localhost:4040";

const typeIcon = {
  BOOKING_REQUEST: "🔔",
  BOOKING_ACCEPTED: "✅",
  BOOKING_REJECTED: "❌",
  BOOKING_CANCELLED: "⚠️",
  BOOKING_COMPLETED: "🎉",
  REVIEW: "⭐",
  USER_BLOCKED: "🚫",
  USER_UNBLOCKED: "🔓",
  INFO: "💬",
  SYSTEM: "⚙️"
};

const typeColor = {
  BOOKING_REQUEST: "bg-amber-100 text-amber-700 border-amber-200",
  BOOKING_ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  BOOKING_CANCELLED: "bg-red-100 text-red-700 border-red-200",
  BOOKING_COMPLETED: "bg-violet-100 text-violet-700 border-violet-200",
  REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
  USER_BLOCKED: "bg-red-100 text-red-700 border-red-200",
  INFO: "bg-stone-100 text-stone-600 border-stone-200",
  SYSTEM: "bg-slate-100 text-slate-600 border-slate-200"
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return new Date(date).toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/api/notifications`, { headers });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // silent - mock fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_BASE}/api/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_BASE}/api/notifications/read-all`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/api/notifications/${id}`, { headers });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  if (!token) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl bg-white border border-[#e5dcc7] hover:bg-[#fdfcfa] hover:border-[#d6c7b4] transition-all shadow-sm group"
        aria-label="Notifications"
      >
        <FaBell className={`text-lg ${unreadCount > 0 ? "text-[#6F4E37]" : "text-[#8a7a6e] group-hover:text-[#6F4E37]"} transition-colors`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-[#c0392b] text-white text-[11px] font-bold rounded-full border-2 border-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-[#e5dcc7] overflow-hidden z-50 animate-in">
          {/* Header */}
          <div className="px-5 py-4 bg-[#fdfcfa] border-b border-[#e5dcc7] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#4a2e21] tracking-tight">Notifications</h3>
              <p className="text-xs text-[#8a7a6e] mt-0.5">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#6F4E37] hover:text-[#4a2e21] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#f1dfc9] transition"
                >
                  <FaCheckDouble className="text-[11px]" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[#f1dfc9] text-[#8a7a6e] transition">
                <FiX />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#6F4E37] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#8a7a6e]">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#f1dfc9] flex items-center justify-center mb-3">
                  <FaBell className="text-[#8a7a6e] text-xl" />
                </div>
                <p className="text-sm font-semibold text-[#4a2e21]">No notifications yet</p>
                <p className="text-xs text-[#8a7a6e] mt-1 leading-relaxed">We’ll notify you when there’s a booking update, review, or admin action.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f1dfc9]/60">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3.5 flex gap-3 hover:bg-[#fdfcfa] transition group relative ${!n.isRead ? "bg-[#fffbf5]" : ""}`}
                  >
                    {!n.isRead && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6F4E37] rounded-r" />}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm shrink-0 mt-0.5 ${typeColor[n.type] || typeColor.INFO}`}>
                      {typeIcon[n.type] || "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug pr-1 ${!n.isRead ? "font-semibold text-[#4a2e21]" : "font-medium text-[#5a4a3e]"}`}>{n.title}</p>
                        {!n.isRead && <FaCircle className="text-[8px] text-[#6F4E37] mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-[#6b5d52] mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-[#9a8e83] flex items-center gap-1"><FaRegClock className="text-[10px]" />{timeAgo(n.createdAt)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f1dfc9] text-[#6F4E37] font-medium border border-[#e5dcc7]">{n.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg bg-white border border-[#e5dcc7] hover:bg-[#f1dfc9] text-[#6F4E37] transition" title="Mark read">
                          <FaCheckDouble className="text-xs" />
                        </button>
                      )}
                      <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg bg-white border border-[#e5dcc7] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#9a8e83] transition" title="Delete">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-[#fdfcfa] border-t border-[#e5dcc7] text-center">
              <p className="text-[11px] text-[#9a8e83]">Updates every 15s • Professional notification system</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
