import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Video,
  PlusCircle,
  Calendar,
  FileText,
  Upload,
  Download,
  Activity,
  Heart,
  Moon,
  Users,
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

  useEffect(() => {
    const loadNextAppointment = async () => {
      try {
        const { data } = await customFetch.get(
          "/api/appointment/my-appointments",
        );
        const apts = data.appointments || data.data || data || [];

        // Find the next upcoming confirmed appointment
        const confirmed = apts
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
            // No session yet — doctor hasn't started it
            setConsultationStatus("none");
          }
        }
      } catch (err) {
        // Appointment service unavailable — graceful degradation
      }
    };
    loadNextAppointment();
  }, []);

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
      // Frontend should open meetingLink in browser for video call
      window.open(meetingLink, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Video call is not ready yet. Please wait for the doctor.");
    } finally {
      setIsJoining(false);
    }
  };

  // helpers
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      label: "STEP COUNT",
      value: "8,432",
      sub: "/ 10k",
      icon: Activity,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "HEART RATE",
      value: "72",
      sub: "bpm",
      icon: Heart,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: "SLEEP QUALITY",
      value: "7h 45m",
      sub: "Good",
      icon: Moon,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
  ];

  const recentDocs = [
    {
      title: "Blood Test Results",
      date: "May 15, 2024 • LabCorp",
      icon: FileText,
    },
    {
      title: "Prescription Renewal - Lisinopril",
      date: "May 10, 2024 • Dr. Aris Thorne",
      icon: FileText,
    },
    {
      title: "Annual Physical Summary",
      date: "April 22, 2024 • Aura Wellness",
      icon: FileText,
    },
  ];

  const medicalTeam = [
    {
      name: "Dr. A. Thorne",
      role: "PRIMARY CARE",
      img: "https://i.pravatar.cc/150?img=11",
      status: "online",
    },
    {
      name: "Dr. L. Chen",
      role: "NEUROLOGY",
      img: "https://i.pravatar.cc/150?img=5",
      status: "offline",
    },
    {
      name: "Dr. K. Miller",
      role: "ORTHOPEDICS",
      img: "https://i.pravatar.cc/150?img=8",
      status: "online",
    },
  ];

  const firstName =
    user?.name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Patient";

  return (
    <div className="w-full p-4 md:p-8 bg-[#F8FAFB] dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* Header Greeting */}
      <div className="mb-8">
        <h1 className="text-[28px] md:text-[32px] font-black text-[#112429] dark:text-white tracking-tight font-manrope leading-tight mb-2">
          {getGreeting()},{" "}
          <span className="text-[#055153] dark:text-teal-400">{firstName}</span>
        </h1>
        <p className="text-[#475569] dark:text-slate-400 font-medium font-inter text-[14px] md:text-[15px]">
          {format(today, "EEEE, MMMM do, yyyy")} — Here is what is happening
          with your health today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Next Appointment Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#055153] to-[#0D877B] rounded-2xl p-8 text-white shadow-lg shadow-[#055153]/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="z-10 w-full md:w-auto">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase mb-4">
              Next Appointment
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold leading-tight mb-2">
              {nextAppointment
                ? nextAppointment.specialization ||
                  nextAppointment.recommendedSpecialty ||
                  "Consultation"
                : "No Upcoming Appointments"}
            </h2>
            <p className="text-white/80 text-[15px] mb-8">
              {nextAppointment
                ? (() => {
                    try {
                      const d = new Date(nextAppointment.appointmentDate);
                      return `${nextAppointment.recommendedSpecialty || "General"} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${d.toDateString()}`;
                    } catch {
                      return "Date TBD";
                    }
                  })()
                : "Book an appointment to get started"}
            </p>
            <button
              onClick={handleJoinVideoCall}
              disabled={
                isJoining ||
                consultationStatus === "completed" ||
                !nextAppointment
              }
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-sm disabled:opacity-50 ${
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

          <div className="relative z-10 w-full md:w-auto flex justify-end">
            <div className="w-44 h-44 md:w-[200px] md:h-[200px] rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop"
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            Quick Actions
          </h3>

          {/* Book Appointment — Primary CTA */}
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center justify-center gap-3 w-full bg-[#055153] hover:bg-[#033A3C] dark:bg-teal-600 dark:hover:bg-teal-500 text-white p-4 rounded-2xl shadow-md shadow-[#055153]/25 dark:shadow-teal-900/40 transition-all font-bold text-[15px] group"
          >
            <div className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
              <PlusCircle size={20} className="text-white" />
            </div>
            Book Appointment
          </button>

          <button
            onClick={() => navigate("/patient/appointments")}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold text-[#112429] dark:text-slate-200 text-[15px]"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-[#055153] dark:text-emerald-400">
              <Calendar size={20} />
            </div>
            View my Appointments
          </button>

          <button
            onClick={() => navigate("/patient/prescriptions")}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold text-[#112429] dark:text-slate-200 text-[15px]"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            My Prescriptions
          </button>

          <button
            onClick={() => navigate("/patient/reports")}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold text-[#112429] dark:text-slate-200 text-[15px]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Upload size={20} />
            </div>
            Upload Medical Report
          </button>

          <button
            onClick={() => navigate("/patient/doctors")}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold text-[#112429] dark:text-slate-200 text-[15px]"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users size={20} />
            </div>
            Find Doctors
          </button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-[#112429] dark:text-white leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[13px] font-medium text-slate-400 dark:text-slate-500">
                    {stat.sub}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-[#112429] dark:text-white">
              Recent Documents
            </h3>
            <button
              onClick={() => navigate("/patient/reports")}
              className="text-[#055153] dark:text-teal-400 text-[14px] font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {recentDocs.map((doc, i) => {
              const Icon = doc.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#112429] dark:text-white text-[15px]">
                        {doc.title}
                      </h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {doc.date}
                      </p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-[#055153] dark:group-hover:text-teal-400 group-hover:border-[#055153] dark:group-hover:border-teal-400 transition-colors shadow-sm">
                    <Download size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Medical Team */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <h3 className="text-[18px] font-bold text-[#112429] dark:text-white mb-8">
            My Medical Team
          </h3>
          <div className="flex justify-around items-end mb-10 flex-1">
            {medicalTeam.map((dr, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[88px] h-[88px] rounded-full p-1 border-2 border-slate-100 dark:border-slate-700 mb-3 relative">
                  <img
                    src={dr.img}
                    alt={dr.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${dr.status === "online" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  ></div>
                </div>
                <h4 className="font-bold text-[#112429] dark:text-white text-[14px] text-center">
                  {dr.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-1 text-center">
                  {dr.role}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="w-full py-3.5 border-2 border-slate-100 dark:border-slate-700 hover:border-[#055153] dark:hover:border-teal-400 text-[#112429] dark:text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
          >
            <Users size={18} className="opacity-70" />
            Find Doctors
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
