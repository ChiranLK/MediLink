import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import customFetch from "../../utils/customFetch";

const STATUS_CFG = {
  unread: {
    label: "Unread",
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  read: {
    label: "Read",
    bg: "bg-slate-100 dark:bg-slate-700",
    text: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  replied: {
    label: "Replied",
    bg: "bg-green-100 dark:bg-green-500/20",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
  },
};

const TOPIC_COLORS = {
  "General Inquiry":
    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Book Appointment":
    "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "Technical Support":
    "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Billing & Payments":
    "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Partner with Us":
    "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "Media & Press":
    "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);
      const { data } = await customFetch.get(
        `/api/auth/admin/messages?${params}`,
      );
      setMessages(data.messages);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await customFetch.patch(`/api/auth/admin/messages/${id}/status`, {
        status: newStatus,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m)),
      );
      if (selected?._id === id)
        setSelected((s) => ({ ...s, status: newStatus }));
      if (newStatus === "read" || newStatus === "replied") {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    setActionLoading(id);
    try {
      await customFetch.delete(`/api/auth/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setTotal((t) => t - 1);
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (msg.status === "unread") {
      handleStatusChange(msg._id, "read");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-manrope">
            Contact Messages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} total messages
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Message list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MessageSquare
            size={40}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
          />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">
            No messages found
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {search || statusFilter
              ? "Try adjusting your filters."
              : "Contact messages from users will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {messages.map((msg) => {
              const sc = STATUS_CFG[msg.status] || STATUS_CFG.unread;
              const tc =
                TOPIC_COLORS[msg.topic] ||
                "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
              const isUnread = msg.status === "unread";

              return (
                <div
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition group ${
                    isUnread ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
                  }`}
                >
                  {/* Status dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${sc.dot} ${isUnread ? "animate-pulse" : ""}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-semibold truncate ${isUnread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"}`}
                      >
                        {msg.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tc}`}
                      >
                        {msg.topic}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      {msg.email}
                    </p>
                    <p
                      className={`text-sm truncate ${isUnread ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {msg.message}
                    </p>
                  </div>

                  {/* Time + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      <Clock size={12} />
                      {formatDate(msg.createdAt)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.status !== "replied" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(msg._id, "replied");
                          }}
                          title="Mark as replied"
                          className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600 dark:text-green-400 transition"
                        >
                          <Reply size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg._id);
                        }}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft
                    size={16}
                    className="text-slate-600 dark:text-slate-300"
                  />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight
                    size={16}
                    className="text-slate-600 dark:text-slate-300"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {selected.status === "unread" ? (
                  <Mail size={18} className="text-blue-500" />
                ) : (
                  <MailOpen size={18} className="text-slate-400" />
                )}
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-manrope">
                  Message Detail
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Sender info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm flex-shrink-0">
                  {selected.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {selected.name}
                  </p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${TOPIC_COLORS[selected.topic] || ""}`}
                >
                  {selected.topic}
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_CFG[selected.status]?.bg} ${STATUS_CFG[selected.status]?.text}`}
                >
                  {STATUS_CFG[selected.status]?.label}
                </span>
                <span className="px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {new Date(selected.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Message body */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selected.status !== "replied" && (
                  <button
                    onClick={() => handleStatusChange(selected._id, "replied")}
                    disabled={actionLoading === selected._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-500/20 text-sm font-semibold transition"
                  >
                    <Reply size={15} /> Mark Replied
                  </button>
                )}
                {selected.status === "read" && (
                  <button
                    onClick={() => handleStatusChange(selected._id, "unread")}
                    disabled={actionLoading === selected._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 text-sm font-semibold transition"
                  >
                    <Mail size={15} /> Mark Unread
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selected._id)}
                  disabled={actionLoading === selected._id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-semibold transition"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
