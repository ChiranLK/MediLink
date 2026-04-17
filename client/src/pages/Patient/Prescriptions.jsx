import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../patient/services/patientApi";
import toast from "react-hot-toast";
import {
  Pill,
  Calendar,
  User,
  Eye,
  Download,
  Info,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

// ── Info panels shown per prescription ─────────────────────────────────────
const AdminInstructionsPanel = ({ medicines }) => {
  const instructions = medicines
    ?.filter((m) => m.instructions)
    .map((m) => ({
      name: m.name,
      text: m.instructions,
    }));
  if (!instructions?.length) return null;
  return (
    <div className="bg-[#EBF5FF] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-5">
      <h4 className="flex items-center gap-2 font-bold text-[#1e293b] dark:text-blue-100 mb-4 text-sm">
        <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Info size={13} className="text-white" />
        </span>
        Administration Instructions
      </h4>
      <ul className="space-y-2.5">
        {instructions.map((inst, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-sm text-[#334155] dark:text-blue-100/80"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <span>
              {inst.name && (
                <span className="font-semibold text-[#1e293b] dark:text-blue-200">
                  {inst.name}:{" "}
                </span>
              )}
              <span
                dangerouslySetInnerHTML={{
                  __html: inst.text.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>",
                  ),
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AdverseEffectsPanel = ({ prescription }) => {
  const hasAdverse = prescription?.adverseEffects || prescription?.sideEffects;
  return (
    <div className="bg-[#FFF8EE] dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 rounded-2xl p-5">
      <h4 className="flex items-center gap-2 font-bold text-[#1e293b] dark:text-orange-100 mb-4 text-sm">
        <span className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={13} className="text-white" />
        </span>
        Adverse Effects
      </h4>
      <p className="text-sm text-[#334155] dark:text-orange-100/80 leading-relaxed mb-3">
        {hasAdverse ||
          "If you experience severe allergic reactions such as swelling of the lips, face, or difficulty breathing, discontinue use and seek immediate emergency medical care."}
      </p>
      <div className="bg-white/60 dark:bg-orange-900/30 rounded-xl px-4 py-2.5 border border-orange-100 dark:border-orange-800/30">
        <p className="text-xs text-gray-500 dark:text-orange-200/60 italic">
          &quot;Common side effects may include mild nausea or dizziness.&quot;
        </p>
      </div>
    </div>
  );
};

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const handleDownloadPDF = (prescription) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const img = new window.Image();
      img.src = "/favicon.png";

      img.onload = () => {
        // Add Header Logo & Title
        doc.addImage(img, "PNG", 14, 15, 16, 16);
        doc.setFontSize(22);
        doc.setTextColor(5, 81, 83); // #055153
        doc.text("MediLink", 34, 23);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("Patient Portal | Prescription", 34, 28);

        // Add divider line
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 196, 38);

        // Prescription Info
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text(`Dr. ${prescription.doctorName || "Unknown"}`, 14, 52);

        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        if (prescription.specialization) {
          doc.text(`Specialization: ${prescription.specialization}`, 14, 60);
        }

        doc.text(
          `Issued: ${format(new Date(prescription.date), "MMM dd, yyyy")}`,
          130,
          52,
        );
        if (prescription.expiryDate) {
          doc.text(
            `Expires: ${format(new Date(prescription.expiryDate), "MMM dd, yyyy")}`,
            130,
            60,
          );
        }

        // Medicines Section
        doc.setFillColor(248, 250, 251);
        doc.rect(14, 75, 182, 10, "F");
        doc.setFontSize(13);
        doc.setTextColor(5, 81, 83);
        doc.text("Prescribed Medicines", 18, 82);

        let yPos = 95;

        prescription.medicines?.forEach((med, idx) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setTextColor(30, 41, 59);
          doc.setFont(undefined, "bold");
          doc.text(
            `${idx + 1}. ${med.name} ${med.dosage ? `- ${med.dosage}` : ""}`,
            14,
            yPos,
          );

          yPos += 6;
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.setFont(undefined, "normal");

          const freqText = med.frequency ? `Frequency: ${med.frequency}` : "";
          let durText = med.duration ? `Duration: ${med.duration}` : "";
          if (med.duration && !isNaN(med.duration)) durText += " days";

          doc.text(
            `${freqText}${freqText && durText ? "   |   " : ""}${durText}`,
            20,
            yPos,
          );

          if (med.instructions) {
            yPos += 6;
            doc.setTextColor(15, 23, 42); // darker for emphasis
            doc.text(`Instructions: ${med.instructions}`, 20, yPos);
          }
          yPos += 12;
        });

        // Doctor's Notes Section
        if (prescription.notes) {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          } else {
            yPos += 10;
          }

          doc.setFillColor(239, 246, 255); // bg-blue-50
          doc.rect(14, yPos, 182, 40, "F");

          doc.setFontSize(12);
          doc.setTextColor(5, 81, 83);
          doc.setFont(undefined, "bold");
          doc.text("Doctor's Notes", 20, yPos + 10);

          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85);
          doc.setFont(undefined, "normal");
          const splitNotes = doc.splitTextToSize(prescription.notes, 170);
          doc.text(splitNotes, 20, yPos + 20);
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Generated securely from MediLink Platform", 70, 285);

        doc.save(
          `Prescription_${prescription.doctorName || "Doctor"}_${format(new Date(prescription.date), "yyyy-MM-dd")}.pdf`,
        );
        toast.success("PDF Downloaded successfully!");
      };

      img.onerror = () => {
        toast.error("Failed to load logo for PDF.");
      };
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [user?.userId]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, activeTab, searchTerm]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const patientId = user?.userId;
      if (patientId) {
        const response = await patientApi.getPrescriptions(patientId);
        const presc = response.data || response.prescriptions || [];
        setPrescriptions(Array.isArray(presc) ? presc : []);
      }
    } catch (error) {
      console.error("Failed to load prescriptions:", error);
      toast.error("Failed to load prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    // Filter by status (active/expired)
    if (activeTab === "active") {
      filtered = filtered.filter((p) => {
        if (!p.expiryDate) return true;
        return new Date(p.expiryDate) > new Date();
      });
    } else if (activeTab === "expired") {
      filtered = filtered.filter((p) => {
        if (!p.expiryDate) return false;
        return new Date(p.expiryDate) <= new Date();
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.medicines?.some((m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const getStatusColor = (expiryDate) => {
    if (!expiryDate)
      return "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50";
    const isExpired = new Date(expiryDate) <= new Date();
    return isExpired
      ? "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"
      : "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50";
  };

  const getStatusText = (expiryDate) => {
    if (!expiryDate) return "Active";
    const isExpired = new Date(expiryDate) <= new Date();
    return isExpired ? "Expired" : "Active";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-5 bg-[#F8FAFB] dark:bg-[#0f1523] min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-slate-100">
            My Prescriptions
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {prescriptions.length} prescription
            {prescriptions.length !== 1 ? "s" : ""} on record
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-slate-800">
        {[
          { id: "all", label: "All" },
          { id: "active", label: "Active" },
          { id: "expired", label: "Expired" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#055153] text-[#055153] dark:border-teal-400 dark:text-teal-400 bg-[#055153]/5 dark:bg-teal-400/10 rounded-t-lg"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-[#1e293b] dark:hover:text-slate-200 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-t-lg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by medicine name, doctor, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-[#151c2c] text-[#1e293b] dark:text-slate-200 focus:ring-2 focus:ring-[#055153]/50 focus:border-[#055153] dark:focus:ring-teal-500/30 dark:focus:border-teal-500 outline-none dark:placeholder:text-slate-500 shadow-sm transition-all"
        />
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-sm text-center">
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-full mb-3">
            <Pill size={36} className="text-gray-300 dark:text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-gray-700 dark:text-slate-300 mb-1">
            No prescriptions found
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-500 max-w-sm">
            {prescriptions.length === 0
              ? "Your prescriptions will appear here once your doctor issues them."
              : "No prescriptions match your search criteria. Try a different keyword."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-transparent dark:border-slate-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-300 p-4 md:p-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1e293b] dark:text-white">
                      {prescription.doctorName || "Dr. Unknown"}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} className="text-blue-500/70" />
                        <span>
                          Issued:{" "}
                          {format(new Date(prescription.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {prescription.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={11} className="text-orange-500/70" />
                          <span>
                            Expires:{" "}
                            {format(
                              new Date(prescription.expiryDate),
                              "MMM dd, yyyy",
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusColor(prescription.expiryDate)}`}
                >
                  {getStatusText(prescription.expiryDate)}
                </span>
              </div>

              {/* Medicines List */}
              <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-4 mb-4 border border-gray-100 dark:border-slate-800/60">
                <h4 className="text-sm font-bold text-[#1e293b] dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Pill
                    size={14}
                    className="text-blue-500 dark:text-teal-400"
                  />
                  Medicines
                </h4>
                <div className="space-y-2">
                  {prescription.medicines?.map((medicine, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900/80 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700/80"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1e293b] dark:text-teal-400">
                            {medicine.name}
                          </span>
                          {medicine.dosage && (
                            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/40">
                              {medicine.dosage}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-slate-400">
                        {medicine.frequency && (
                          <div>
                            <span className="font-bold uppercase tracking-wide text-[10px] text-gray-400 dark:text-slate-500 block">
                              Frequency
                            </span>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              {medicine.frequency}
                            </span>
                          </div>
                        )}
                        {medicine.duration && (
                          <div>
                            <span className="font-bold uppercase tracking-wide text-[10px] text-gray-400 dark:text-slate-500 block">
                              Duration
                            </span>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              {medicine.duration}
                            </span>
                          </div>
                        )}
                      </div>
                      {medicine.instructions && (
                        <div className="mt-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border-l-2 border-blue-300 dark:border-blue-700">
                          <p className="text-xs text-gray-600 dark:text-slate-300">
                            <span className="font-bold text-gray-400 dark:text-slate-500 uppercase mr-1.5">
                              Note:
                            </span>
                            {medicine.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Administration Instructions + Adverse Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <AdminInstructionsPanel medicines={prescription.medicines} />
                <AdverseEffectsPanel prescription={prescription} />
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 px-4 py-3 mb-3 rounded-r-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300 mb-1">
                    Notes from Doctor
                  </h4>
                  <p className="text-sm text-[#334155] dark:text-blue-50">
                    {prescription.notes}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => setSelectedPrescription(prescription)}
                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-xs transition"
                >
                  <Eye size={13} />
                  View Details
                </button>
                <button
                  onClick={() => handleDownloadPDF(prescription)}
                  className="flex items-center gap-1.5 text-[#055153] dark:text-teal-400 hover:text-[#044042] dark:hover:text-teal-300 font-semibold text-xs transition"
                >
                  <Download size={13} />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#055153] dark:text-teal-400">
                Prescription Details
              </h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Doctor Info */}
            <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 dark:from-slate-800 dark:to-slate-800/80 border border-transparent dark:border-slate-700 p-4 rounded-xl mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-blue-500 dark:text-teal-400">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1e293b] dark:text-white">
                    Dr. {selectedPrescription.doctorName}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    {selectedPrescription.specialization ||
                      "Medical Practitioner"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">
                    Issued Date
                  </p>
                  <p className="font-semibold text-[#1e293b] dark:text-slate-200 text-sm">
                    {format(
                      new Date(selectedPrescription.date),
                      "MMMM dd, yyyy",
                    )}
                  </p>
                </div>
                {selectedPrescription.expiryDate && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">
                      Expiry Date
                    </p>
                    <p className="font-semibold text-[#1e293b] dark:text-slate-200 text-sm">
                      {format(
                        new Date(selectedPrescription.expiryDate),
                        "MMMM dd, yyyy",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[#1e293b] dark:text-white mb-3 flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Pill size={14} />
                </div>
                Prescribed Medicines
              </h3>
              <div className="space-y-3">
                {selectedPrescription.medicines?.map((medicine, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">
                      <h4 className="font-bold text-sm text-[#1e293b] dark:text-teal-400">
                        {medicine.name}
                      </h4>
                      {medicine.dosage && (
                        <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/40">
                          {medicine.dosage}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-0.5 uppercase tracking-wide font-semibold">
                          Dosage
                        </p>
                        <p className="font-medium text-xs text-[#1e293b] dark:text-slate-200">
                          {medicine.dosage || "—"}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-0.5 uppercase tracking-wide font-semibold">
                          Frequency
                        </p>
                        <p className="font-medium text-xs text-[#1e293b] dark:text-slate-200">
                          {medicine.frequency || "—"}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mb-0.5 uppercase tracking-wide font-semibold">
                          Duration
                        </p>
                        <p className="font-medium text-xs text-[#1e293b] dark:text-slate-200">
                          {medicine.duration || "—"}
                        </p>
                      </div>
                    </div>
                    {medicine.instructions && (
                      <div className="mt-3 p-2.5 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200/90 font-medium">
                          <span className="font-bold mr-1">Instructions:</span>
                          {medicine.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Administration Instructions + Adverse Effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdminInstructionsPanel
                medicines={selectedPrescription.medicines}
              />
              <AdverseEffectsPanel prescription={selectedPrescription} />
            </div>

            {/* Additional Notes */}
            {selectedPrescription.notes && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-6 rounded-xl">
                <h3 className="font-bold text-[#1e293b] dark:text-blue-100 mb-2">
                  Doctor's Notes
                </h3>
                <p className="text-[#334155] dark:text-blue-50">
                  {selectedPrescription.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="w-full sm:flex-1 px-5 py-2.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedPrescription)}
                className="w-full sm:flex-1 px-5 py-2.5 text-sm bg-[#055153] dark:bg-teal-600 text-white rounded-xl hover:bg-[#044042] dark:hover:bg-teal-500 transition font-semibold flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
