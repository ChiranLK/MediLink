import React, { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
} from "lucide-react";
import customFetch from "../../utils/customFetch";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await customFetch.get(`/api/doctors?${params}`);
      let list = data.data || data.doctors || [];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (d) =>
            (d.name || "").toLowerCase().includes(q) ||
            (d.email || "").toLowerCase().includes(q) ||
            (d.specialization || "").toLowerCase().includes(q),
        );
      }
      setDoctors(list);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(`Permanently delete Dr. ${name}? This cannot be undone.`)
    )
      return;
    setActionLoading(id);
    try {
      await customFetch.delete(`/api/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert("Failed to delete doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDeletion = async (id) => {
    setActionLoading(id);
    try {
      await customFetch.patch(`/api/doctors/${id}/reject-deletion`);
      fetchDoctors();
    } catch (err) {
      alert("Failed to restore doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      active:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      inactive:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      pending_deletion:
        "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles[status] || styles.active}`}
      >
        {(status || "active").replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
            Doctor Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {doctors.length} doctors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          <form onSubmit={handleSearch} className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20 w-52"
            />
          </form>
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full mx-4 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {selectedDoctor.profileImage &&
                selectedDoctor.profileImage.startsWith("http") ? (
                  <img
                    src={selectedDoctor.profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#055153] dark:text-teal-400">
                    {(selectedDoctor.name || "D").charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#112429] dark:text-slate-100 font-manrope">
                  Dr. {selectedDoctor.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedDoctor.specialization || "General Practice"}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.email || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.phone || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                {statusBadge(selectedDoctor.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.experience != null
                    ? `${selectedDoctor.experience} years`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.consultationFee
                    ? `Rs. ${selectedDoctor.consultationFee.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.hospital || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Qualifications</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium text-right max-w-[60%]">
                  {selectedDoctor.qualifications || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.location || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Languages</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.languages?.length
                    ? selectedDoctor.languages.join(", ")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.isVerified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sessions</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.sessionCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rating</span>
                <span className="text-[#112429] dark:text-slate-200 font-medium">
                  {selectedDoctor.rating?.average > 0
                    ? `${selectedDoctor.rating.average} ★ (${selectedDoctor.rating.count} reviews)`
                    : "No ratings yet"}
                </span>
              </div>
              {selectedDoctor.bio && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 text-xs uppercase tracking-wider">
                    Bio
                  </span>
                  <p className="text-[#112429] dark:text-slate-200 text-sm mt-1">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#055153] text-white font-semibold text-sm hover:bg-[#055153]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="animate-spin text-[#055153] dark:text-teal-400"
              size={30}
            />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No doctors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-bold">Doctor</th>
                  <th className="px-6 py-3 font-bold">Specialization</th>
                  <th className="px-6 py-3 font-bold">Email</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold">Rating</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctors.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {d.profileImage &&
                          d.profileImage.startsWith("http") ? (
                            <img
                              src={d.profileImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#055153] dark:text-teal-400">
                              {(d.name || "D").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-[#112429] dark:text-slate-200">
                          Dr. {d.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {d.specialization || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {d.email || "—"}
                    </td>
                    <td className="px-6 py-4">{statusBadge(d.status)}</td>
                    <td className="px-6 py-4 text-sm">
                      {d.rating?.average > 0 ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {d.rating.average} ★
                          <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                            ({d.rating.count})
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === d._id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-slate-400"
                          />
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedDoctor(d)}
                              className="p-1.5 text-slate-400 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            {d.status === "pending_deletion" && (
                              <button
                                onClick={() => handleRejectDeletion(d._id)}
                                className="p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Restore doctor"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(d._id, d.name)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete doctor"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;
