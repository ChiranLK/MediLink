import React, { useEffect, useState } from "react";
import {
  Calendar,
  Briefcase,
  ClipboardList,
  Wallet,
  Download,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDoctorContext } from "../../context/DoctorContext";
import customFetch from "../../utils/customFetch";
import StatCard from "../../components/DoctorDashboard/StatCard";
import ScheduleList from "../../components/DoctorDashboard/ScheduleList";
import ActivityFeed from "../../components/DoctorDashboard/ActivityFeed";
import QuickShortcuts from "../../components/DoctorDashboard/QuickShortcuts";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { doctorId, profileError } = useDoctorContext();
  const doctorName = user?.name || user?.fullName || "Doctor";

  const [stats, setStats] = useState({
    total: 0,
    todayCount: 0,
    remainingToday: 0,
    pendingCount: 0,
    monthlyEarnings: "0",
  });
  const [appointments, setAppointments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const [apptRes, paymentRes] = await Promise.allSettled([
          customFetch.get(`/api/doctors/${doctorId}/appointments?limit=500`),
          customFetch.get(`/api/payment/doctor/summary?doctorId=${doctorId}`),
        ]);

        const allAppointments =
          apptRes.status === "fulfilled" ? apptRes.value.data?.data || [] : [];

        const today = new Date().toISOString().slice(0, 10);
        const todaysAppts = allAppointments.filter(
          (a) => a.appointmentDate && a.appointmentDate.slice(0, 10) === today,
        );
        const pendingAppts = allAppointments.filter(
          (a) => a.status === "Pending",
        );
        const remainingToday = todaysAppts.filter(
          (a) => a.status === "Confirmed" || a.status === "Pending",
        );

        const monthlyTotal =
          paymentRes.status === "fulfilled"
            ? paymentRes.value.data?.data?.monthlyTotal || 0
            : 0;

        setStats({
          total: allAppointments.length,
          todayCount: todaysAppts.length,
          remainingToday: remainingToday.length,
          pendingCount: pendingAppts.length,
          monthlyEarnings: monthlyTotal.toLocaleString(),
        });

        setAppointments(allAppointments);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [doctorId]);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="w-full h-full p-4 md:p-8 flex lg:flex-row flex-col gap-8 bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-[#112429] dark:text-white tracking-tight font-manrope leading-tight mb-2 transition-colors">
              {getGreeting()},{" "}
              <span className="text-[#055153] dark:text-teal-400">
                Dr. {doctorName}
              </span>
            </h1>
            <p className="text-[#475569] dark:text-slate-400 font-medium font-inter text-[14px] md:text-[15px] transition-colors">
              {todayStr} — Here is what is happening with your practice today.
            </p>
            {profileError && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                {profileError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-bold text-[#055153] dark:text-teal-400 text-[13px] font-inter">
              <Download size={16} strokeWidth={2.5} />
              Daily Summary (PDF)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Appointments"
            value={loadingStats ? "…" : String(stats.total)}
            badgeText={
              stats.todayCount > 0 ? `${stats.todayCount} today` : undefined
            }
            badgeColor="green"
            icon={Calendar}
          />
          <StatCard
            title="Today's Consultations"
            value={loadingStats ? "…" : String(stats.todayCount)}
            badgeText={
              stats.remainingToday > 0
                ? `${stats.remainingToday} remaining`
                : undefined
            }
            badgeColor="blue"
            icon={Briefcase}
          />
          <StatCard
            title="Pending Requests"
            value={loadingStats ? "…" : String(stats.pendingCount)}
            badgeText={stats.pendingCount > 0 ? "Needs Review" : undefined}
            badgeColor="red"
            icon={ClipboardList}
          />
          <StatCard
            title="Monthly Earnings (LKR)"
            value={loadingStats ? "…" : stats.monthlyEarnings}
            icon={Wallet}
            isHighlighted={true}
          />
        </div>

        {/* Today's Schedule */}
        <div className="mt-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <ScheduleList appointments={appointments} doctorId={doctorId} />
        </div>
      </div>

      <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col gap-6">
        <ActivityFeed appointments={appointments} />
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <QuickShortcuts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
