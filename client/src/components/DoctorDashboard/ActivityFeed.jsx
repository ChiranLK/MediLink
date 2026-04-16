import React from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  Confirmed: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
  Pending:   { icon: Clock,       color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-500/10' },
  Completed: { icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/10' },
  Cancelled: { icon: XCircle,     color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/10' },
};

const FALLBACK = { icon: Calendar, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700/30' };

const ActivityFeed = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 font-inter transition-all duration-300">
        <h3 className="text-lg font-bold text-[#112429] dark:text-white font-manrope mb-6">Recent Patient Activity</h3>
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={18} />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 font-inter transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#112429] dark:text-white font-manrope">Recent Patient Activity</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No recent activity.</p>
      ) : (
        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[17px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 pl-2">
          {activities.map((a) => {
            const cfg = STATUS_CONFIG[a.status] || FALLBACK;
            const Icon = cfg.icon;
            const patientName = a.patientName || a.patientId?.name || 'Patient';
            const timeAgo = a.createdAt || a.appointmentDate
              ? formatDistanceToNow(new Date(a.createdAt || a.appointmentDate), { addSuffix: false }).toUpperCase() + ' AGO'
              : '';

            let action = 'booked an appointment';
            if (a.status === 'Confirmed') action = 'appointment confirmed';
            else if (a.status === 'Completed') action = 'consultation completed';
            else if (a.status === 'Cancelled') action = 'appointment cancelled';

            return (
              <div key={a._id} className="relative flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg} border-4 border-white dark:border-slate-900`}>
                  <Icon size={12} className={cfg.color} strokeWidth={3} />
                </div>
                <div className="pt-1 pb-2">
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-snug">
                    <span className="text-[#112429] dark:text-slate-200 font-bold">{patientName}</span>{' '}
                    {action}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                    {timeAgo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
