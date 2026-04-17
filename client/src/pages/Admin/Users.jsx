import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import customFetch from "../../utils/customFetch";
import { useAuth } from "../../context/AuthContext";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 20);
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const { data } = await customFetch.get(`/api/auth/admin/users?${params}`);
      setUsers(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
    setActionLoading(userId);
    try {
      await customFetch.put(`/api/auth/admin/users/${userId}/role`, {
        role: newRole,
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`))
      return;
    setActionLoading(userId);
    try {
      await customFetch.delete(`/api/auth/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const roleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      doctor:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      patient:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles[role] || styles.patient}`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total} total users
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20"
            >
              <option value="">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#055153]/20 w-52"
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="animate-spin text-[#055153] dark:text-teal-400"
              size={30}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Email</th>
                  <th className="px-6 py-3 font-bold">Phone</th>
                  <th className="px-6 py-3 font-bold">Role</th>
                  <th className="px-6 py-3 font-bold">Joined</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#055153] dark:text-teal-400">
                            {(u.fullName || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[#112429] dark:text-slate-200">
                          {u.fullName || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {u.phoneNumber || "—"}
                    </td>
                    <td className="px-6 py-4">{roleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === u._id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-slate-400"
                          />
                        ) : (
                          <>
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u._id, e.target.value)
                              }
                              className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                              <option value="admin">Admin</option>
                            </select>
                            {(currentUser?.userId || currentUser?.id) !==
                              u._id && (
                              <button
                                onClick={() => handleDelete(u._id, u.fullName)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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

        {/* Pagination */}
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

export default AdminUsers;
