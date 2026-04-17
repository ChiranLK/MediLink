import React, { useEffect, useState } from "react";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import customFetch from "../../utils/customFetch";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
      {value}
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
  </div>
);

const AdminPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data: res } = await customFetch.get(
        "/api/payments/admin/overview",
      );
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch payment overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Issue a refund for this payment?")) return;
    setRefundLoading(paymentId);
    try {
      await customFetch.post(`/api/payments/${paymentId}/refund`);
      fetchOverview();
    } catch (err) {
      alert("Refund failed: " + (err.response?.data?.message || err.message));
    } finally {
      setRefundLoading(null);
    }
  };

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

  const stats = [
    {
      icon: CreditCard,
      label: "Total Payments",
      value: data?.totalPayments ?? 0,
      color: "bg-[#055153]",
    },
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: `Rs. ${Number(data?.totalRevenue || 0).toLocaleString()}`,
      color: "bg-emerald-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: data?.completedPayments ?? 0,
      color: "bg-blue-600",
    },
    {
      icon: AlertTriangle,
      label: "Pending",
      value: data?.pendingPayments ?? 0,
      color: "bg-amber-600",
    },
    {
      icon: RefreshCw,
      label: "Refunded",
      value: data?.refundedPayments ?? 0,
      color: "bg-red-500",
    },
  ];

  const statusBadge = (status) => {
    const styles = {
      completed:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      refunded: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      failed:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles[status] || styles.failed}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
          Payment Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Financial transactions and revenue
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Recent Payments Table */}
      {data?.recentPayments?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-[#112429] dark:text-slate-100 font-manrope">
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-bold">ID</th>
                  <th className="px-6 py-3 font-bold">Patient</th>
                  <th className="px-6 py-3 font-bold">Doctor</th>
                  <th className="px-6 py-3 font-bold">Amount</th>
                  <th className="px-6 py-3 font-bold">Type</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                  <th className="px-6 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentPayments.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {p._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {p.metadata?.patientName || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {p.metadata?.doctorName || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-[#112429] dark:text-slate-200">
                      Rs. {Number(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {p.paymentType || "—"}
                    </td>
                    <td className="px-6 py-3">{statusBadge(p.status)}</td>
                    <td className="px-6 py-3 text-xs text-slate-400 dark:text-slate-500">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {p.status === "completed" && (
                        <button
                          onClick={() => handleRefund(p._id)}
                          disabled={refundLoading === p._id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold transition-colors disabled:opacity-50"
                        >
                          {refundLoading === p._id ? (
                            <Loader2
                              size={12}
                              className="animate-spin inline"
                            />
                          ) : (
                            "Refund"
                          )}
                        </button>
                      )}
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

export default AdminPayments;
