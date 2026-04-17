import React, { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  TrendingUp,
  UserPlus,
  Loader2,
} from "lucide-react";
import customFetch from "../../utils/customFetch";

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <TrendingUp size={16} className="text-emerald-500" />
    </div>
    <p className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
      {value}
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    {sub && (
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, payRes, apptRes] = await Promise.all([
          customFetch.get("/api/auth/admin/stats").catch(() => null),
          customFetch.get("/api/payment/admin/overview").catch(() => null),
          customFetch.get("/api/appointments").catch(() => null),
        ]);
        if (userRes?.data?.data) setStats(userRes.data.data);
        if (payRes?.data?.data) setPaymentStats(payRes.data.data);
        if (apptRes?.data) {
          const appts =
            apptRes.data.data || apptRes.data.appointments || apptRes.data;
          if (Array.isArray(appts)) setAppointmentCount(appts.length);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2
          className="animate-spin text-[#055153] dark:text-teal-400"
          size={36}
        />
      </div>
    );
  }

  const cards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalUsers ?? "—",
      color: "bg-[#055153]",
      sub: `${stats?.patients ?? 0} patients, ${stats?.doctors ?? 0} doctors`,
    },
    {
      icon: Stethoscope,
      label: "Doctors",
      value: stats?.doctors ?? "—",
      color: "bg-blue-600",
    },
    {
      icon: UserPlus,
      label: "Patients",
      value: stats?.patients ?? "—",
      color: "bg-violet-600",
    },
    {
      icon: Calendar,
      label: "Appointments",
      value: appointmentCount,
      color: "bg-amber-600",
    },
    {
      icon: CreditCard,
      label: "Total Revenue",
      value: paymentStats
        ? `Rs. ${Number(paymentStats.totalRevenue || 0).toLocaleString()}`
        : "—",
      color: "bg-emerald-600",
      sub: `${paymentStats?.completedPayments ?? 0} completed payments`,
    },
    {
      icon: CreditCard,
      label: "Refunded",
      value: paymentStats?.refundedPayments ?? "—",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your platform at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-[#112429] dark:text-slate-100 font-manrope">
              Recent Registrations
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#055153] dark:text-teal-400">
                      {(u.fullName || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#112429] dark:text-slate-200">
                      {u.fullName}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {u.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    u.role === "admin"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : u.role === "doctor"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {paymentStats?.recentPayments?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-[#112429] dark:text-slate-100 font-manrope">
              Recent Payments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-bold">ID</th>
                  <th className="px-6 py-3 font-bold">Amount</th>
                  <th className="px-6 py-3 font-bold">Type</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentStats.recentPayments.slice(0, 10).map((p) => (
                  <tr key={p._id} className="text-sm">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {p._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-3 font-semibold text-[#112429] dark:text-slate-200">
                      Rs. {Number(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                      {p.paymentType || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : p.status === "refunded"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : p.status === "pending"
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400 dark:text-slate-500">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
