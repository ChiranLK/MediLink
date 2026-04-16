import React, { useState, useEffect } from 'react';
import { Calendar, Briefcase, ClipboardList, Wallet, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDoctorContext } from '../../context/DoctorContext';
import customFetch from '../../utils/customFetch';
import StatCard from '../../components/DoctorDashboard/StatCard';
import ScheduleList from '../../components/DoctorDashboard/ScheduleList';
import ActivityFeed from '../../components/DoctorDashboard/ActivityFeed';
import QuickShortcuts from '../../components/DoctorDashboard/QuickShortcuts';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { doctorId, profileError } = useDoctorContext();
  const doctorName = user?.name || user?.fullName || 'Doctor';

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: '—',
    todayCount: '—',
    remaining: '—',
    pending: '—',
    earnings: '—',
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!doctorId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [allRes, pendRes, payRes] = await Promise.allSettled([
          customFetch.get(`/api/doctors/${doctorId}/appointments?limit=500`),
          customFetch.get(`/api/doctors/${doctorId}/appointments?status=Pending&limit=1`),
          customFetch.get(`/api/payment/doctor/summary?doctorId=${encodeURIComponent(doctorId)}`),
        ]);

        // All appointments
        const apps = allRes.status === 'fulfilled' ? (allRes.value.data?.data || []) : [];
        const total = allRes.status === 'fulfilled' ? (allRes.value.data?.total ?? apps.length) : 0;
        const pendingTotal = pendRes.status === 'fulfilled' ? (pendRes.value.data?.total ?? 0) : 0;

        // Today's appointments
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const todayApps = apps.filter((a) => {
          try {
            return isWithinInterval(new Date(a.appointmentDate), { start: todayStart, end: todayEnd });
          } catch (err) { return false; }
        });

        const activeToday = todayApps.filter((a) => ['Pending', 'Confirmed'].includes(a.status));
        const remaining = activeToday.filter(
          (a) => new Date(a.appointmentDate) > new Date() && a.status !== 'Completed'
        ).length;

        // Monthly earnings
        const monthlyTotal =
          payRes.status === 'fulfilled'
            ? payRes.value.data?.data?.monthlyTotal ?? 0
            : 0;

        setStats({
          totalAppointments: String(total),
          todayCount: String(activeToday.length),
          remaining: `${remaining} remaining`,
          pending: String(pendingTotal),
          earnings: monthlyTotal.toLocaleString(),
        });

        setTodayAppointments(todayApps);

        // Recent activity from all appointments (last 5)
        const sorted = [...apps].sort((a, b) => new Date(b.createdAt || b.appointmentDate) - new Date(a.createdAt || a.appointmentDate));
        setRecentActivity(sorted.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [doctorId]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="w-full h-full p-4 md:p-8 flex lg:flex-row flex-col gap-8 bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-[#112429] dark:text-white tracking-tight font-manrope leading-tight mb-2 transition-colors">
              {greeting},{' '}
              <span className="text-[#055153] dark:text-teal-400">Dr. {doctorName}</span>
            </h1>
            <p className="text-[#475569] dark:text-slate-400 font-medium font-inter text-[14px] md:text-[15px] transition-colors">
              Here is what is happening with your practice today.
            </p>
            {profileError && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{profileError}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Appointments"
            value={loading ? '…' : stats.totalAppointments}
            badgeColor="green"
            icon={Calendar}
          />
          <StatCard
            title="Today's Consultations"
            value={loading ? '…' : stats.todayCount}
            badgeText={loading ? '' : stats.remaining}
            badgeColor="blue"
            icon={Briefcase}
          />
          <StatCard
            title="Pending Requests"
            value={loading ? '…' : stats.pending}
            badgeText={Number(stats.pending) > 0 ? 'New' : ''}
            badgeColor="red"
            icon={ClipboardList}
          />
          <StatCard
            title="Monthly Earnings"
            value={loading ? '…' : stats.earnings}
            icon={Wallet}
            isHighlighted={true}
          />
        </div>

        <div className="mt-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <ScheduleList appointments={todayAppointments} loading={loading} />
        </div>
      </div>

      <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col gap-6">
        <ActivityFeed activities={recentActivity} loading={loading} />
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <QuickShortcuts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
