import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Settings2,
  Calendar as CalendarIcon,
  Ban,
  Check,
  Loader2,
  AlertCircle,
  X,
  Search,
  Bell,
  Lock,
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { toast } from "react-hot-toast";
import customFetch from "../../utils/customFetch";
import { useDoctorContext } from "../../context/DoctorContext";

const Availability = () => {
  const { doctorId, doctorProfile, isLoadingProfile, profileError } =
    useDoctorContext();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekData, setWeekData] = useState([]);
  const [settings, setSettings] = useState({
    appointmentDuration: 30,
    bufferTime: 15,
    isBufferTimeEnabled: true,
    maxAppointmentsPerDay: 12,
    defaultStartTime: "08:00 AM",
    defaultEndTime: "05:00 PM",
  });
  const [tempSettings, setTempSettings] = useState(settings);
  const [blockedDays, setBlockedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [blockDates, setBlockDates] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    if (!doctorId) return;
    fetchWeekData();
    fetchSettings();
    fetchBlockedDays();
  }, [currentWeek, doctorId]);

  // Sync tempSettings when fetched settings change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const weekStart = format(
        startOfWeek(currentWeek, { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );
      const { data } = await customFetch.get(
        `/api/availability/week/${doctorId}?startDate=${weekStart}`,
      );

      if (data.success) {
        setWeekData(data.data);
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        toast.error("Failed to fetch availability data");
      }
    } catch (error) {
      console.error("Error fetching week data:", error);
      toast.error("Error loading availability");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await customFetch.get(
        `/api/availability/settings/${doctorId}`,
      );
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchBlockedDays = async () => {
    try {
      const { data } = await customFetch.get(
        `/api/availability/blocked-days/${doctorId}`,
      );
      if (data.success) {
        setBlockedDays(data.data);
      }
    } catch (error) {
      console.error("Error fetching blocked days:", error);
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleUpdateSettings = async () => {
    try {
      const { data } = await customFetch.put(`/api/availability/settings`, {
        ...tempSettings,
        doctorId,
      });
      if (data.success) {
        setSettings(data.data);
        toast.success("Settings updated successfully");
        fetchWeekData();
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings");
    }
  };

  const handleBlockDays = async () => {
    if (!blockDates.startDate || !blockDates.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      const { data } = await customFetch.post(
        `/api/availability/blocked-days`,
        { ...blockDates, doctorId, type: "vacation" },
      );
      if (data.success) {
        toast.success("Days blocked successfully");
        setBlockDates({ startDate: "", endDate: "" });
        fetchWeekData();
        fetchBlockedDays();
      } else {
        toast.error("Failed to block days");
      }
    } catch (error) {
      console.error("Error blocking days:", error);
      toast.error("Error blocking days");
    }
  };

  const handleUnblockDayRange = async (id) => {
    const confirmed = window.confirm(
      "Unblock this date range? Patients will be able to book appointments on these days again.",
    );
    if (!confirmed) return;

    try {
      const { data } = await customFetch.delete(
        `/api/availability/blocked-days/${id}`,
      );
      if (data.success) {
        toast.success("Days unblocked successfully");
        fetchWeekData();
        fetchBlockedDays();
      } else {
        toast.error("Failed to unblock days");
      }
    } catch (error) {
      console.error("Error unblocking days:", error);
      toast.error("Error unblocking days");
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot) return;

    try {
      const { data } = await customFetch.post(
        `/api/availability/slots/${selectedSlot._id}/block`,
      );
      if (data.success) {
        toast.success("Slot blocked");
        fetchWeekData();
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Error blocking slot:", error);
      toast.error("Error blocking slot");
    }
  };

  const handleUnblockSlot = async () => {
    if (!selectedSlot) return;

    try {
      const { data } = await customFetch.post(
        `/api/availability/slots/${selectedSlot._id}/unblock`,
      );
      if (data.success) {
        toast.success("Slot unblocked");
        fetchWeekData();
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Error unblocking slot:", error);
      toast.error("Error unblocking slot");
    }
  };

  const getDayLabel = (day) => {
    const map = {
      Sunday: "SUN",
      Monday: "MON",
      Tuesday: "TUE",
      Wednesday: "WED",
      Thursday: "THU",
      Friday: "FRI",
      Saturday: "SAT",
    };
    return map[day] || day?.substring(0, 3).toUpperCase() || day;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours + (minutes || 0) / 60;
  };

  const getSlotStyle = (start, end) => {
    const startHour = parseTime(start);
    const endHour = parseTime(end);
    const baseHour = 8; // 08:00 AM start
    const hourlyHeight = 96; // h-24 is 96px

    const top = Math.max(0, (startHour - baseHour) * hourlyHeight) + 16;
    const height = Math.max(20, (endHour - startHour) * hourlyHeight);

    return {
      top: `${top}px`,
      height: `${height}px`,
      position: "absolute",
      width: "90%",
      marginLeft: "5%",
    };
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  // Show error if no doctor profile found
  if (!isLoadingProfile && profileError && !doctorId) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-[#112429] dark:text-white mb-2">
            Doctor Profile Not Found
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 mb-4">
            {profileError}
          </p>
          <p className="text-sm text-[#64748B] dark:text-slate-400">
            Make sure you registered as a doctor. Contact support if the issue
            persists.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
        <Loader2
          className="animate-spin text-[#055153] dark:text-teal-400"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full lg:flex-row flex flex-col gap-6 p-6 overflow-hidden bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent rounded-2xl">
        {/* Header */}
        <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#0D1C2E] dark:text-white mb-1 tracking-tight">
              Manage
              <br />
              Availability
            </h1>
            <p className="text-[#4B5A69] dark:text-slate-400 text-[15px]">
              Configure your working
              <br />
              hours and session blocks.
            </p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_-4px_rgba(0,0,0,0.7)] border border-slate-100 dark:border-slate-800 p-1 px-2 h-12 min-w-[280px]">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 text-center font-bold text-[#0D1C2E] dark:text-slate-100 text-[14px]">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </div>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.8)] border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2
                className="animate-spin text-[#055153] dark:text-teal-400"
                size={32}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 mb-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>{/* Empty top-left cell */}</div>
                {weekData.map((day, idx) => {
                  const isToday =
                    day.date === new Date().toISOString().split("T")[0];
                  return (
                    <div key={idx} className="text-center">
                      <div className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-0.5">
                        {getDayLabel(day.day)}
                      </div>
                      <div
                        className={`text-[20px] font-bold ${
                          isToday
                            ? "text-[#055153] dark:text-teal-400"
                            : day.isPast
                              ? "text-gray-300 dark:text-slate-600"
                              : day.isBlocked
                                ? "text-gray-400 dark:text-slate-500"
                                : "text-[#0D1C2E] dark:text-slate-100"
                        }`}
                      >
                        {day.dayNumber}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Main View */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 h-full min-h-[600px] absolute inset-0">
                  {/* Time Labels Column */}
                  <div className="flex flex-col border-r border-slate-100/50 dark:border-slate-800/60 pr-4 mt-4">
                    {[
                      "08:00 AM",
                      "09:00 AM",
                      "10:00 AM",
                      "11:00 AM",
                      "12:00 PM",
                      "01:00 PM",
                      "02:00 PM",
                      "03:00 PM",
                    ].map((time, i) => (
                      <div
                        key={i}
                        className="h-24 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right whitespace-nowrap"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {weekData.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`relative flex flex-col border-r border-slate-100/50 dark:border-slate-800/60 last:border-r-0 ${day.isBlocked || day.isPast ? "bg-slate-50/50 dark:bg-slate-800/40" : ""}`}
                    >
                      {day.isBlocked ? (
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-100/50 dark:bg-slate-900/60 flex flex-col items-center justify-center p-4">
                          <Ban
                            size={24}
                            className="text-slate-300 dark:text-slate-500 mb-2"
                          />
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider">
                            BLOCKED
                          </span>
                        </div>
                      ) : day.isPast ? (
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center p-4">
                          <span className="text-[11px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">
                            PAST
                          </span>
                        </div>
                      ) : (
                        <div className="h-full relative w-full pt-4">
                          {day.slots.map((slot, slotIdx) => {
                            const style = getSlotStyle(
                              slot.startTime,
                              slot.endTime,
                            );
                            let bgStyles = "";
                            let content = null;

                            if (slot.status === "available") {
                              bgStyles =
                                "bg-[#ECFDF5] border-l-4 border-[#055153] text-[#055153] dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300";
                              content = (
                                <div className="text-[10px] font-bold tracking-wider mb-1 uppercase">
                                  AVAILABLE
                                </div>
                              );
                            } else if (slot.status === "booked") {
                              bgStyles =
                                "bg-[#EEF2FF] border-l-4 border-blue-600 text-blue-900 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]";
                              content = (
                                <div className="flex flex-col h-full justify-between">
                                  <div>
                                    <div className="text-[12px] font-bold leading-tight">
                                      {slot.patientName || "Sarah Jenkins"}
                                    </div>
                                    <div className="text-[11px] text-blue-600 opacity-90">
                                      {slot.appointmentType || "Check-up"}
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-auto pb-0.5">
                                    <Lock
                                      size={11}
                                      className="text-blue-500 opacity-80"
                                    />
                                  </div>
                                </div>
                              );
                            } else if (slot.status === "blocked") {
                              bgStyles =
                                "bg-[#F1F5F9] border-l-4 border-slate-400 text-slate-600 dark:bg-slate-800/60 dark:border-slate-500 dark:text-slate-300";
                              content = (
                                <div className="text-[10px] font-bold tracking-wider mb-1 uppercase">
                                  BLOCKED
                                </div>
                              );
                            }

                            return (
                              <button
                                key={slotIdx}
                                onClick={() => handleSlotClick(slot)}
                                style={style}
                                className={`text-left p-2.5 rounded-r-lg rounded-tl-sm rounded-bl-sm transition-all hover:bg-opacity-80 outline-none ${bgStyles} ${
                                  selectedSlot?._id === slot._id
                                    ? "ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-500 shadow-md z-10"
                                    : "z-0"
                                }`}
                              >
                                {content}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend Footer */}
              <div className="flex items-center justify-between pt-4 mt-2 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-6 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      Booked
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                      Blocked
                    </span>
                  </div>
                </div>

                {/* Slot Context Actions */}
                {selectedSlot && (
                  <div className="flex items-center gap-3 animate-fade-in pr-4">
                    <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                      {selectedSlot.startTime} • {selectedSlot.status}
                    </span>
                    {selectedSlot.status === "blocked" ? (
                      <button
                        onClick={handleUnblockSlot}
                        className="px-4 py-2 text-[12px] font-bold text-emerald-700 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
                      >
                        Unblock Slot
                      </button>
                    ) : selectedSlot.status === "available" ? (
                      <button
                        onClick={handleBlockSlot}
                        className="px-4 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        Block Slot
                      </button>
                    ) : null}
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-5 overflow-y-auto px-1 pb-4 custom-scrollbar">
        {/* Settings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_-4px_rgba(0,0,0,0.8)] border border-slate-100/60 dark:border-slate-800 p-6 pt-5">
          <div className="flex items-center gap-3 mb-6">
            <Settings2
              size={20}
              className="text-[#055153] dark:text-teal-400"
            />
            <h2 className="font-bold text-[17px] text-[#0D1C2E] dark:text-white">
              Appointment Settings
            </h2>
          </div>

          <div className="space-y-6">
            {/* Duration */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Appointment Duration
              </label>
              <select
                value={tempSettings.appointmentDuration}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    appointmentDuration: parseInt(e.target.value),
                  })
                }
                className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-[#0D1C2E] dark:text-slate-100 text-[14px] focus:ring-2 focus:ring-[#055153]/20 dark:focus:ring-teal-500/40 focus:border-[#055153] dark:focus:border-teal-500 transition-all cursor-pointer appearance-none outline-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundPosition: "right 12px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                }}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Buffer Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-[14px] text-[#0D1C2E] dark:text-slate-100">
                  Buffer Time
                </label>
                <button
                  onClick={() =>
                    setTempSettings({
                      ...tempSettings,
                      isBufferTimeEnabled: !tempSettings.isBufferTimeEnabled,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative shadow-inner ${
                    tempSettings.isBufferTimeEnabled
                      ? "bg-[#055153]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-300 ${
                      tempSettings.isBufferTimeEnabled
                        ? "left-[22px]"
                        : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={tempSettings.bufferTime}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      bufferTime: Number.isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value),
                    })
                  }
                  className="w-24 p-3 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-[#0D1C2E] dark:text-slate-100 text-[14px] focus:ring-2 focus:ring-[#055153]/20 dark:focus:ring-teal-500/40 focus:border-[#055153] dark:focus:border-teal-500 transition-all outline-none"
                />
                <span className="text-[13px] text-slate-500 dark:text-slate-400">
                  minutes between sessions
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Max Appointments */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Max Appointments Per Day
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={tempSettings.maxAppointmentsPerDay}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    maxAppointmentsPerDay: parseInt(e.target.value),
                  })
                }
                className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-[#0D1C2E] dark:text-slate-100 text-[14px] focus:ring-2 focus:ring-[#055153]/20 dark:focus:ring-teal-500/40 focus:border-[#055153] dark:focus:border-teal-500 transition-all outline-none"
              />
            </div>

            <div className="h-px bg-slate-100" />

            {/* Block Days Embedded form */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon
                  size={18}
                  className="text-[#055153] dark:text-teal-400"
                />
                <span className="font-bold text-[15px] text-[#0D1C2E] dark:text-white">
                  Block Days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block tracking-widest">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={blockDates.startDate}
                    onChange={(e) =>
                      setBlockDates({
                        ...blockDates,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-[13px] text-[#0D1C2E] dark:text-slate-100 focus:ring-2 focus:ring-[#055153]/20 dark:focus:ring-teal-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block tracking-widest">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={blockDates.endDate}
                    onChange={(e) =>
                      setBlockDates({ ...blockDates, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-medium text-[13px] text-[#0D1C2E] focus:ring-2 focus:ring-[#055153]/20 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleBlockDays}
                className="w-full py-2.5 flex justify-center items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 rounded-xl font-bold text-[13px] transition-colors"
              >
                <Ban size={15} className="opacity-70" />
                Block Days
              </button>

              {/* Existing blocked ranges */}
              {blockedDays && blockedDays.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {blockedDays.map((block) => {
                    const startLabel = block.startDate
                      ? format(new Date(block.startDate), "MMM d, yyyy")
                      : "";
                    const endLabel = block.endDate
                      ? format(new Date(block.endDate), "MMM d, yyyy")
                      : "";
                    return (
                      <div
                        key={block._id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-100">
                            {startLabel}
                            {endLabel && startLabel !== endLabel
                              ? ` – ${endLabel}`
                              : ""}
                          </span>
                          {block.type && (
                            <span className="uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                              {block.type}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockDayRange(block._id)}
                          className="px-2 py-1 rounded-full text-[10px] font-semibold text-emerald-700 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Save Settings */}
            <button
              onClick={handleUpdateSettings}
              className="w-full mt-1 py-3 bg-[#055153] hover:bg-[#064243] dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-xl font-bold text-[14px] transition-all shadow-[0_3px_10px_rgba(5,81,83,0.35)] hover:shadow-[0_5px_16px_rgba(5,81,83,0.45)] hover:-translate-y-0.5"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
