import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Stethoscope,
  ChevronLeft,
  X,
  Edit,
  Save,
  AlertCircle,
} from "lucide-react";
import customFetch from "@/utils/customFetch";
import toast from "react-hot-toast";

const ViewAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  // Edit modal state
  const [editModal, setEditModal] = useState(null); // null or appointment object
  const [editForm, setEditForm] = useState({
    patientName: "",
    contactPhone: "",
    symptoms: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null); // appointmentId to confirm cancel

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await customFetch.get(
          "/api/appointments/my-appointments",
        );
        const apts = data.appointments || [];
        setAppointments(apts);
      } catch (err) {
        const errorMsg =
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Failed to load appointments";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Filter appointments by status
  const filteredAppointments =
    filterStatus === "All"
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-amber-100 text-amber-800 border border-amber-300",
      Confirmed: "bg-green-100 text-green-800 border border-green-300",
      Completed: "bg-blue-100 text-blue-800 border border-blue-300",
      Cancelled: "bg-red-100 text-red-800 border border-red-300",
    };
    return (
      statusStyles[status] ||
      "bg-gray-100 text-[#1e293b] border border-gray-300"
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await customFetch.delete(`/api/appointments/${appointmentId}`);
      setAppointments(appointments.filter((a) => a._id !== appointmentId));
      setCancelConfirm(null);
      toast.success("Appointment cancelled successfully");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg || "Failed to cancel appointment";
      toast.error(errorMsg);
    }
  };

  const openEdit = (apt) => {
    setEditForm({
      patientName: apt.patientName || "",
      contactPhone: apt.contactPhone || "",
      symptoms: apt.symptoms || "",
    });
    setEditModal(apt);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    if (!editForm.patientName.trim())
      return toast.error("Patient name is required");
    if (!/^[0-9]{10}$/.test(editForm.contactPhone))
      return toast.error("Enter a valid 10-digit phone number");
    if (!editForm.symptoms.trim())
      return toast.error("Please describe your symptoms");

    setIsSaving(true);
    try {
      const { data } = await customFetch.patch(
        `/api/appointments/${editModal._id}/my`,
        editForm,
      );
      setAppointments(
        appointments.map((a) =>
          a._id === editModal._id ? { ...a, ...data.appointment } : a,
        ),
      );
      setEditModal(null);
      toast.success("Appointment details updated successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Failed to update appointment";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-slate-900 pb-20">
      {/* ── Cancel Confirmation Modal ── */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-extrabold text-[#112429] dark:text-white">
                Cancel Appointment
              </h3>
            </div>
            <p className="text-[#4B5A69] dark:text-slate-400 mb-6">
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 font-bold text-[#4B5A69] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Appointment Modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF5F9] dark:bg-teal-900/30 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-[#055153] dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#112429] dark:text-white">
                    Edit Appointment
                  </h3>
                  <p className="text-xs text-[#4B5A69] dark:text-slate-400">
                    ID: {editModal._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#4B5A69] dark:text-slate-400 uppercase tracking-wider mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={editForm.patientName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, patientName: e.target.value }))
                  }
                  placeholder="Enter patient name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-[#FAFAFB] dark:bg-slate-700 text-[#112429] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#055153]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5A69] dark:text-slate-400 uppercase tracking-wider mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      contactPhone: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-[#FAFAFB] dark:bg-slate-700 text-[#112429] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#055153]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5A69] dark:text-slate-400 uppercase tracking-wider mb-2">
                  Symptoms / Reason for Visit *
                </label>
                <textarea
                  rows={4}
                  value={editForm.symptoms}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, symptoms: e.target.value }))
                  }
                  placeholder="Describe your symptoms..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-[#FAFAFB] dark:bg-slate-700 text-[#112429] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#055153] resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  ⚠️ Only pending appointments can be edited. Date, doctor, and
                  time cannot be changed here.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 font-bold text-[#4B5A69] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-[#055153] hover:bg-[#044143] text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#055153] dark:text-teal-400" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-[#112429] dark:text-white">
              My Appointments
            </h1>
            <p className="text-[#4B5A69] dark:text-slate-400 text-sm mt-1">
              View and manage your booked appointments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  filterStatus === status
                    ? "bg-[#055153] text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-[#4B5A69] dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#055153]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="text-sm text-[#4B5A69] dark:text-slate-400 mt-3">
            Showing {filteredAppointments.length}{" "}
            {filterStatus !== "All" ? filterStatus.toLowerCase() : ""}{" "}
            appointment{filteredAppointments.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#055153] mb-4"></div>
            <p className="text-[#4B5A69] dark:text-slate-400 font-medium">
              Loading your appointments...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-700 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-700">
            <Stethoscope className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#112429] dark:text-white mb-2">
              {filterStatus === "All"
                ? "No Appointments Yet"
                : `No ${filterStatus} Appointments`}
            </h3>
            <p className="text-[#4B5A69] dark:text-slate-400 mb-6">
              {filterStatus === "All"
                ? "You haven't booked any appointments yet. Start by booking your first appointment with one of our doctors."
                : `You don't have any ${filterStatus.toLowerCase()} appointments.`}
            </p>
            <button
              onClick={() => navigate("/appointments")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#055153] hover:bg-[#033A3C] text-white font-bold rounded-xl transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-7 h-7 text-[#055153] dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#112429] dark:text-white">
                          {appointment.specialization || "General Consultation"}
                        </h3>
                        <p className="text-sm text-[#4B5A69] dark:text-slate-400 mt-1">
                          Appointment ID:{" "}
                          {appointment._id?.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${getStatusBadge(appointment.status)}`}
                    >
                      {appointment.status || "Pending"}
                    </span>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Date & Time */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Date & Time
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <p className="text-sm text-[#4B5A69] dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    {/* Location/Type */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Consultation Type
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white">
                          {appointment.consultationType || "In-Person"}
                        </p>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Patient Name
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white">
                          {appointment.patientName || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Contact Phone
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white">
                          {appointment.contactPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appointment.symptoms && (
                    <div className="mb-6 p-4 bg-[#F8FAFC] dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-[#055153] dark:text-teal-400 uppercase tracking-wider mb-2">
                        Symptoms/Reason for Visit
                      </p>
                      <p className="text-sm text-[#4B5A69] dark:text-slate-300">
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}

                  {/* Urgency Level */}
                  {appointment.urgencyLevel && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                        🚨 Urgency Level
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold capitalize">
                        {appointment.urgencyLevel}
                      </p>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {appointment.aiSuggestions && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        AI Suggestions
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {appointment.aiSuggestions}
                      </p>
                    </div>
                  )}

                  {/* Pre-medication Steps */}
                  {appointment.preMedicationSteps &&
                    appointment.preMedicationSteps.length > 0 && (
                      <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Pre-Medication Steps
                        </p>
                        <ul className="space-y-2">
                          {appointment.preMedicationSteps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-300"
                            >
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Recommended Specialty */}
                  {appointment.recommendedSpecialty && (
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
                        💊 Recommended Specialty
                      </p>
                      <p className="text-sm text-purple-800 dark:text-purple-300 font-semibold">
                        {appointment.recommendedSpecialty}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {appointment.status === "Pending" && (
                      <button
                        onClick={() => openEdit(appointment)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#055153] hover:bg-[#033A3C] text-white font-bold rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </button>
                    )}
                    {appointment.status !== "Completed" &&
                      appointment.status !== "Cancelled" && (
                        <button
                          onClick={() => setCancelConfirm(appointment._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-lg transition-colors border border-red-200 dark:border-red-800"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;
