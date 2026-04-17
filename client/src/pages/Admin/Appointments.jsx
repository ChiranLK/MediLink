import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import customFetch from "../../utils/customFetch";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await customFetch.get("/api/appointments");
      let list = data.data || data.appointments || data || [];
      if (!Array.isArray(list)) list = [];
      setAppointments(list);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Client-side filter
  let filtered = appointments;
  if (statusFilter)
    filtered = filtered.filter(
      (a) => (a.status || "").toLowerCase() === statusFilter,
    );
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        (a.patientName || "").toLowerCase().includes(q) ||
        (a.doctorName || "").toLowerCase().includes(q) ||
        (a.symptoms || a.reason || "").toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const pages = Math.ceil(total / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusBadge = (status) => {
    const styles = {
      confirmed:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      completed:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      scheduled:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    };
    const key = (status || "").toLowerCase();
    return (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles[key] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
      >
        {status || "unknown"}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
            Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total} appointments found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20 w-52"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="animate-spin text-[#055153] dark:text-teal-400"
              size={30}
            />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-bold">Patient</th>
                  <th className="px-6 py-3 font-bold">Doctor</th>
                  <th className="px-6 py-3 font-bold">Date</th>
                  <th className="px-6 py-3 font-bold">Time</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((a) => (
                  <tr
                    key={a._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#112429] dark:text-slate-200">
                        {a.patientName || a.patientId || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {a.doctorName || a.doctorId || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {a.date
                        ? new Date(a.date).toLocaleDateString()
                        : a.appointmentDate
                          ? new Date(a.appointmentDate).toLocaleDateString()
                          : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {a.time ||
                        a.timeSlot ||
                        (a.appointmentDate
                          ? new Date(a.appointmentDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—")}
                    </td>
                    <td className="px-6 py-4">{statusBadge(a.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {a.symptoms || a.reason || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Page {page} of {pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
