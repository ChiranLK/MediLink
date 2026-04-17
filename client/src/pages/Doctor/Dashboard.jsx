import React, { useEffect, useState } from "react";
import {
  Calendar,
  Briefcase,
  ClipboardList,
  Wallet,
  Download,
  Star,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useDoctorContext } from "../../context/DoctorContext";
import customFetch from "../../utils/customFetch";
import StatCard from "../../components/DoctorDashboard/StatCard";
import ScheduleList from "../../components/DoctorDashboard/ScheduleList";
import ActivityFeed from "../../components/DoctorDashboard/ActivityFeed";
import QuickShortcuts from "../../components/DoctorDashboard/QuickShortcuts";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const loadImageAsDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = src;
  });

const safeText = (value, fallback = "-") =>
  String(value || fallback).replace(/[\r\n]+/g, " ");

const formatDateTime = (dateStr) => {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const { doctorId, profileError } = useDoctorContext();
  const doctorName = user?.name || user?.fullName || "Doctor";

  const [stats, setStats] = useState({
    total: 0,
    todayCount: 0,
    remainingToday: 0,
    pendingCount: 0,
    monthlyEarnings: "0",
  });
  const [appointments, setAppointments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [ratingData, setRatingData] = useState({
    average: 0,
    total: 0,
    stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  useEffect(() => {
    if (!doctorId) return;

    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const [apptRes, paymentRes, ratingRes] = await Promise.allSettled([
          customFetch.get(`/api/doctors/${doctorId}/appointments?limit=500`),
          customFetch.get(`/api/payment/doctor/summary?doctorId=${doctorId}`),
          customFetch.get(`/api/doctors/${doctorId}/rating-summary`),
        ]);

        const allAppointments =
          apptRes.status === "fulfilled" ? apptRes.value.data?.data || [] : [];

        const today = new Date().toISOString().slice(0, 10);
        const todaysAppts = allAppointments.filter(
          (a) => a.appointmentDate && a.appointmentDate.slice(0, 10) === today,
        );
        const pendingAppts = allAppointments.filter(
          (a) => a.status === "Pending",
        );
        const remainingToday = todaysAppts.filter(
          (a) => a.status === "Confirmed" || a.status === "Pending",
        );

        const monthlyTotal =
          paymentRes.status === "fulfilled"
            ? paymentRes.value.data?.data?.monthlyTotal || 0
            : 0;

        setStats({
          total: allAppointments.length,
          todayCount: todaysAppts.length,
          remainingToday: remainingToday.length,
          pendingCount: pendingAppts.length,
          monthlyEarnings: monthlyTotal.toLocaleString(),
        });

        if (ratingRes.status === "fulfilled" && ratingRes.value.data?.data) {
          setRatingData(ratingRes.value.data.data);
        }

        setAppointments(allAppointments);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [doctorId]);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleDownloadDailySummary = async () => {
    if (pdfGenerating) return;

    try {
      setPdfGenerating(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = 595.28;
      const margin = 36;

      doc.setFillColor(8, 77, 82);
      doc.rect(0, 0, pageWidth, 114, "F");

      try {
        const logo = await loadImageAsDataUrl("/Images/medilink-logo.png");
        doc.addImage(logo, "PNG", margin, 22, 52, 52);
      } catch (e) {
        console.warn("Failed to load logo for PDF:", e);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.text("MediLink Daily Practice Summary", margin + 62, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Doctor: Dr. ${safeText(doctorName)}`, margin + 62, 66);
      doc.text(
        `Generated: ${formatDateTime(new Date().toISOString())}`,
        margin + 62,
        84,
      );

      const metricY = 132;
      const cardGap = 10;
      const cardW = (pageWidth - margin * 2 - cardGap * 3) / 4;
      const metrics = [
        ["Total", String(stats.total)],
        ["Today", String(stats.todayCount)],
        ["Pending", String(stats.pendingCount)],
        [
          "Rating",
          ratingData.average > 0 ? `${ratingData.average} / 5` : "No ratings",
        ],
      ];

      metrics.forEach(([label, value], idx) => {
        const x = margin + idx * (cardW + cardGap);
        doc.setFillColor(244, 248, 250);
        doc.roundedRect(x, metricY, cardW, 72, 8, 8, "F");
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(label, x + 12, metricY + 22);
        doc.setTextColor(13, 28, 46);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.text(safeText(value), x + 12, metricY + 48);
      });

      const todayKey = new Date().toISOString().slice(0, 10);
      const todaysAppointments = appointments
        .filter(
          (a) =>
            a.appointmentDate && a.appointmentDate.slice(0, 10) === todayKey,
        )
        .sort(
          (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
        );

      doc.setTextColor(13, 28, 46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Today's Appointment Timeline", margin, 236);

      const top = 254;
      const rowH = 34;
      const maxRows = 12;

      doc.setFillColor(238, 245, 247);
      doc.roundedRect(margin, top, pageWidth - margin * 2, rowH, 6, 6, "F");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("Time", margin + 10, top + 21);
      doc.text("Patient", margin + 90, top + 21);
      doc.text("Type", margin + 280, top + 21);
      doc.text("Status", margin + 392, top + 21);
      doc.text("Notes", margin + 470, top + 21);

      if (todaysAppointments.length === 0) {
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(
          "No appointments scheduled for today.",
          margin + 10,
          top + rowH + 22,
        );
      } else {
        todaysAppointments.slice(0, maxRows).forEach((apt, idx) => {
          const y = top + rowH + idx * rowH;
          if (idx % 2 === 0) {
            doc.setFillColor(250, 252, 253);
            doc.rect(margin, y, pageWidth - margin * 2, rowH, "F");
          }

          const patient = safeText(apt.patientName, "Unknown");
          const status = safeText(apt.status, "-");
          const spec = safeText(apt.specialization, "General");
          const time = new Date(apt.appointmentDate).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          doc.setTextColor(30, 41, 59);
          doc.setFont("helvetica", "normal");
          doc.text(time, margin + 10, y + 21);
          doc.text(patient.slice(0, 27), margin + 90, y + 21);
          doc.text(spec.slice(0, 18), margin + 280, y + 21);
          doc.text(status, margin + 392, y + 21);
          doc.text(
            safeText(apt.symptoms, "-").slice(0, 20),
            margin + 470,
            y + 21,
          );
        });
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 794, pageWidth - margin, 794);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text("Generated by MediLink Cloud Doctor Dashboard", margin, 812);
      doc.text("Confidential Clinical Summary", pageWidth - margin - 140, 812);

      const dateId = new Date().toISOString().slice(0, 10);
      doc.save(`medilink-daily-summary-${dateId}.pdf`);
      toast.success("Daily summary PDF downloaded");
    } catch (err) {
      console.error("Failed to generate daily PDF summary:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex lg:flex-row flex-col gap-8 bg-[#F8FAFB] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-[#112429] dark:text-white tracking-tight font-manrope leading-tight mb-2 transition-colors">
              {getGreeting()},{" "}
              <span className="text-[#055153] dark:text-teal-400">
                Dr. {doctorName}
              </span>
            </h1>
            <p className="text-[#475569] dark:text-slate-400 font-medium font-inter text-[14px] md:text-[15px] transition-colors">
              {todayStr} — Here is what is happening with your practice today.
            </p>
            {profileError && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                {profileError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadDailySummary}
              disabled={pdfGenerating || loadingStats}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-bold text-[#055153] dark:text-teal-400 text-[13px] font-inter disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Download size={16} strokeWidth={2.5} />
              {pdfGenerating ? "Generating PDF..." : "Daily Summary (PDF)"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6">
          <StatCard
            title="Total Appointments"
            value={loadingStats ? "…" : String(stats.total)}
            badgeText={
              stats.todayCount > 0 ? `${stats.todayCount} today` : undefined
            }
            badgeColor="green"
            icon={Calendar}
          />
          <StatCard
            title="Today's Consultations"
            value={loadingStats ? "…" : String(stats.todayCount)}
            badgeText={
              stats.remainingToday > 0
                ? `${stats.remainingToday} remaining`
                : undefined
            }
            badgeColor="blue"
            icon={Briefcase}
          />
          <StatCard
            title="Pending Requests"
            value={loadingStats ? "…" : String(stats.pendingCount)}
            badgeText={stats.pendingCount > 0 ? "Needs Review" : undefined}
            badgeColor="red"
            icon={ClipboardList}
          />
          <StatCard
            title="Monthly Earnings (LKR)"
            value={loadingStats ? "…" : stats.monthlyEarnings}
            icon={Wallet}
            isHighlighted={true}
          />
          <StatCard
            title="Average Rating"
            value={
              loadingStats
                ? "…"
                : ratingData.average > 0
                  ? `${ratingData.average} ★`
                  : "No ratings"
            }
            badgeText={
              ratingData.total > 0 ? `${ratingData.total} reviews` : undefined
            }
            badgeColor="green"
            icon={Star}
          />
        </div>

        {/* Today's Schedule */}
        <div className="mt-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <ScheduleList appointments={appointments} doctorId={doctorId} />
        </div>
      </div>

      <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col gap-6">
        <ActivityFeed appointments={appointments} />
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <QuickShortcuts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
