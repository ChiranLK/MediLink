import React, { useMemo } from "react";
import { CalendarCheck, CalendarX, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const ICON_MAP = {
  Pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/10",
  },
  Confirmed: {
    icon: CalendarCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
  },
  Completed: {
    icon: CheckCircle,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/10",
  },
  Cancelled: {
    icon: CalendarX,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-500/10",
  },
};

const statusLabel = {
  Pending: "requested an appointment",
  Confirmed: "appointment confirmed",
  Completed: "consultation completed",
  Cancelled: "appointment cancelled",
};

const ActivityFeed = ({ appointments = [] }) => {
  const recentActivities = useMemo(() => {
    return [...appointments]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt),
      )
      .slice(0, 5)
      .map((apt) => {
        const dateStr = apt.updatedAt || apt.createdAt;
        let timeAgo = "";
        try {
          timeAgo = formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
        } catch {
          timeAgo = "";
        }
        const mapping = ICON_MAP[apt.status] || ICON_MAP.Pending;
        return {
          id: apt._id,
          icon: mapping.icon,
          iconColor: mapping.color,
          iconBg: mapping.bg,
          patientName: apt.patientName || "Unknown",
          label: statusLabel[apt.status] || "updated",
          time: timeAgo.toUpperCase(),
        };
      });
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 font-inter transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#112429] dark:text-white font-manrope">
          Recent Patient Activity
        </h3>
      </div>

      {recentActivities.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
          No recent activity yet.
        </p>
      )}

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[17px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 pl-2">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="relative flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${activity.iconBg} border-4 border-white dark:border-slate-900`}
            >
              <activity.icon
                size={12}
                className={activity.iconColor}
                strokeWidth={3}
              />
            </div>
            <div className="pt-1 pb-2">
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-snug">
                <span className="text-[#112429] dark:text-slate-200">
                  <strong>{activity.patientName}</strong> {activity.label}
                </span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
