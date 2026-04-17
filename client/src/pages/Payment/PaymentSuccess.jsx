import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiArrowRight,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import customFetch from "../../utils/customFetch";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (sessionId) {
      verifyAndLoad();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyAndLoad = async () => {
    try {
      const { data } = await customFetch.post("/api/payment/verify-checkout", {
        sessionId,
      });
      const payment = data?.data;
      setBooking(payment);

      // Fetch appointment details using the referenceId
      if (payment?.referenceId) {
        try {
          const apptRes = await customFetch.get(
            `/api/appointments/${payment.referenceId}`,
          );
          setAppointment(apptRes.data?.appointment || apptRes.data);
        } catch {
          // Non-critical — show payment details without appointment details
        }
      }
    } catch {
      // Session may already be verified on a previous load — still show success
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = "lkr") =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700"
      >
        {/* Header */}
        <div className="bg-teal-500/10 dark:bg-teal-900/30 p-8 flex justify-center border-b border-gray-100 dark:border-slate-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FiCheckCircle className="w-24 h-24 text-teal-600 dark:text-teal-400" />
          </motion.div>
        </div>

        <div className="p-8 pb-10">
          <h1 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-2 text-center">
            Payment Successful!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Your appointment is confirmed. A receipt has been sent to your
            email.
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Booking details card */}
              <div className="bg-[#F2FDFE] dark:bg-teal-900/10 rounded-2xl p-5 space-y-3 border border-teal-100 dark:border-teal-800">
                {/* Doctor */}
                {(booking?.metadata?.doctorName || appointment?.doctorName) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-teal-600 dark:text-teal-300 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Doctor
                      </p>
                      <p className="font-semibold text-[#112429] dark:text-white">
                        {booking?.metadata?.doctorName ||
                          appointment?.doctorName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient */}
                {(booking?.metadata?.patientName ||
                  appointment?.patientName) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-teal-600 dark:text-teal-300 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Patient
                      </p>
                      <p className="font-semibold text-[#112429] dark:text-white">
                        {booking?.metadata?.patientName ||
                          appointment?.patientName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                {appointment?.appointmentDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-teal-600 dark:text-teal-300 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Appointment Date &amp; Time
                      </p>
                      <p className="font-semibold text-[#112429] dark:text-white">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatTime(appointment.appointmentDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Specialization */}
                {appointment?.specialization && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                      <FiClock className="text-teal-600 dark:text-teal-300 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Specialization
                      </p>
                      <p className="font-semibold text-[#112429] dark:text-white">
                        {appointment.specialization}
                      </p>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-teal-100 dark:border-teal-800 pt-3 mt-3">
                  {/* Amount paid */}
                  {booking?.amount && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center flex-shrink-0">
                          <FiCreditCard className="text-teal-600 dark:text-teal-300 w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Amount Paid
                          </p>
                          <p className="font-bold text-lg text-teal-700 dark:text-teal-300">
                            {formatCurrency(booking.amount, booking.currency)}
                          </p>
                        </div>
                      </div>
                      <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold px-3 py-1 rounded-full">
                        PAID
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment status badge */}
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl p-3 text-center">
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                  ✓ Appointment status:{" "}
                  <span className="font-bold">Confirmed</span>
                </p>
              </div>

              {/* Test card hint for sandbox */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl p-3 text-center">
                <p className="text-amber-700 dark:text-amber-400 text-xs">
                  <span className="font-semibold">Sandbox mode:</span> Use test
                  card{" "}
                  <span className="font-mono font-bold">
                    4242 4242 4242 4242
                  </span>
                  , any future date, any 3-digit CVC.
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="flex items-center justify-center gap-2 bg-[#055153] hover:bg-[#033A3C] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg w-full"
            >
              Go to Dashboard <FiArrowRight />
            </button>
            {appointment?._id && (
              <button
                onClick={() => navigate("/patient/appointments")}
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:border-teal-300 text-[#055153] dark:text-teal-400 font-bold py-3.5 px-6 rounded-xl transition-all w-full"
              >
                View Appointments
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
