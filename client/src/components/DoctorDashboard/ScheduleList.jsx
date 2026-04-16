import React from 'react';
import { Video, User, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const STATUS_STYLES = {
  Confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Pending:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Completed: 'bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400',
  Cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

const ScheduleList = ({ appointments = [], loading = false }) => {
  const todayStr = format(new Date(), 'EEEE, MMM d');

  if (loading) {
    return (
      <div className="w-full font-inter">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[20px] md:text-[22px] font-bold text-[#112429] dark:text-white tracking-tight font-manrope">Today's Schedule</h2>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{todayStr}</span>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-sm font-medium">Loading schedule…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-inter">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] md:text-[22px] font-bold text-[#112429] dark:text-white tracking-tight font-manrope">Today's Schedule</h2>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{todayStr}</span>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <Clock size={36} className="opacity-30" />
          <p className="text-sm font-semibold">No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {appointments.map((apt) => {
            const patientName = apt.patientName || apt.patientId?.name || 'Patient';
            const aptTime = apt.appointmentDate
              ? format(new Date(apt.appointmentDate), 'hh:mm')
              : '--:--';
            const aptPeriod = apt.appointmentDate
              ? format(new Date(apt.appointmentDate), 'a').toUpperCase()
              : '';
            const statusCls = STATUS_STYLES[apt.status] || STATUS_STYLES.Pending;
            const isVideo = apt.type === 'video' || apt.type === 'Video Call';

            return (
              <div
                key={apt._id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-teal-100 dark:hover:border-teal-900/30 transition-all hover:shadow-md"
              >
                {/* Time */}
                <div className="w-20 text-center border-r border-slate-100 dark:border-slate-800 pr-6 hidden sm:block">
                  <p className="text-xl font-extrabold text-[#112429] dark:text-white">{aptTime}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{aptPeriod}</p>
                </div>

                {/* Mobile time */}
                <div className="flex items-center gap-3 sm:hidden mb-1">
                  <span className="text-lg font-black text-[#112429] dark:text-white">{aptTime} {aptPeriod}</span>
                </div>

                {/* Patient info */}
                <div className="flex items-center flex-1 gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm shrink-0">
                    {getInitials(patientName)}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#112429] dark:text-slate-200 font-manrope">{patientName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md text-[#055153] dark:text-teal-400 bg-[#E6F3F3] dark:bg-teal-500/10">
                        {isVideo ? <Video size={12} strokeWidth={3} /> : <User size={12} strokeWidth={3} />}
                        {isVideo ? 'Video Call' : 'In-person'}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${statusCls}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
