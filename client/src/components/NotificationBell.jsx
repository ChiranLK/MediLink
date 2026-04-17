import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  CalendarCheck,
  VideoIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { patientApi } from "@/patient/services/patientApi";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

// ── Config ────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  APPOINTMENT_BOOKED: {
    icon: CalendarCheck,
    label: "Appointment Booked",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/30",
    ring: "ring-teal-200 dark:ring-teal-800",
  },
  CONSULTATION_COMPLETED: {
    icon: VideoIcon,
    label: "Consultation Completed",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/30",
    ring: "ring-violet-200 dark:ring-violet-800",
  },
  APPOINTMENT_BOOKED_DOCTOR: {
    icon: CalendarCheck,
    label: "New Appointment",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    ring: "ring-blue-200 dark:ring-blue-800",
  },
  CONSULTATION_COMPLETED_DOCTOR: {
    icon: VideoIcon,
    label: "Consultation Completed",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/30",
    ring: "ring-indigo-200 dark:ring-indigo-800",
  },
  PROFILE_UPDATED: {
    icon: UserCog,
    label: "Profile Updated",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    ring: "ring-amber-200 dark:ring-amber-800",
  },
};

const STATUS_CONFIG = {
  SUCCESS: {
    icon: CheckCircle2,
    label: "Delivered",
    style: "text-emerald-600 dark:text-emerald-400",
  },
  PARTIAL_SUCCESS: {
    icon: AlertCircle,
    label: "Partial",
    style: "text-amber-600 dark:text-amber-400",
  },
  FAILED: {
    icon: AlertCircle,
    label: "Failed",
    style: "text-red-500 dark:text-red-400",
  },
};

// ── Row ───────────────────────────────────────────────────────────
function NotificationRow({ n, onMarkRead }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.APPOINTMENT_BOOKED;
  const statusCfg = STATUS_CONFIG[n.status] || STATUS_CONFIG.SUCCESS;
  const Icon = cfg.icon;
  const StatusIcon = statusCfg.icon;
  const isUnread = !n.read;

  return (
    <div
      className={`flex gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
        isUnread ? "bg-teal-50/40 dark:bg-teal-900/10" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ring-1 ${cfg.ring} flex items-center justify-center mt-0.5`}
      >
        <Icon size={16} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {cfg.label}
            {isUnread && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            )}
          </p>
          <span
            className={`flex items-center gap-0.5 text-[10px] font-semibold flex-shrink-0 ${statusCfg.style}`}
          >
            <StatusIcon size={10} />
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {n.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
            </span>
          </div>
          {isUnread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(n._id);
              }}
              className="text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold flex items-center gap-0.5"
              title="Mark as read"
            >
              <Check size={10} />
              Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Bell ─────────────────────────────────────────────────────
export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const lastFetch = useRef(null);

  const recipientId = user?.userId || user?.id;

  const fetchHistory = useCallback(async () => {
    if (!user?.email && !recipientId) return;
    if (lastFetch.current && Date.now() - lastFetch.current < 30_000) return;
    try {
      setLoading(true);
      lastFetch.current = Date.now();
      const { data } = await patientApi.getNotificationHistory(
        user?.email,
        recipientId,
      );
      setNotifications(data || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user?.email, recipientId]);

  // Fetch on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Refresh every 60 s when panel is open
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      lastFetch.current = null;
      fetchHistory();
    }, 60_000);
    return () => clearInterval(id);
  }, [open, fetchHistory]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen((v) => {
      if (!v) {
        lastFetch.current = null;
        fetchHistory();
      }
      return !v;
    });
  };

  const handleMarkRead = async (id) => {
    try {
      await patientApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await patientApi.markAllNotificationsRead(recipientId, user?.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleClearAll = async () => {
    try {
      await patientApi.clearNotifications(recipientId, user?.email);
      setNotifications([]);
    } catch {
      // silent
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {unreadCount === 0 && notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#055153]/10 dark:bg-teal-900/40 flex items-center justify-center">
                <Bell size={14} className="text-[#055153] dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Notifications
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {notifications.length} total
                  {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  lastFetch.current = null;
                  fetchHistory();
                }}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all as read
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  All caught up!
                </span>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
          )}

          {/* Panel Body */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-400 dark:text-slate-500">
                <RefreshCw size={16} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Bell size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  You'll be notified here after booking an appointment or
                  completing a consultation.
                </p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <NotificationRow
                  key={n._id || i}
                  n={n}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>

          {/* Panel Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                Email & SMS notifications are sent automatically
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
