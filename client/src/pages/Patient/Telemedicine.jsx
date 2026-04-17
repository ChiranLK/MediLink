import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  Video,
  Loader2,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Stethoscope,
  Monitor,
  WifiOff,
} from "lucide-react";
import customFetch from "../../utils/customFetch";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

/* ── Status badge helpers ─────────────────────────────────────────── */
const statusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  active: {
    label: "Live Now",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Video,
  },
  completed: {
    label: "Completed",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  none: {
    label: "Not Started",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: AlertCircle,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.none;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest border ${cfg.color}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

/* ── Safe date format ─────────────────────────────────────────────── */
const safeFmt = (dateStr, fmt) => {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return "—";
  }
};

/* ── Main Component ───────────────────────────────────────────────── */
const PatientTelemedicine = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState({}); // keyed by appointmentId
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null); // appointmentId being joined

  /* ── Fetch patient's appointments ──────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get all my appointments
      const { data: aptData } = await customFetch.get(
        "/api/appointment/my-appointments",
      );
      const apts = aptData.appointments || aptData.data || aptData || [];
      setAppointments(apts);

      // 2. For each appointment, check if a consultation session exists
      const consultMap = {};
      await Promise.allSettled(
        apts.map(async (apt) => {
          try {
            const { data } = await customFetch.get(
              `/api/consultations/${apt._id}`,
            );
            if (data.success) consultMap[apt._id] = data.data;
          } catch {
            // No session yet for this appointment — that's fine
          }
        }),
      );
      setConsultations(consultMap);
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Join a video call ──────────────────────────────────────────── */
  const handleJoinCall = (apt) => {
    const session = consultations[apt._id];
    if (!session) {
      toast.error("The doctor has not started this session yet. Please wait.");
      return;
    }
    if (session.status === "completed") {
      toast.error("This consultation session has already ended.");
      return;
    }
    if (session.status === "cancelled") {
      toast.error("This consultation was cancelled.");
      return;
    }
    setJoining(apt._id);
    toast.success("Opening video consultation…");
    // Frontend should open meetingLink in browser for video call
    window.open(session.meetingLink, "_blank", "noopener,noreferrer");
    setTimeout(() => setJoining(null), 2000);
  };

  /* ── Copy link ─────────────────────────────────────────────────── */
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
  };

  /* ── Separate upcoming vs. past ─────────────────────────────────── */
  const upcoming = appointments.filter((a) =>
    ["Confirmed", "Pending"].includes(a.status),
  );
  const past = appointments.filter((a) =>
    ["Completed", "Cancelled"].includes(a.status),
  );

  return (
    <div className="w-full min-h-full bg-[#F8FAFB] dark:bg-slate-950 p-4 lg:p-8 font-inter transition-colors duration-300">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#055153]/10 text-[#055153] rounded-lg text-[11px] font-extrabold uppercase tracking-widest mb-3 border border-[#055153]/20">
          <Monitor size={13} /> Telemedicine Service
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-[26px] lg:text-[30px] font-black text-[#0D1C2E] dark:text-white tracking-tight font-manrope leading-tight">
              My Video Consultations
            </h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1">
              Join your scheduled Jitsi Meet video sessions with your doctor.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── How it works banner ──────────────────────────────────── */}
      <div className="mb-8 p-5 bg-gradient-to-r from-[#055153]/10 to-blue-500/5 border border-[#055153]/20 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 bg-[#055153] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#055153]/20">
          <Video size={22} className="text-white" />
        </div>
        <div>
          <h3 className="text-[14px] font-black text-[#0D1C2E] dark:text-white">
            How to join a video consultation
          </h3>
          <ul className="text-[12px] text-slate-600 dark:text-slate-300 font-medium mt-1 space-y-0.5">
            <li>
              1. Wait for your doctor to start the session — you'll see a{" "}
              <strong>"Join Call"</strong> button appear
            </li>
            <li>
              2. Click the button — a Jitsi Meet room opens automatically in
              your browser
            </li>
            <li>
              3. No app download required — works entirely in your browser
            </li>
          </ul>
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={36} className="animate-spin text-[#055153]" />
        </div>
      )}

      {/* ── Upcoming Consultations ─────────────────────────────── */}
      {!loading && (
        <section className="mb-10">
          <h2 className="text-[16px] font-black text-[#0D1C2E] mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-[#055153]" />
            Upcoming Appointments
            <span className="ml-1 px-2 py-0.5 bg-[#055153]/10 text-[#055153] rounded-full text-[11px] font-extrabold">
              {upcoming.length}
            </span>
          </h2>

          {upcoming.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <Calendar size={28} className="text-slate-300" />
              </div>
              <h3 className="text-[16px] font-black text-[#0D1C2E] mb-1">
                No Upcoming Appointments
              </h3>
              <p className="text-slate-400 text-[13px]">
                Book an appointment to get started with telemedicine.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((apt) => {
                const session = consultations[apt._id];
                const sessionStatus = session?.status || "none";
                const canJoin =
                  session &&
                  !["completed", "cancelled"].includes(session.status);
                const isLive = session?.status === "active";

                return (
                  <div
                    key={apt._id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden transition-all ${isLive ? "border-emerald-200 dark:border-emerald-700 shadow-emerald-100 dark:shadow-emerald-900/20" : "border-slate-100 dark:border-slate-800"}`}
                  >
                    {/* Live indicator bar */}
                    {isLive && (
                      <div className="bg-emerald-500 text-white text-center text-[11px] font-extrabold tracking-widest py-1.5 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE SESSION — YOUR DOCTOR IS WAITING
                      </div>
                    )}

                    <div className="p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLive ? "bg-emerald-50" : "bg-[#055153]/10"}`}
                      >
                        <Stethoscope
                          size={24}
                          className={
                            isLive ? "text-emerald-600" : "text-[#055153]"
                          }
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-[16px] font-black text-[#0D1C2E]">
                            {apt.specialization ||
                              apt.recommendedSpecialty ||
                              "General Consultation"}
                          </h3>
                          <StatusBadge status={sessionStatus} />
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              apt.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700"
                                : apt.status === "Pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {apt.appointmentDate
                              ? safeFmt(apt.appointmentDate, "MMMM do, yyyy")
                              : "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {apt.appointmentDate
                              ? safeFmt(apt.appointmentDate, "h:mm a")
                              : "—"}
                          </span>
                        </div>
                        {apt.symptoms && (
                          <p className="text-[12px] text-slate-400 mt-1 line-clamp-1">
                            Symptoms: {apt.symptoms}
                          </p>
                        )}
                        {session?.meetingLink && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[260px]">
                              {session.meetingLink}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyLink(session.meetingLink)
                              }
                              className="text-slate-400 hover:text-[#055153] transition-colors"
                              title="Copy link"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {canJoin ? (
                          <button
                            onClick={() => handleJoinCall(apt)}
                            disabled={joining === apt._id}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[14px] shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 ${
                              isLive
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
                                : "bg-[#055153] hover:bg-[#044042] text-white shadow-[#055153]/20"
                            }`}
                          >
                            {joining === apt._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Video size={16} />
                            )}
                            {joining === apt._id
                              ? "Opening…"
                              : isLive
                                ? "Join Now"
                                : "Join Call"}
                            <ExternalLink size={12} />
                          </button>
                        ) : session?.status === "completed" ? (
                          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-500 text-[13px] font-bold">
                            <CheckCircle2 size={15} /> Session Ended
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 text-blue-600 text-[13px] font-bold border border-blue-100">
                              <WifiOff size={15} /> Waiting for Doctor
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium text-center max-w-[160px]">
                              The button will activate once your doctor starts
                              the session
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Past Consultations ──────────────────────────────────── */}
      {!loading && past.length > 0 && (
        <section>
          <h2 className="text-[16px] font-black text-[#0D1C2E] dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-slate-400" />
            Past Consultations
            <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-extrabold">
              {past.length}
            </span>
          </h2>
          <div className="space-y-3">
            {past.map((apt) => {
              const session = consultations[apt._id];
              return (
                <div
                  key={apt._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm opacity-80"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="text-[14px] font-bold text-[#0D1C2E] dark:text-white">
                        {apt.specialization ||
                          apt.recommendedSpecialty ||
                          "Consultation"}
                      </h4>
                      <StatusBadge
                        status={
                          session?.status ||
                          (apt.status === "Cancelled"
                            ? "cancelled"
                            : "completed")
                        }
                      />
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium">
                      {apt.appointmentDate
                        ? safeFmt(apt.appointmentDate, "MMMM do, yyyy • h:mm a")
                        : "—"}
                    </p>
                    {session?.notes && (
                      <p className="text-[12px] text-slate-500 mt-1 italic">
                        Doctor's notes: {session.notes}
                      </p>
                    )}
                  </div>
                  {session?.meetingLink && (
                    <button
                      onClick={() => handleCopyLink(session.meetingLink)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-500 hover:text-[#055153] hover:border-[#055153]/30 transition-all shrink-0"
                    >
                      <Copy size={12} /> Copy Link
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default PatientTelemedicine;
