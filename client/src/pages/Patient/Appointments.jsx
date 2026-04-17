import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../patient/services/patientApi";
import toast from "react-hot-toast";
import {
  Calendar,
  Search,
  MapPin,
  Users,
  Clock,
  Stethoscope,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const PatientAppointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getMyAppointments();
      setAppointments(response.appointments || response.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await patientApi.getDoctors();
      setDoctors(response.doctors || response.data || []);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (
        !bookingForm.doctorId ||
        !bookingForm.appointmentDate ||
        !bookingForm.appointmentTime ||
        !bookingForm.symptoms
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const appointmentDateTime = new Date(
        `${bookingForm.appointmentDate}T${bookingForm.appointmentTime}`,
      );

      const response = await patientApi.bookAppointment({
        doctorId: bookingForm.doctorId,
        appointmentDate: appointmentDateTime,
        symptoms: bookingForm.symptoms,
        patientId: user.id,
        patientEmail: user.email || "",
      });

      if (response.success || response.appointment) {
        toast.success("Appointment booked successfully!");
        setShowBookingModal(false);
        setBookingForm({
          doctorId: "",
          appointmentDate: "",
          appointmentTime: "",
          symptoms: "",
        });
        await loadAppointments();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await patientApi.cancelAppointment(appointmentId);
      toast.success("Appointment cancelled");
      await loadAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    let filtered = appointments;

    if (activeTab === "upcoming") {
      filtered = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate > now && apt.status !== "Cancelled";
      });
    } else if (activeTab === "past") {
      filtered = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return (
          (aptDate <= now || apt.status === "Completed") &&
          apt.status !== "Cancelled"
        );
      });
    } else if (activeTab === "cancelled") {
      filtered = appointments.filter((apt) => apt.status === "Cancelled");
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055153]"></div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-1">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "past", label: "Past" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#055153] text-white shadow-lg shadow-teal-900/10"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#055153] focus:border-transparent outline-none w-full sm:w-72 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">
            No appointments
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {activeTab === "upcoming"
              ? "Book your first appointment to get started."
              : `No ${activeTab} appointments.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 hover:border-[#055153]/20 dark:hover:border-teal-400/20 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#112429] dark:text-white">
                    {appointment.doctorName || "Dr. Unknown"}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="text-[#055153]" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {appointment.specialization ||
                          appointment.recommendedSpecialty ||
                          "General"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#0E8A7F]" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMM dd, yyyy",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(appointment.appointmentDate),
                          "hh:mm a",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(appointment.status)}`}
                >
                  {appointment.status}
                </span>
              </div>

              {appointment.symptoms && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">
                      Symptoms/Reason:
                    </strong>{" "}
                    {appointment.symptoms}
                  </p>
                </div>
              )}

              {activeTab === "upcoming" &&
                appointment.status !== "Cancelled" && (
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs transition mt-1"
                  >
                    Cancel Appointment
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-transparent dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-extrabold mb-6 text-[#112429] dark:text-white">
              Book Appointment
            </h2>

            <form onSubmit={handleBookAppointment} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase mb-2 text-slate-500 dark:text-slate-400">
                  Select Doctor *
                </label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, doctorId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#055153] outline-none font-medium text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase mb-2 text-slate-500 dark:text-slate-400">
                  Date *
                </label>
                <input
                  type="date"
                  value={bookingForm.appointmentDate}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      appointmentDate: e.target.value,
                    })
                  }
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#055153] outline-none font-medium text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase mb-2 text-slate-500 dark:text-slate-400">
                  Time *
                </label>
                <input
                  type="time"
                  value={bookingForm.appointmentTime}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      appointmentTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#055153] outline-none font-medium text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase mb-2 text-slate-500 dark:text-slate-400">
                  Symptoms / Reason *
                </label>
                <textarea
                  value={bookingForm.symptoms}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, symptoms: e.target.value })
                  }
                  placeholder="Describe your symptoms or reason for the appointment..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#055153] outline-none font-medium resize-none placeholder:text-gray-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-5 py-2.5 border-2 border-gray-200 dark:border-slate-700 rounded-xl font-semibold text-sm text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#055153] hover:bg-[#044143] text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-all shadow-lg shadow-teal-900/10"
                >
                  {isSubmitting ? "Booking..." : "Book Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
