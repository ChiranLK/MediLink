import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import { Calendar, Search, MapPin, Users, Clock, Stethoscope, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
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
      console.error('Failed to load appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await patientApi.getDoctors();
      setDoctors(response.doctors || response.data || []);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (!bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.appointmentTime || !bookingForm.symptoms) {
        toast.error('Please fill all required fields');
        return;
      }

      const appointmentDateTime = new Date(`${bookingForm.appointmentDate}T${bookingForm.appointmentTime}`);

      const response = await patientApi.bookAppointment({
        doctorId: bookingForm.doctorId,
        appointmentDate: appointmentDateTime,
        symptoms: bookingForm.symptoms,
        patientId: user.id,
      });

      if (response.success || response.appointment) {
        toast.success('Appointment booked successfully!');
        setShowBookingModal(false);
        setBookingForm({
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          symptoms: '',
        });
        await loadAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await patientApi.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled');
      await loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    let filtered = appointments;

    if (activeTab === 'upcoming') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate > now && apt.status !== 'Cancelled';
      });
    } else if (activeTab === 'past') {
      filtered = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate <= now || apt.status === 'Completed';
      });
    } else if (activeTab === 'cancelled') {
      filtered = appointments.filter(apt => apt.status === 'Cancelled');
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Completed':
        return 'bg-blue-100 text-blue-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Appointments</h1>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          <Calendar size={20} />
          Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'past', label: 'Past' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments</h3>
          <p className="text-gray-500">
            {activeTab === 'upcoming' ? 'Book your first appointment to get started.' : `No ${activeTab} appointments.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map(appointment => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {appointment.doctorName || 'Dr. Unknown'}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={18} className="text-blue-500" />
                      <span>{appointment.specialization || appointment.recommendedSpecialty || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-green-500" />
                      <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-orange-500" />
                      <span>{format(new Date(appointment.appointmentDate), 'hh:mm a')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {appointment.symptoms && (
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Symptoms/Reason:</strong> {appointment.symptoms}
                  </p>
                </div>
              )}

              {appointment.aiSuggestions && (
                <div className="bg-blue-50 p-4 rounded mb-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>AI Analysis:</strong> {appointment.aiSuggestions}
                  </p>
                </div>
              )}

              {activeTab === 'upcoming' && appointment.status !== 'Cancelled' && (
                <button
                  onClick={() => handleCancelAppointment(appointment._id)}
                  className="text-red-500 hover:text-red-700 font-semibold text-sm transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Appointment</h2>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor *</label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={bookingForm.appointmentDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                <input
                  type="time"
                  value={bookingForm.appointmentTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms/Reason for Visit *</label>
                <textarea
                  value={bookingForm.symptoms}
                  onChange={(e) => setBookingForm({ ...bookingForm, symptoms: e.target.value })}
                  placeholder="Describe your symptoms or reason for the appointment..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-semibold"
                >
                  {isSubmitting ? 'Booking...' : 'Book Now'}
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
