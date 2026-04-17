import React, { useState, useMemo } from "react";
import { Video, User, Activity, Clock } from "lucide-react";
import customFetch from "@/utils/customFetch";
import toast from "react-hot-toast";
import { format, parseISO, isToday } from "date-fns";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const STATUS_STYLES = {
  Pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Confirmed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Completed: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Cancelled: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
};

const ScheduleList = ({ appointments = [], doctorId }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Filter to today's appointments, sorted by date
  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (!a.appointmentDate) return false;
        try {
          return isToday(parseISO(a.appointmentDate));
        } catch {
          return false;
        }
      })
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime(),
      );
  }, [appointments]);

  const todayStr = format(new Date(), "EEEE, MMM d");

  const handleJoinCall = async (appointmentId, patientId) => {
    if (!doctorId || !patientId) {
      toast.error("Missing doctor or patient id for video call.");
      return;
    }
    setIsConnecting(true);
    try {
      const response = await customFetch.post(
        "/api/consultations/create-session",
        { appointmentId, doctorId, patientId },
      );
      if (response.data.success) {
        const meetingLink = response.data.data?.meetingLink;
        if (meetingLink) {
          toast.success("Consultation session ready!");
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Failed to start consultation:", error);
      toast.error("Could not start video call. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await customFetch.put(`/api/doctors/appointments/${id}/accept`);
      toast.success("Appointment confirmed");
    } catch (err) {
      toast.error("Failed to accept appointment");
    }
  };

  return (
    <div className="w-full font-inter">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] md:text-[22px] font-bold text-[#112429] dark:text-white tracking-tight font-manrope transition-colors">
          Today's Schedule
        </h2>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {todayStr}
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
        {todayAppointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Clock size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No appointments scheduled for today.
            </p>
          </div>
        )}

        {todayAppointments.map((apt) => {
          const isUrgent = apt.urgencyLevel === "high";
          const timeStr = format(parseISO(apt.appointmentDate), "hh:mm");
          const period = format(parseISO(apt.appointmentDate), "a").toUpperCase();

          return (
            <div
              key={apt._id}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl transition-all hover:shadow-md border ${
                isUrgent
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-500/5"
                  : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-teal-100 dark:hover:border-teal-900/30"
              }`}
            >
              {/* Time Column */}
              <div className="w-20 text-center border-r border-slate-100 dark:border-slate-800 pr-6 hidden sm:block">
                <p
                  className={`text-xl font-extrabold transition-colors ${isUrgent ? "text-[#C62828] dark:text-red-400" : "text-[#112429] dark:text-white"}`}
                >
                  {timeStr}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {period}
                </p>
              </div>

              {/* Mobile time */}
              <div className="flex items-center gap-3 sm:hidden mb-2">
                <span
                  className={`text-lg font-black ${isUrgent ? "text-[#C62828] dark:text-red-400" : "text-[#112429] dark:text-white"}`}
                >
                  {timeStr} {period}
                </span>
                {isUrgent && (
                  <span className="bg-[#C62828] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Urgent
                  </span>
                )}
              </div>

              <div className="flex items-center flex-1 gap-4">
                {/* Avatar with initials */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 relative shadow-sm bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center border-2 border-transparent">
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                    {getInitials(apt.patientName)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-bold text-[#112429] dark:text-slate-200 font-manrope">
                      {apt.patientName || "Unknown Patient"}
                    </h4>
                    {isUrgent && (
                      <span className="hidden sm:inline-block bg-[#C62828] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${STATUS_STYLES[apt.status] || STATUS_STYLES.Pending}`}
                    >
                      {apt.status}
                    </span>
                    {apt.specialization && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {apt.specialization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {apt.status === "Pending" && (
                  <button
                    onClick={() => handleAccept(apt._id)}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm bg-[#055153] text-white hover:bg-[#044143] dark:shadow-black/20"
                  >
                    Accept
                  </button>
                )}
                {apt.status === "Confirmed" && (
                  <button
                    onClick={() => handleJoinCall(apt._id, apt.patientId)}
                    disabled={isConnecting}
                    className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm bg-[#055153] text-white hover:bg-[#044143] ${isConnecting ? "opacity-50 cursor-not-allowed" : ""} dark:shadow-black/20`}
                  >
                    {isConnecting ? "Connecting..." : "Join Call"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleList;
