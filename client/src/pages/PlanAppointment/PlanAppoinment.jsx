import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiSliders,
  FiCalendar,
  FiCreditCard,
  FiChevronRight,
  FiShield,
  FiZap,
  FiMapPin,
  FiBriefcase,
  FiArrowLeft,
  FiStar,
} from "react-icons/fi";
import { FaUserMd, FaShieldAlt, FaSun, FaMoon } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import customFetch from "../../utils/customFetch";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function PlanAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Global View State
  const [currentStep, setCurrentStep] = useState(1);

  // Payment Constants (LKR)
  const doctorFee = 2500;
  const serviceTax = 125;
  const totalAmount = 2625;

  // ── STEP 1: Doctor State ──
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  // ── STEP 2: Time Slot State ──
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [weekRange, setWeekRange] = useState(null);
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // ── STEP 3: Patient Details State ──
  const [patientName, setPatientName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [consultationType, setConsultationType] = useState("In-Person"); // 'In-Person' or 'Video'

  // ── STEP 4: Booking Confirmation State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null); // holds created appointment data
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 1. Fetch Doctors on Mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await customFetch.get("/api/doctor");
        const docs = data.data || [];
        setDoctors(docs);

        const uniqueSpecialties = [
          ...new Set(docs.map((d) => d.specialization).filter(Boolean)),
        ];
        setSpecialties(["All Specialties", ...uniqueSpecialties]);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Fetch Availability when Doctor is Selected
  const fetchAvailability = async (doctor) => {
    setIsLoadingAvailability(true);
    try {
      // Use doctorId if it exists, fallback to _id
      const idToUse = doctor.doctorId || doctor._id;
      const res = await customFetch.get(`/api/availability/week/${idToUse}`);

      if (res.data.success) {
        const days = res.data.data || [];
        setAvailabilityData(days);
        setWeekRange(res.data.weekRange);

        // Auto-select the first working day that isn't completely blocked
        const firstAvailable =
          days.find((d) => !d.isBlocked && d.isWorkingDay) || days[0];
        setSelectedDateObj(firstAvailable);
      }
    } catch (err) {
      console.error(err);
      toast.error("Doctor's schedule is currently unavailable");
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    setCurrentStep(2);
    // Reset slot selection
    setSelectedSlot(null);
    fetchAvailability(doc);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter Logic for Step 1
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doctor.specialization === selectedSpecialty;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchLower) ||
      doctor.specialization?.toLowerCase().includes(searchLower) ||
      doctor.bio?.toLowerCase().includes(searchLower);

    return matchesSpecialty && matchesSearch;
  });

  // Steps Configuration
  const steps = [
    { id: 1, label: "Select Clinic" },
    { id: 2, label: "Schedule" },
    { id: 3, label: "Confirm & Pay" },
  ];

  // Helper methods for Step 2 UI Mapping
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, mins] = time.split(":").map(Number);
    return { hours, mins, period };
  };

  const categorizedSlots = { morning: [], afternoon: [], evening: [] };
  if (selectedDateObj && selectedDateObj.slots) {
    selectedDateObj.slots.forEach((slot) => {
      const { hours, period } = parseTime(slot.startTime);
      if (period === "AM") {
        categorizedSlots.morning.push(slot);
      } else {
        if (hours === 12 || hours < 5) categorizedSlots.afternoon.push(slot);
        else categorizedSlots.evening.push(slot);
      }
    });
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMonthRange = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    const monthStr = s.toLocaleDateString("en-US", { month: "short" });
    return `${monthStr} ${s.getDate()} - ${monthStr} ${e.getDate()}, ${s.getFullYear()}`;
  };

  // ── STEP 4: Final Booking Handler ───────────────────────────────────
  // Flow: 1) Create Appointment → 2) Book TimeSlot → 3) Create Payment Checkout
  const handleFinalBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // ── STEP A: Create the Appointment ──
      const appointmentDate = new Date(
        `${selectedDateObj.date}T${convertTo24h(selectedSlot.startTime)}`,
      );

      const appointmentPayload = {
        doctorId: selectedDoctor.doctorId || selectedDoctor._id,
        appointmentDate: appointmentDate.toISOString(),
        symptoms,
        patientName,
        contactPhone,
        patientEmail: user?.email || "",
        specialization: selectedDoctor.specialization || undefined,
      };

      const { data: aptData } = await customFetch.post(
        "/api/appointments",
        appointmentPayload,
      );
      const createdAppointment = aptData.appointment;
      setBookedAppointment(createdAppointment);

      // ── STEP B: Mark the TimeSlot as booked in doctor-service ──
      try {
        await customFetch.post(
          `/api/availability/slots/${selectedSlot._id}/book`,
          {
            appointmentId: createdAppointment._id,
            patientId: createdAppointment.patientId,
            patientName,
            appointmentType:
              consultationType === "Video"
                ? "Video Consultation"
                : "In-Person Visit",
          },
        );
      } catch (slotErr) {
        // Non-fatal: appointment already created; log and continue
        console.warn(
          "Slot booking warning:",
          slotErr?.response?.data?.message || slotErr.message,
        );
      }

      // ── STEP C: Create Stripe Checkout Session (payment-service on :3005) ──
      try {
        const paymentRes = await customFetch.post("/api/payment/checkout", {
          amount: totalAmount,
          currency: "lkr",
          paymentType: "appointment",
          referenceId: createdAppointment._id,
          metadata: {
            appointmentId: createdAppointment._id,
            doctorId: selectedDoctor.doctorId || selectedDoctor._id,
            doctorName: selectedDoctor.name,
            patientName,
          },
        });

        // Redirect to Stripe checkout
        if (paymentRes.data?.data?.checkoutUrl) {
          toast.success("Booking confirmed! Redirecting to payment...");
          setTimeout(() => {
            window.location.href = paymentRes.data.data.checkoutUrl;
          }, 1500);
          return;
        }
      } catch (paymentErr) {
        // Payment service may not be running — show success screen anyway
        console.warn(
          "Payment service unavailable:",
          paymentErr?.response?.data?.message || paymentErr.message,
        );
      }

      // ── Fallback: Show success screen if payment service not available ──
      setBookingSuccess(true);
      setCurrentStep(4);
      toast.success("Appointment booked successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: convert "09:30 AM" -> "09:30" for Date parsing
  const convertTo24h = (timeStr) => {
    if (!timeStr) return "09:00";
    const [time, period] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-slate-900 pb-20 font-inter">
      {/* ── Top Progress Header ── */}
      <div className="w-full bg-[#FAFAFB] dark:bg-slate-900 pt-10 pb-6 sticky top-0 z-10 mb-8 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 dark:bg-slate-700 -z-10 -translate-y-4 rounded-full mx-10"></div>

            {steps.map((step) => {
              const isActive =
                currentStep === step.id || (currentStep === 4 && step.id === 3);
              const isPast =
                currentStep > step.id && !(currentStep === 4 && step.id === 3);
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center bg-[#FAFAFB] dark:bg-slate-900 px-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                      isActive || isPast
                        ? "bg-[#055153] text-[white] shadow-md"
                        : "bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-600"
                    }`}
                  >
                    {isPast ? <span className="text-white">✓</span> : step.id}
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-wide ${
                      isActive
                        ? "text-[#055153] dark:text-teal-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Dynamic Content Container ── */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <>
          {/* STEP 1: DOCTOR SELECTION */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <h1 className="text-4xl md:text-[44px] font-extrabold text-[#112429] dark:text-white tracking-tight mb-4">
                  Select your{" "}
                  <span className="text-[#055153] dark:text-teal-400 relative">
                    specialist.
                    <svg
                      className="absolute w-full h-3 -bottom-1 left-0 text-teal-200/50"
                      viewBox="0 0 100 20"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 15 Q 50 0 100 15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
                <p className="text-[#4B5A69] dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
                  Connect with world-class medical professionals verified by our
                  clinical editorial board. Precision care, human empathy.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, specialty, or symptoms..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-none outline-none ring-1 ring-gray-200 dark:ring-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#055153] dark:focus:ring-teal-500 shadow-sm text-gray-700 dark:text-gray-200 font-medium transition-all"
                  />
                </div>
                <button className="flex items-center justify-center gap-3 px-6 py-4 bg-[#F4F7FA] dark:bg-slate-800 text-[#4B5A69] dark:text-slate-300 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
                  <FiSliders className="w-5 h-5" />
                  Advanced Filters
                  <FiChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              {/* Specialties Pill List */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                {specialties.length > 0
                  ? specialties.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSelectedSpecialty(spec)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                          selectedSpecialty === spec
                            ? "bg-[#055153] text-white border-[#055153]"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300"
                        }`}
                      >
                        {spec}
                      </button>
                    ))
                  : null}
              </div>

              {/* Doctors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {isLoadingDoctors
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 animate-pulse h-[320px]"
                      ></div>
                    ))
                  : filteredDoctors.map((doc, index) => (
                      <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-800 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col group"
                      >
                        <div className="flex items-start gap-4 mb-6 relative">
                          <div className="relative">
                            <img
                              src={
                                doc.profileImage?.includes("http")
                                  ? doc.profileImage
                                  : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
                              }
                              alt={doc.name}
                              className="w-20 h-20 rounded-[20px] object-cover shadow-sm group-hover:scale-105 transition-transform"
                            />
                            {doc.isVerified && (
                              <div className="absolute -bottom-2 -right-2 bg-[#0E8A7F] border-2 border-white text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Verified
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-bold text-[#055153] text-sm">
                                {doc.rating?.average?.toFixed(1) || "4.9"}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({doc.rating?.count || "0"} reviews)
                              </span>
                            </div>

                            <h3 className="font-extrabold text-[19px] text-[#112429] dark:text-white leading-tight truncate">
                              Dr. {doc.name}
                            </h3>
                            <p className="text-[#64748B] text-[13px] font-medium leading-relaxed mb-3 truncate">
                              {doc.specialization}
                            </p>

                            {doc.experience > 0 && (
                              <div className="inline-flex bg-[#EEF5F9] text-[#0E8A7F] px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 border border-[#E1EEF4]">
                                <FaUserMd /> {doc.experience} Years Experience
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 mb-7 flex-1 border-t border-gray-100 pt-5">
                          <div className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2.5 text-[#4B5A69] font-medium">
                              <FiCalendar className="w-4 h-4 text-[#055153]" />{" "}
                              Next Slot
                            </div>
                            <div className="font-bold text-[#112429]">
                              Tomorrow, 09:30 AM
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2.5 text-[#4B5A69] font-medium">
                              <FiCreditCard className="w-4 h-4 text-[#055153]" />{" "}
                              Consultation
                            </div>
                            <div className="font-bold text-[#112429]">
                              Rs. 2500.00
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDoctorSelect(doc)}
                          className="w-full bg-[#055153] hover:bg-[#044143] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg active:scale-95"
                        >
                          Book Appointment
                        </button>
                      </motion.div>
                    ))}
              </div>

              {/* Why Book With Us */}
              <div className="mb-20">
                <h2 className="text-2xl font-extrabold text-[#112429] dark:text-white mb-8">
                  Why book with us?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="rounded-[28px] p-8 bg-[#F8FAFC] border border-[#EEF2F6]">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FaShieldAlt className="w-5 h-5 text-[#055153]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#112429] mb-3">
                      Verified Experts
                    </h3>
                    <p className="text-[#64748B] text-[14px] leading-relaxed font-medium">
                      Every clinician is rigorously vetted by our editorial
                      board for credentials and experience.
                    </p>
                  </div>
                  {/* Card 2 */}
                  <div className="rounded-[28px] p-8 bg-[#055153] border border-[#044143] text-white shadow-xl shadow-[#055153]/20">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <FiZap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      Instant Booking
                    </h3>
                    <p className="text-white/80 text-[14px] leading-relaxed font-medium">
                      No phone calls, no waiting. Secure your appointment in
                      under 60 seconds with real-time sync.
                    </p>
                  </div>
                  {/* Card 3 */}
                  <div className="rounded-[28px] p-8 bg-[#F8FAFC] border border-[#EEF2F6]">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FiShield className="w-5 h-5 text-[#055153]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#112429] mb-3">
                      Data Privacy
                    </h3>
                    <p className="text-[#64748B] text-[14px] leading-relaxed font-medium">
                      Your medical records and personal details are encrypted
                      using clinical-grade security protocols.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TIME SLOT SELECTION */}
          {currentStep === 2 && selectedDoctor && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mb-20 items-start"
            >
              {/* === LEFT COLUMN: Available Slots === */}
              <div>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-2">
                      Available Slots
                    </h2>
                    <p className="text-[#4B5A69] dark:text-slate-400">
                      Select a time that works best for your schedule.
                    </p>
                  </div>

                  {/* Date Range Pill */}
                  <div className="bg-[#EEF5F9] dark:bg-slate-800 text-[#055153] dark:text-teal-400 px-4 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 border border-[#E1EEF4] dark:border-slate-700 w-fit">
                    <FiCalendar className="w-4 h-4" />
                    {weekRange
                      ? formatMonthRange(weekRange.start, weekRange.end)
                      : "Loading..."}
                  </div>
                </div>

                {/* Horizontal Date Selector */}
                <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-8">
                  {isLoadingAvailability ? (
                    <div className="h-20 flex items-center justify-center text-gray-500 font-medium">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#055153] mr-3"></div>
                      Loading doctor's availability...
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide">
                        {availabilityData.map((dayData, i) => {
                          const isSelected =
                            selectedDateObj?.date === dayData.date;
                          const isDisabled =
                            dayData.isBlocked || !dayData.isWorkingDay;
                          const dayShort = dayData.day
                            .substring(0, 3)
                            .toUpperCase();

                          return (
                            <button
                              key={i}
                              disabled={isDisabled}
                              onClick={() => {
                                setSelectedDateObj(dayData);
                                setSelectedSlot(null);
                              }}
                              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-300 ${
                                isSelected
                                  ? "bg-[#E0F2FE] dark:bg-teal-900/30 text-[#055153] dark:text-teal-400 font-extrabold ring-1 ring-teal-200"
                                  : isDisabled
                                    ? "opacity-40 cursor-not-allowed text-gray-400"
                                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-slate-800 cursor-pointer font-bold"
                              }`}
                            >
                              <span className="text-[10px] tracking-wider mb-1">
                                {dayShort}
                              </span>
                              <span className="text-xl">
                                {dayData.dayNumber}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Time Slot Grids */}
                      {selectedDateObj?.slots?.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl text-slate-500">
                          No slots available for this day.
                        </div>
                      ) : (
                        <div className="space-y-8 mt-6">
                          {/* Morning */}
                          {categorizedSlots.morning.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-bold text-[#112429] dark:text-gray-200 mb-4 tracking-wide">
                                <FaSun className="text-amber-500" /> Morning
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {categorizedSlots.morning.map((slot, i) => {
                                  const isBooked = slot.status !== "available";
                                  const isSelected =
                                    selectedSlot?._id === slot._id;
                                  return (
                                    <button
                                      key={i}
                                      disabled={isBooked}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                        isSelected
                                          ? "bg-[#055153] text-white shadow-lg"
                                          : isBooked
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60 line-through decoration-gray-400"
                                            : "bg-[#EBF3FB] text-[#0761A6] hover:bg-[#D5E6F7]"
                                      }`}
                                    >
                                      {slot.startTime}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Afternoon */}
                          {categorizedSlots.afternoon.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-bold text-[#112429] dark:text-gray-200 mb-4 tracking-wide">
                                <FaSun className="text-amber-600" /> Afternoon
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {categorizedSlots.afternoon.map((slot, i) => {
                                  const isBooked = slot.status !== "available";
                                  const isSelected =
                                    selectedSlot?._id === slot._id;
                                  return (
                                    <button
                                      key={i}
                                      disabled={isBooked}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                        isSelected
                                          ? "bg-[#055153] text-white shadow-lg"
                                          : isBooked
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60 line-through decoration-gray-400"
                                            : "bg-[#EBF3FB] text-[#0761A6] hover:bg-[#D5E6F7]"
                                      }`}
                                    >
                                      {slot.startTime}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Evening */}
                          {categorizedSlots.evening.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-bold text-[#112429] dark:text-gray-200 mb-4 tracking-wide">
                                <FaMoon className="text-[#4B5A69]" /> Evening
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {categorizedSlots.evening.map((slot, i) => {
                                  const isBooked = slot.status !== "available";
                                  const isSelected =
                                    selectedSlot?._id === slot._id;
                                  return (
                                    <button
                                      key={i}
                                      disabled={isBooked}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                                        isSelected
                                          ? "bg-[#055153] text-white shadow-lg"
                                          : isBooked
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60 line-through decoration-gray-400"
                                            : "bg-[#EBF3FB] text-[#0761A6] hover:bg-[#D5E6F7]"
                                      }`}
                                    >
                                      {slot.startTime}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-[#055153] font-bold hover:text-teal-700 transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5" /> Previous Step
                  </button>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => {
                      // Proceed logic
                      setCurrentStep(3);
                    }}
                    className={`px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-xl ${
                      selectedSlot
                        ? "bg-[#055153] hover:bg-[#033A3C] text-white shadow-[#055153]/30 cursor-pointer transform hover:-translate-y-0.5"
                        : "bg-gray-300 text-white shadow-none cursor-not-allowed opacity-70"
                    }`}
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>

              {/* === RIGHT COLUMN: Sidebar === */}
              <div className="space-y-6">
                {/* Doctor Summary Card */}
                <div className="bg-gradient-to-b from-[#F2FDFE] to-white dark:from-slate-800 dark:to-slate-800 rounded-[32px] p-8 border border-[#E0F3F4] dark:border-slate-700 shadow-sm relative overflow-hidden">
                  {/* Background Glow */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-100 dark:bg-teal-900/20 blur-3xl rounded-full"></div>

                  {/* Doctor Portrait */}
                  <div className="flex flex-col flex-col items-center text-center relative z-10 mb-8 pt-4">
                    <div className="relative mb-5">
                      <img
                        src={
                          selectedDoctor?.profileImage?.includes("http")
                            ? selectedDoctor.profileImage
                            : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
                        }
                        alt={selectedDoctor?.name}
                        className="w-24 h-24 rounded-3xl object-cover shadow-xl shadow-teal-900/10"
                      />
                      {selectedDoctor?.isVerified && (
                        <div className="absolute -bottom-2 -right-3 bg-[#055153] border-2 border-white text-white p-1 rounded-full shadow-md">
                          <MdVerified className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-[22px] font-extrabold text-[#112429] dark:text-white mb-1">
                      Dr. {selectedDoctor?.name}
                    </h3>
                    <p className="text-[#055153] dark:text-teal-400 font-bold text-sm mb-3">
                      {selectedDoctor?.specialization}
                    </p>
                    <div className="inline-flex bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-slate-600 px-3 py-1 rounded-full items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <FiStar className="text-amber-400 fill-amber-400 w-3.5 h-3.5" />
                      {selectedDoctor?.rating?.average?.toFixed(1) || "4.9"}
                      <span className="text-xs font-medium text-slate-400 ml-1">
                        ({selectedDoctor?.rating?.count || "120"} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Detail List */}
                  <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FiMapPin className="text-[#055153] dark:text-teal-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mb-0.5">
                          Location
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white text-[13px]">
                          {selectedDoctor?.location ||
                            "Central Medical Plaza, Suite 402"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FiCreditCard className="text-[#055153] dark:text-teal-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mb-0.5">
                          Fee
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white text-[13px]">
                          Rs. 2500.00 per session
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FiBriefcase className="text-[#055153] dark:text-teal-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mb-0.5">
                          Next Step
                        </p>
                        <p className="text-[#112429] dark:text-white text-[13px] italic font-semibold">
                          Insurance Verification
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary Widget */}
                  <div className="mt-8 bg-[#EFFFFF] dark:bg-teal-900/20 border border-[#BAEBEB] dark:border-teal-800 rounded-2xl p-5">
                    <div className="text-[10px] font-extrabold tracking-widest text-[#055153] dark:text-teal-500 uppercase mb-3">
                      Booking Summary
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[13px] text-[#4B5A69] dark:text-slate-400 font-medium">
                        Selected Time
                      </span>
                      <span className="text-[13px] font-bold text-[#112429] dark:text-white text-right">
                        {selectedSlot
                          ? `${formatShortDate(selectedDateObj?.date)}, ${selectedSlot.startTime}`
                          : "---"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="bg-[#1C2C3E] rounded-[32px] p-8 text-white relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 opacity-10">
                    <FiShield className="w-32 h-32" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 relative z-10">
                    Need assistance?
                  </h3>
                  <p className="text-[#9BAEC1] text-[13px] leading-relaxed mb-6 font-medium relative z-10 pr-4">
                    Our patient coordinators are available 24/7 to help with
                    your booking.
                  </p>
                  <button className="w-full bg-[#055153] hover:bg-[#066163] text-white font-bold py-3.5 rounded-xl transition-colors relative z-10">
                    Contact Support
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PATIENT DETAILS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mb-20 items-start"
            >
              {/* === LEFT COLUMN: Patient Form === */}
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-2">
                    Patient Details
                  </h2>
                  <p className="text-[#4B5A69] dark:text-slate-400">
                    Please provide your details and symptoms to finalize your
                    booking.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 mb-8 space-y-6">
                  {/* Consultation Type Selector */}
                  <div>
                    <label className="block text-sm font-bold text-[#112429] dark:text-gray-200 mb-3">
                      Consultation Category
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setConsultationType("In-Person")}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          consultationType === "In-Person"
                            ? "border-[#055153] bg-[#F2FDFE] dark:bg-teal-900/20"
                            : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-200"
                        }`}
                      >
                        {consultationType === "In-Person" && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#055153] rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${consultationType === "In-Person" ? "bg-[#055153] text-white" : "bg-[#EEF5F9] dark:bg-slate-700 text-[#055153] dark:text-teal-400"}`}
                        >
                          <FiMapPin className="w-5 h-5" />
                        </div>
                        <h4
                          className={`font-bold text-[15px] mb-1 ${consultationType === "In-Person" ? "text-[#055153] dark:text-teal-300" : "text-[#112429] dark:text-white"}`}
                        >
                          In-Person Visit
                        </h4>
                        <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                          Visit the doctor physically at the clinical location.
                        </p>
                      </button>

                      <button
                        onClick={() => setConsultationType("Video")}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          consultationType === "Video"
                            ? "border-[#055153] bg-[#F2FDFE] dark:bg-teal-900/20"
                            : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-200"
                        }`}
                      >
                        {consultationType === "Video" && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#055153] rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${consultationType === "Video" ? "bg-[#055153] text-white" : "bg-[#EEF5F9] dark:bg-slate-700 text-[#055153] dark:text-teal-400"}`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h4
                          className={`font-bold text-[15px] mb-1 ${consultationType === "Video" ? "text-[#055153] dark:text-teal-300" : "text-[#112429] dark:text-white"}`}
                        >
                          Video Consultation
                        </h4>
                        <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                          Secure online telemedicine video room connection.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-100 dark:bg-slate-700 my-4"></div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-[#112429] dark:text-gray-200 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-3.5 bg-[#F8FAFC] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#055153] dark:focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-[#112429] dark:text-gray-200 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) =>
                        setContactPhone(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile number"
                      className="w-full px-5 py-3.5 bg-[#F8FAFC] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#055153] dark:focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                      <FiShield className="text-[#055153] w-3.5 h-3.5" /> We
                      strictly protect your privacy.
                    </p>
                  </div>

                  {/* Symptoms (Sent to AI) */}
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-[#112429] dark:text-gray-200 mb-2 flex justify-between items-end">
                      Symptoms
                      <span className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-md font-extrabold flex items-center gap-1.5">
                        <FiZap className="w-3 h-3" /> AI Analyzed
                      </span>
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Briefly describe your symptoms or reason for visit... Our clinical AI will analyze this for your doctor."
                      rows="4"
                      className="w-full px-5 py-3.5 bg-[#F8FAFC] dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#055153] dark:focus:ring-teal-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-[#055153] font-bold hover:text-teal-700 transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5" /> Previous Step
                  </button>
                  <button
                    disabled={
                      !patientName || contactPhone.length !== 10 || !symptoms
                    }
                    onClick={() => {
                      if (contactPhone.length !== 10) {
                        toast.error(
                          "Please enter a valid 10-digit phone number",
                        );
                        return;
                      }
                      setCurrentStep(4);
                    }}
                    className={`px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-xl ${
                      patientName && contactPhone.length === 10 && symptoms
                        ? "bg-[#055153] hover:bg-[#033A3C] text-white shadow-[#055153]/30 cursor-pointer transform hover:-translate-y-0.5"
                        : "bg-gray-300 text-white shadow-none cursor-not-allowed opacity-70"
                    }`}
                  >
                    Review & Confirm
                  </button>
                </div>
              </div>

              {/* === RIGHT COLUMN: Sidebar Context (Reused) === */}
              <div className="space-y-6">
                {/* Doctor Summary Card */}
                <div className="bg-gradient-to-b from-[#F2FDFE] to-white dark:from-slate-800 dark:to-slate-800 rounded-[32px] p-8 border border-[#E0F3F4] dark:border-slate-700 shadow-sm relative overflow-hidden">
                  {/* Background Glow */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-100 dark:bg-teal-900/20 blur-3xl rounded-full"></div>

                  {/* Doctor Portrait */}
                  <div className="flex flex-col flex-col items-center text-center relative z-10 mb-8 pt-4">
                    <div className="relative mb-5">
                      <img
                        src={
                          selectedDoctor?.profileImage?.includes("http")
                            ? selectedDoctor.profileImage
                            : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
                        }
                        alt={selectedDoctor?.name}
                        className="w-24 h-24 rounded-3xl object-cover shadow-xl shadow-teal-900/10"
                      />
                      {selectedDoctor?.isVerified && (
                        <div className="absolute -bottom-2 -right-3 bg-[#055153] border-2 border-white text-white p-1 rounded-full shadow-md">
                          <MdVerified className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-[22px] font-extrabold text-[#112429] dark:text-white mb-1">
                      Dr. {selectedDoctor?.name}
                    </h3>
                    <p className="text-[#055153] dark:text-teal-400 font-bold text-sm mb-3">
                      {selectedDoctor?.specialization}
                    </p>
                  </div>

                  {/* Detail List */}
                  <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FiMapPin className="text-[#055153] dark:text-teal-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mb-0.5">
                          Location
                        </p>
                        <p className="font-bold text-[#112429] dark:text-white text-[13px]">
                          {consultationType === "In-Person"
                            ? selectedDoctor?.location ||
                              "Central Medical Plaza, Suite 402"
                            : "Virtual Telemedicine Room"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF5F9] dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FiBriefcase className="text-[#055153] dark:text-teal-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#64748B] uppercase mb-0.5">
                          Next Step
                        </p>
                        <p className="text-[#112429] dark:text-white text-[13px] italic font-semibold">
                          Final Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary Widget */}
                  <div className="mt-8 bg-[#EFFFFF] dark:bg-teal-900/20 border border-[#BAEBEB] dark:border-teal-800 rounded-2xl p-5">
                    <div className="text-[10px] font-extrabold tracking-widest text-[#055153] dark:text-teal-500 uppercase mb-3">
                      Booking Summary
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[13px] text-[#4B5A69] dark:bg-slate-400 font-medium">
                        Selected Time
                      </span>
                      <span className="text-[13px] font-bold text-[#112429] dark:text-white text-right">
                        {selectedSlot
                          ? `${formatShortDate(selectedDateObj?.date)}, ${selectedSlot.startTime}`
                          : "---"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      </div>

      {/* ── STEP 4 & SUCCESS: Confirmation Screen ── */}
      {currentStep === 4 && (
        <>
          {bookingSuccess ? (
            /* === SUCCESS SCREEN === */
            <div className="fixed inset-0 bg-[#FAFAFB] dark:bg-slate-900 z-50 flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-center max-w-md w-full"
              >
                {/* Tick Circle */}
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-[#055153] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-extrabold text-[#112429] dark:text-white mb-3">
                  Booking Confirmed!
                </h1>
                <p className="text-[#4B5A69] dark:text-slate-400 mb-2 text-lg">
                  Your appointment has been successfully booked.
                </p>
                {bookedAppointment && (
                  <p className="text-[#055153] font-mono font-bold text-sm mb-8 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-xl inline-block">
                    ID: #{bookedAppointment._id?.slice(-8).toUpperCase()}
                  </p>
                )}

                {/* Summary Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-left mb-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        selectedDoctor?.profileImage?.includes("http")
                          ? selectedDoctor.profileImage
                          : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
                      }
                      alt={selectedDoctor?.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-extrabold text-[#112429] dark:text-white">
                        Dr. {selectedDoctor?.name}
                      </p>
                      <p className="text-[#055153] text-sm font-semibold">
                        {selectedDoctor?.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-100 dark:bg-slate-700" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                        Date & Time
                      </p>
                      <p className="font-bold text-[#112429] dark:text-white">
                        {formatShortDate(selectedDateObj?.date)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {selectedSlot?.startTime} – {selectedSlot?.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                        Type
                      </p>
                      <p className="font-bold text-[#112429] dark:text-white">
                        {consultationType === "Video"
                          ? "Video Consultation"
                          : "In-Person Visit"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                        Status
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        ⏳ Pending Confirmation
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                        Patient
                      </p>
                      <p className="font-bold text-[#112429] dark:text-white">
                        {patientName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Pre-medication Steps */}
                {bookedAppointment?.preMedicationSteps?.length > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl p-5 text-left mb-6">
                    <p className="text-[10px] font-extrabold tracking-widest text-[#055153] uppercase mb-3 flex items-center gap-1.5">
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
                      </svg>{" "}
                      AI Pre-Visit Steps
                    </p>
                    <ul className="space-y-1.5">
                      {bookedAppointment.preMedicationSteps.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#055153] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/patient-dashboard")}
                    className="flex-1 py-3.5 bg-[#055153] hover:bg-[#033A3C] text-white font-bold rounded-xl transition-all"
                  >
                    View My Appointments
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setBookingSuccess(false);
                      setBookedAppointment(null);
                    }}
                    className="flex-1 py-3.5 border-2 border-gray-200 dark:border-slate-600 text-[#055153] dark:text-teal-400 font-bold rounded-xl hover:border-teal-300 transition-all"
                  >
                    Book Another
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* === STEP 4 REVIEW & PAY SCREEN === */
            <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 mb-20 items-start"
              >
                {/* === LEFT COLUMN === */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-[#112429] dark:text-white mb-2">
                      Finalize Booking
                    </h2>
                    <p className="text-[#4B5A69] dark:text-slate-400">
                      Review your appointment details and complete payment.
                    </p>
                  </div>

                  {/* Patient Notes Review */}
                  <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
                    <p className="text-[10px] font-extrabold tracking-widest text-[#055153] uppercase mb-4 flex items-center gap-2">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Patient Notes
                    </p>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">
                          Full Name
                        </span>
                        <span className="font-bold text-[#112429] dark:text-white">
                          {patientName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">
                          Phone
                        </span>
                        <span className="font-bold text-[#112429] dark:text-white">
                          {contactPhone}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">
                          Consultation Type
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            consultationType === "Video"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400"
                          }`}
                        >
                          {consultationType === "Video"
                            ? "📹 Video Consultation"
                            : "🏥 In-Person Visit"}
                        </span>
                      </div>
                      <div className="h-[1px] bg-gray-100 dark:bg-slate-700" />
                      <div>
                        <span className="text-slate-500 font-medium block mb-3 flex items-center gap-2">
                          <FiZap className="text-amber-500 w-3.5 h-3.5" />
                          Symptoms & Clinical Notes (Editable)
                        </span>
                        <textarea
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-2xl p-5 text-[#112429] dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none min-h-[120px]"
                          placeholder="Add any specific symptoms, medical history, or questions for the doctor..."
                        />
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          AI will analyze these notes to provide pre-medication
                          suggestions.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white dark:bg-slate-800 rounded-[28px] p-8 shadow-sm border border-gray-100 dark:border-slate-700 mb-8">
                    <p className="text-[10px] font-extrabold tracking-widest text-[#055153] uppercase mb-5 flex items-center gap-2">
                      <FiCreditCard className="w-3.5 h-3.5" /> SECURE PAYMENT
                      METHOD
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 p-6 rounded-2xl border-2 border-[#055153] bg-[#F2FDFE] dark:bg-teal-900/10 shadow-md relative">
                        <div className="absolute top-4 right-4 w-6 h-6 bg-[#055153] rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                            <FiCreditCard className="text-[#055153] w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#112429] dark:text-white text-lg">
                              Stripe Checkout
                            </h4>
                            <p className="text-sm text-slate-500 font-medium">
                              Safe & Secure Credit Card
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-6 text-center italic font-medium">
                      Secure checkout powered by Stripe. You will be redirected
                      to complete payment securely.
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 text-[#055153] font-bold hover:text-teal-700 transition-colors"
                    >
                      <FiArrowLeft className="w-5 h-5" /> Previous Step
                    </button>
                    <button
                      onClick={handleFinalBooking}
                      disabled={isSubmitting}
                      className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-xl flex items-center gap-3 ${
                        isSubmitting
                          ? "bg-gray-400 cursor-wait"
                          : "bg-[#055153] hover:bg-[#033A3C] shadow-[#055153]/30 transform hover:-translate-y-0.5 cursor-pointer"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>{" "}
                          Booking...
                        </>
                      ) : (
                        <>
                          <FiCreditCard className="w-5 h-5" /> Confirm Booking &
                          Pay Rs. 2625
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* === RIGHT COLUMN: Appointment Summary === */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-[10px] font-extrabold tracking-widest text-[#055153] uppercase mb-6">
                      Appointment Summary
                    </p>

                    {/* Doctor */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                      <img
                        src={
                          selectedDoctor?.profileImage?.includes("http")
                            ? selectedDoctor.profileImage
                            : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop"
                        }
                        alt={selectedDoctor?.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-md"
                      />
                      <div>
                        <p className="font-extrabold text-[#112429] dark:text-white">
                          Dr. {selectedDoctor?.name}
                        </p>
                        <p className="text-[#055153] text-sm font-semibold">
                          {selectedDoctor?.specialization}
                        </p>
                        {selectedDoctor?.rating?.average > 0 && (
                          <p className="text-amber-500 text-xs font-bold flex items-center gap-1 mt-0.5">
                            <FiStar className="w-3 h-3 fill-amber-500" />{" "}
                            {selectedDoctor.rating.average.toFixed(1)} (
                            {selectedDoctor.rating.count}+ reviews)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 text-sm mb-6">
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                          <FiCalendar className="text-[#055153] w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Date & Time
                          </p>
                          <p className="font-bold text-[#112429] dark:text-white">
                            {formatShortDate(selectedDateObj?.date)}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">
                            {selectedSlot?.startTime} – {selectedSlot?.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                          <FiMapPin className="text-[#055153] w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            {consultationType === "Video"
                              ? "Session Type"
                              : "Clinic Location"}
                          </p>
                          <p className="font-bold text-[#112429] dark:text-white">
                            {consultationType === "Video"
                              ? "Virtual Telemedicine Room"
                              : selectedDoctor?.location ||
                                selectedDoctor?.hospital ||
                                "Central Medical Plaza"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="space-y-4 mb-6 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium font-semibold">
                          Consultation Fee
                        </span>
                        <span className="font-bold text-[#112429] dark:text-white">
                          Rs. {doctorFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium font-semibold">
                          Service Tax (5%)
                        </span>
                        <span className="font-bold text-[#112429] dark:text-white">
                          Rs. {serviceTax.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Total Bar matching design */}
                    <div className="bg-[#055153] text-white rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-teal-900/20 mb-6">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-extrabold text-3xl font-mono">
                        Rs. {totalAmount}
                      </span>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <FiShield className="text-[#055153] w-4 h-4 shrink-0" />
                      Secured by 256-bit SSL encryption. Your data is protected.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlanAppointment;
