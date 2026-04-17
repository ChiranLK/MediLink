import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Video,
  PlusCircle,
  Calendar,
  FileText,
  Upload,
  Users,
  Bell,
  ClipboardList,
  Pill,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import customFetch from "@/utils/customFetch";
import toast from "react-hot-toast";

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();

  const [isJoining, setIsJoining] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState("none");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [nextConsultation, setNextConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real data states
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Load appointments
        const { data: aptData } = await customFetch.get(
          "/api/appointment/my-appointments",
        );
        const apts = aptData.appointments || aptData.data || aptData || [];
        setAppointments(Array.isArray(apts) ? apts : []);

        // Find next upcoming confirmed appointment
        const confirmed = (Array.isArray(apts) ? apts : [])
          .filter((a) => a.status === "Confirmed")
          .sort(
            (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
          );
        const apt = confirmed[0] || null;
        setNextAppointment(apt);

        if (apt) {
          try {
            const { data: cData } = await customFetch.get(
              `/api/consultations/${apt._id}`,
            );
            if (cData.success) {
              setNextConsultation(cData.data);
              setConsultationStatus(cData.data.status);
            }
          } catch {
            setConsultationStatus("none");
          }
        }

        // 2. Load patient profile to get _id for other calls
        let patientId = null;
        try {
          const { data: pData } = await customFetch.get(
            `/api/patient/patients/${user?.userId}`,
          );
          const profile = pData.data || pData;
          patientId = profile?._id;
        } catch {
          // Profile not found
        }

        // 3. Load prescriptions & reports in parallel (need patientId)
        if (patientId) {
          const [prescRes, reportRes] = await Promise.allSettled([
            customFetch.get(`/api/prescriptions/patient/${patientId}?limit=5`),
            customFetch.get(`/api/patient/reports/patient/${patientId}`),
          ]);

          if (prescRes.status === "fulfilled") {
            const pData = prescRes.value.data;
            setPrescriptions(pData.data || pData || []);
          }
          if (reportRes.status === "fulfilled") {
            const rData = reportRes.value.data;
            setReports(rData.data || rData || []);
          }
        }

        // 4. Load notifications
        try {
          const { data: nData } = await customFetch.get(
            `/api/notification/history?recipientId=${user?.userId}&limit=5`,
          );
          setNotifications(nData.data || []);
        } catch {
          // Notifications unavailable
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) loadDashboardData();
  }, [user?.userId]);

  const handleJoinVideoCall = async () => {
    if (!nextAppointment) {
      toast.error("No upcoming appointment found.");
      return;
    }
    if (consultationStatus === "completed") {
      toast.error("This session has already ended.");
      return;
    }
    if (consultationStatus === "none" || !nextConsultation) {
      toast.error("Your doctor has not started the session yet. Please wait.");
      return;
    }
    setIsJoining(true);
    try {
      const { meetingLink, status } = nextConsultation;
      if (status === "completed") {
        setConsultationStatus("completed");
        toast.error("This session has already ended.");
        return;
      }
      toast.success("Opening video consultation…");
      window.open(meetingLink, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Video call is not ready yet. Please wait for the doctor.");
    } finally {
      setIsJoining(false);
    }
  };

  // Helpers
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName =
    user?.name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Patient";

  // Computed stats from real data
  const totalAppointments = appointments.length;
  const upcomingCount = appointments.filter(
    (a) => a.status === "Confirmed" || a.status === "Pending",
  ).length;
  const activePrescriptions = (
    Array.isArray(prescriptions) ? prescriptions : []
  ).filter((p) => p.status === "Active").length;

  // Recent appointments (last 5, non-cancelled)
  const recentAppointments = [...appointments]
    .filter((a) => a.status !== "Cancelled")
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 5);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const statusConfig = {
    Confirmed: {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: Clock,
    },
    Pending: {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      icon: AlertCircle,
    },
    Completed: {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      icon: CheckCircle2,
    },
    Cancelled: {
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      icon: XCircle,
    },
  };

  if (loading) {
    return (
      <div className="w-full p-4 md:p-8 bg-[#F8FAFB] dark:bg-slate-950 min-h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 bg-[#F8FAFB] dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#112429] dark:text-white tracking-tight leading-tight mb-1">
          {getGreeting()},{" "}
          <span className="text-[#055153] dark:text-teal-400">{firstName}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          {format(today, "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      {/* ── Top: Appointment Hero + Quick Actions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Next Appointment Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#055153] to-[#0D877B] rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-[#055153]/20 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="z-10 w-full md:w-auto flex-1">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase mb-3">
              Next Appointment
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-1.5">
              {nextAppointment
                ? nextAppointment.doctorName || "Consultation"
                : "No Upcoming Appointments"}
            </h2>
            <p className="text-white/80 text-sm mb-1">
              {nextAppointment
                ? nextAppointment.recommendedSpecialty ||
                  nextAppointment.specialization ||
                  "General"
                : "Book an appointment to get started"}
            </p>
            {nextAppointment && (
              <p className="text-white/70 text-sm mb-6">
                {(() => {
                  try {
                    const d = new Date(nextAppointment.appointmentDate);
                    return `${d.toDateString()} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                  } catch {
                    return "Date TBD";
                  }
                })()}
              </p>
            )}
            {!nextAppointment && <div className="mb-6" />}
            <button
              onClick={handleJoinVideoCall}
              disabled={
                isJoining ||
                consultationStatus === "completed" ||
                !nextAppointment
              }
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all shadow-sm disabled:opacity-50 ${
                consultationStatus === "completed" || !nextAppointment
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : consultationStatus === "none"
                    ? "bg-white/20 text-white border border-white/40 cursor-not-allowed"
                    : "bg-white text-[#055153] hover:bg-emerald-50"
              }`}
            >
              <Video size={18} />
              {isJoining
                ? "Connecting…"
                : !nextAppointment
                  ? "No Appointment"
                  : consultationStatus === "completed"
                    ? "Session Ended"
                    : consultationStatus === "none"
                      ? "Waiting for Doctor…"
                      : "Join Video Call"}
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-white opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-black opacity-10 rounded-full blur-3xl" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
            Quick Actions
          </h3>
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center justify-center gap-2.5 w-full bg-[#055153] hover:bg-[#033A3C] dark:bg-teal-600 dark:hover:bg-teal-500 text-white p-3.5 rounded-xl shadow-md shadow-[#055153]/25 dark:shadow-teal-900/40 transition-all font-bold text-sm"
          >
            <PlusCircle size={18} />
            Book Appointment
          </button>
          <button
            onClick={() => navigate("/patient/appointments")}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-semibold text-[#112429] dark:text-slate-200 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-[#055153] dark:text-emerald-400">
              <Calendar size={18} />
            </div>
            My Appointments
            {upcomingCount > 0 && (
              <span className="ml-auto text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {upcomingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/patient/prescriptions")}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-semibold text-[#112429] dark:text-slate-200 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Pill size={18} />
            </div>
            My Prescriptions
            {activePrescriptions > 0 && (
              <span className="ml-auto text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {activePrescriptions}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/patient/reports")}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-semibold text-[#112429] dark:text-slate-200 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Upload size={18} />
            </div>
            Upload Report
          </button>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-semibold text-[#112429] dark:text-slate-200 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users size={18} />
            </div>
            Find Doctors
          </button>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Total Visits
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112429] dark:text-white">
            {totalAppointments}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Upcoming
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112429] dark:text-white">
            {upcomingCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Pill size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Active Rx
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112429] dark:text-white">
            {activePrescriptions}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <FolderOpen size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Reports
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112429] dark:text-white">
            {Array.isArray(reports) ? reports.length : 0}
          </p>
        </div>
      </div>

      {/* ── Middle: Recent Appointments + Notifications ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#112429] dark:text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-400" />
              Recent Appointments
            </h3>
            <button
              onClick={() => navigate("/patient/appointments")}
              className="text-[#055153] dark:text-teal-400 text-xs font-bold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <Calendar size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No appointments yet</p>
              <p className="text-xs mt-1">
                Book your first appointment to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentAppointments.map((apt) => {
                const cfg = statusConfig[apt.status] || statusConfig.Pending;
                const StatusIcon = cfg.icon;
                let dateStr = "";
                try {
                  const d = new Date(apt.appointmentDate);
                  dateStr = `${format(d, "MMM d, yyyy")} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                } catch {
                  dateStr = "Date unavailable";
                }
                return (
                  <div
                    key={apt._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <StatusIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#112429] dark:text-white truncate">
                        {apt.doctorName || "Doctor"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {apt.recommendedSpecialty || "General"} • {dateStr}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#112429] dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-slate-400" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <Bell size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.slice(0, 5).map((notif, i) => (
                <div
                  key={notif._id || i}
                  className={`p-3 rounded-xl text-sm transition-colors ${
                    notif.read
                      ? "bg-transparent"
                      : "bg-teal-50/50 dark:bg-teal-500/5"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.read
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-teal-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#112429] dark:text-slate-200 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {notif.timestamp
                          ? format(new Date(notif.timestamp), "MMM d, h:mm a")
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Prescriptions + Medical Reports ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Prescriptions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#112429] dark:text-white flex items-center gap-2">
              <Pill size={18} className="text-slate-400" />
              Recent Prescriptions
            </h3>
            <button
              onClick={() => navigate("/patient/prescriptions")}
              className="text-[#055153] dark:text-teal-400 text-xs font-bold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {!Array.isArray(prescriptions) || prescriptions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <Pill size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No prescriptions</p>
              <p className="text-xs mt-1">
                Your prescriptions will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {prescriptions.slice(0, 4).map((rx) => (
                <div
                  key={rx._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rx.status === "Active"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Stethoscope size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#112429] dark:text-white truncate">
                      {rx.diagnosis || "Prescription"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {rx.doctorName || rx.issuedBy || "Doctor"} •{" "}
                      {rx.medicines?.length || 0} medicine
                      {(rx.medicines?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      rx.status === "Active"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {rx.status || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Reports */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#112429] dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-slate-400" />
              Medical Reports
            </h3>
            <button
              onClick={() => navigate("/patient/reports")}
              className="text-[#055153] dark:text-teal-400 text-xs font-bold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {!Array.isArray(reports) || reports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <FileText size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No reports uploaded</p>
              <p className="text-xs mt-1">
                Upload your medical reports for easy access
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reports.slice(0, 4).map((report) => (
                <div
                  key={report._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                    <FolderOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#112429] dark:text-white truncate">
                      {report.description || report.reportType || "Report"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {report.reportType || "Document"}
                      {report.doctorName ? ` • ${report.doctorName}` : ""}
                      {report.createdAt
                        ? ` • ${format(new Date(report.createdAt), "MMM d, yyyy")}`
                        : ""}
                    </p>
                  </div>
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#055153] dark:hover:text-teal-400 transition-colors flex-shrink-0"
                    >
                      <FileText size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
