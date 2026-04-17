import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  FileText,
  FlaskConical,
  Activity,
  HeartPulse,
  ShieldAlert,
  Loader2,
  Database,
  Download,
  Image as ImageIcon,
  FileSearch,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import customFetch from "../../utils/customFetch";

const PatientReportsViewerModal = ({ isOpen, onClose, appointment }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const LOCAL_PATIENT_FILE_HOST = "http://localhost:3001";

  const resolveReportUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/uploads/")) {
      return `${LOCAL_PATIENT_FILE_HOST}${trimmed}`;
    }
    if (trimmed.startsWith("uploads/")) {
      return `${LOCAL_PATIENT_FILE_HOST}/${trimmed}`;
    }
    return trimmed;
  };

  const getFileExtension = (url) => {
    if (!url) return "";
    try {
      const cleaned = url.split("?")[0].split("#")[0];
      const dot = cleaned.lastIndexOf(".");
      return dot >= 0 ? cleaned.slice(dot + 1).toLowerCase() : "";
    } catch {
      return "";
    }
  };

  const getFileKind = (url) => {
    const ext = getFileExtension(url);
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) {
      return "image";
    }
    if (ext === "pdf") {
      return "pdf";
    }
    return "other";
  };

  const getDownloadName = (report) => {
    const ext =
      getFileExtension(report.fileUrl) ||
      (report.reportType === "ECG" ? "pdf" : "file");
    const reportType = (report.reportType || "report")
      .toLowerCase()
      .replace(/\s+/g, "-");
    return `${reportType}-${report._id || "record"}.${ext}`;
  };

  const handleDownloadReport = async (report) => {
    try {
      const url = resolveReportUrl(report.fileUrl);
      if (!url) {
        toast.error("File URL is missing");
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = getDownloadName(report);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Report downloaded successfully");
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      toast.error("Could not download report file");
    }
  };

  useEffect(() => {
    if (!isOpen || !appointment) return;

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        // Safely extract the primitive ID whether it's populated or not
        const patientId =
          typeof appointment.patientId === "object"
            ? appointment.patientId._id
            : appointment.patientId;

        // As defined in patient-service/routes/reportRoutes.js AND mapped in vite.config.js proxy rules
        const { data } = await customFetch.get(
          `/api/patient/reports/patient/${patientId}`,
        );
        if (data.success || data.data) {
          const normalizedReports = (data.data || []).map((report) => ({
            ...report,
            resolvedUrl: resolveReportUrl(report.fileUrl),
          }));
          setReports(normalizedReports);
          setSelectedReport(normalizedReports[0] || null);
        }
      } catch (err) {
        console.error("Error fetching patient reports:", err);
        setError(
          err?.response?.data?.message ||
            "Unable to retrieve records. Service may be unavailable.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  // Icon mapping for Report Types based on Schema Enum
  const getIconForType = (type) => {
    switch (type) {
      case "Lab Test":
      case "Blood Test":
        return <FlaskConical size={20} />;
      case "ECG":
      case "Heart":
        return <HeartPulse size={20} />;
      case "X-Ray":
      case "MRI":
      case "CT Scan":
      case "Ultrasound":
        return <Activity size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const getBadgeColorsForType = (type) => {
    switch (type) {
      case "Lab Test":
      case "Blood Test":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "ECG":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "X-Ray":
      case "MRI":
      case "CT Scan":
      case "Ultrasound":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      default:
        return "bg-emerald-50 text-[#055153] border-emerald-100";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#0D1C2E]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#055153] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#0D1C2E] dark:text-white">
                Medical Records Vault
              </h2>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
                Patient:{" "}
                <span className="font-bold text-[#0D1C2E] dark:text-white">
                  {appointment.patientName || "Unknown Patient"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-white dark:bg-slate-900 p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#055153]">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="font-bold text-[15px]">
                Decrypting patient records...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 flex items-center justify-center rounded-full mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-[18px] font-bold text-[#0D1C2E] dark:text-white mb-2">
                Secure Connection Error
              </h3>
              <p className="text-slate-500 dark:text-slate-300 max-w-md mx-auto text-[14px]">
                {error}
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl bg-[#F8FAFB] dark:bg-slate-800/50">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-500 flex items-center justify-center rounded-2xl mb-5 shadow-sm border border-slate-100 dark:border-slate-700 rotate-3">
                <FileText size={36} />
              </div>
              <h3 className="text-[22px] font-bold text-[#0D1C2E] dark:text-white mb-2">
                No Records Available
              </h3>
              <p className="text-slate-500 dark:text-slate-300 max-w-md mx-auto text-[14px] font-medium leading-relaxed">
                The patient has not uploaded any blood work, imaging, or lab
                reports to their secure portal yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-2 space-y-4">
                {reports.map((report) => {
                  const reportColorClass = getBadgeColorsForType(
                    report.reportType,
                  );
                  const isSelected = selectedReport?._id === report._id;
                  return (
                    <div
                      key={report._id}
                      className={`flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 border rounded-[20px] p-5 transition-all group gap-4 cursor-pointer ${
                        isSelected
                          ? "border-[#055153] dark:border-teal-500 shadow-md"
                          : "border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      {/* Left Column: Details */}
                      <div className="flex items-start gap-4 md:gap-5 w-full md:w-auto overflow-hidden">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${reportColorClass}`}
                        >
                          {getIconForType(report.reportType)}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border ${reportColorClass}`}
                            >
                              {report.reportType || "Other"}
                            </span>
                            <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                              {format(
                                parseISO(report.createdAt),
                                "MMMM dd, yyyy",
                              )}
                            </span>
                          </div>
                          <h4 className="text-[16px] font-bold text-[#0D1C2E] dark:text-white truncate">
                            {report.description}
                          </h4>
                          <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                            File Size: {formatFileSize(report.fileSize)}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Actions */}
                      <div className="w-full md:w-auto shrink-0 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadReport(report);
                          }}
                          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#055153] text-white font-bold text-[14px] rounded-xl hover:bg-[#044143] transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3 w-full md:w-auto bg-slate-50 dark:bg-slate-800 hover:bg-[#055153] hover:text-white text-[#0D1C2E] dark:text-slate-100 font-bold text-[14px] rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-transparent cursor-pointer group-hover:shadow-sm"
                        >
                          <span>View</span>
                          <ExternalLink
                            size={16}
                            className="opacity-70 group-hover:opacity-100"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-3 bg-[#F8FAFB] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 min-h-[360px]">
                {!selectedReport ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-300">
                    <FileSearch size={40} className="mb-3 opacity-80" />
                    <p className="font-semibold">Select a report to preview</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="min-w-0">
                        <h3 className="text-[16px] font-bold text-[#0D1C2E] dark:text-white truncate">
                          {selectedReport.description}
                        </h3>
                        <p className="text-[12px] text-slate-500 dark:text-slate-300 font-semibold mt-0.5 uppercase tracking-wide">
                          {selectedReport.reportType || "Other"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            selectedReport.resolvedUrl ||
                              selectedReport.fileUrl,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-[13px] font-bold text-[#0D1C2E] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
                      >
                        Open in new tab
                      </button>
                    </div>

                    {getFileKind(
                      selectedReport.resolvedUrl || selectedReport.fileUrl,
                    ) === "image" && (
                      <div className="h-[60vh] max-h-[520px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-auto flex items-center justify-center p-2">
                        <img
                          src={
                            selectedReport.resolvedUrl || selectedReport.fileUrl
                          }
                          alt={selectedReport.description || "Patient report"}
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {getFileKind(
                      selectedReport.resolvedUrl || selectedReport.fileUrl,
                    ) === "pdf" && (
                      <iframe
                        title="Patient report PDF preview"
                        src={
                          selectedReport.resolvedUrl || selectedReport.fileUrl
                        }
                        className="h-[60vh] max-h-[520px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                      />
                    )}

                    {getFileKind(
                      selectedReport.resolvedUrl || selectedReport.fileUrl,
                    ) === "other" && (
                      <div className="h-[60vh] max-h-[520px] rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-300">
                        <ImageIcon size={40} className="mb-3 opacity-80" />
                        <p className="font-semibold mb-2">
                          Inline preview not available for this file type
                        </p>
                        <p className="text-[13px] mb-5">
                          Use Download or Open in new tab.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDownloadReport(selectedReport)}
                          className="px-4 py-2 rounded-lg bg-[#055153] text-white font-bold text-[13px] hover:bg-[#044143] transition-colors"
                        >
                          Download file
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-800/80 flex items-center justify-between text-slate-400 dark:text-slate-300 text-[12px] font-medium shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldAlert size={14} /> HIPAA Compliant Vault End-to-End
            Encryption
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-600 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-[14px]"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientReportsViewerModal;
