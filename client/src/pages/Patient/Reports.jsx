import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../patient/services/patientApi";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  Eye,
  X,
  Stethoscope,
  Search,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

const REPORT_TYPES = [
  "Blood Test",
  "X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
  "ECG",
  "Lab Test",
  "Other",
];

const TYPE_COLORS = {
  "Blood Test": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "X-Ray":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "CT Scan": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  MRI: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Ultrasound:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  ECG: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Lab Test":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Other: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
};

/* ────────────────────────────────────────────────────
   Searchable Doctor Picker
   ──────────────────────────────────────────────────── */
const DoctorPicker = ({ doctors, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selected = doctors.find((d) => d.id === value);

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || "").toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-left hover:border-teal-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
      >
        {selected ? (
          <span className="text-slate-800 dark:text-slate-100 font-medium">
            Dr. {selected.name}
            {selected.specialty && (
              <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({selected.specialty})
              </span>
            )}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            — Select a doctor —
          </span>
        )}
        <ChevronDown size={16} className="text-slate-400 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-72 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="flex-1 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 bg-transparent"
            />
          </div>

          {/* List */}
          <ul className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No doctors found
              </li>
            ) : (
              filtered.map((d) => (
                <li
                  key={d.id}
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 transition flex items-center gap-3 ${
                    d.id === value ? "bg-teal-50 dark:bg-teal-900/30" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xs shrink-0">
                    {d.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      Dr. {d.name}
                    </p>
                    {d.specialty && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {d.specialty}
                      </p>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────────────── */
const PatientReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [patientMongoId, setPatientMongoId] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);

  const [uploadForm, setUploadForm] = useState({
    description: "",
    reportType: "Other",
    doctorId: "",
    doctorName: "",
  });

  const authUserId = user?.userId || user?.id || user?._id;

  /* ── Resolve patient Mongo id ── */
  useEffect(() => {
    if (!authUserId) return;
    (async () => {
      try {
        const res = await patientApi.getPatientProfile(authUserId);
        const mongoId = res?.data?._id || res?._id;
        setPatientMongoId(mongoId ? String(mongoId) : authUserId);
      } catch (err) {
        setPatientMongoId(authUserId);
      }
    })();
  }, [authUserId]);

  const patientKey = patientMongoId || authUserId;

  /* ── Load reports ── */
  useEffect(() => {
    loadReports();
  }, [patientKey]);

  const loadReports = async () => {
    try {
      setLoading(true);
      if (patientKey) {
        const response = await patientApi.getPatientReports(patientKey);
        setReports(response.data || response.reports || []);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  /* ── Load ALL doctors from database ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await patientApi.getDoctors();
        const list = res.data || res.doctors || [];
        setAllDoctors(
          list.map((d) => ({
            id: d.doctorId || d._id,
            name: d.name,
            specialty: d.specialization || d.specialty || "",
          })),
        );
      } catch (e) {
        console.error("Failed to load doctors:", e);
      }
    })();
  }, []);

  /* ── File selection ── */
  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  /* ── Doctor selection ── */
  const handleDoctorSelect = (doc) => {
    setUploadForm((prev) => ({
      ...prev,
      doctorId: doc.id,
      doctorName: doc.name,
    }));
  };

  /* ── Upload ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }
    if (!uploadForm.description.trim()) {
      toast.error("Please add a description");
      return;
    }
    if (!uploadForm.doctorId) {
      toast.error("Please select a doctor");
      return;
    }

    try {
      setUploading(true);

      let uploadedFiles = [];
      if (selectedFiles.length === 1) {
        const fd = new FormData();
        fd.append("file", selectedFiles[0]);
        const body = await patientApi.uploadReport(fd);
        uploadedFiles = [body.data || body];
      } else {
        const fd = new FormData();
        selectedFiles.forEach((f) => fd.append("files", f));
        const body = await patientApi.uploadMultipleReports(fd);
        uploadedFiles = Array.isArray(body.data) ? body.data : [];
      }

      for (const file of uploadedFiles) {
        await patientApi.createReport({
          patientId: patientKey || undefined,
          doctorId: uploadForm.doctorId,
          doctorName: uploadForm.doctorName,
          fileUrl: file.fileUrl,
          description: uploadForm.description,
          reportType: uploadForm.reportType,
          fileSize: file.fileSize || 0,
        });
      }

      toast.success("Report uploaded successfully!");
      closeModal();
      await loadReports();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadForm({
      description: "",
      reportType: "Other",
      doctorId: "",
      doctorName: "",
    });
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await patientApi.deleteReport(reportId);
      toast.success("Report deleted");
      await loadReports();
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  /* ── Loading spinner ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-slate-100">
          Medical Reports
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition font-semibold shadow-sm"
        >
          <Upload size={18} />
          Upload Report
        </button>
      </div>

      {/* ── Empty state ── */}
      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <FileText
            size={48}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
          />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
            No reports uploaded yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Upload your medical reports and send them to a specific doctor.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition font-semibold"
          >
            <Plus size={18} />
            Upload Your First Report
          </button>
        </div>
      ) : (
        /* ── Reports Grid ── */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-white flex items-start justify-between">
                <FileText size={28} />
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[report.reportType] || TYPE_COLORS["Other"]}`}
                >
                  {report.reportType}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2 text-sm">
                  {report.description || "Medical Report"}
                </h3>

                {report.doctorName && (
                  <div className="flex items-center gap-1.5 mt-1 mb-2">
                    <Stethoscope
                      size={13}
                      className="text-teal-600 dark:text-teal-400"
                    />
                    <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      To: Dr. {report.doctorName}
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {format(new Date(report.createdAt), "MMM dd, yyyy • hh:mm a")}
                </p>
                {report.fileSize > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                    Size: {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setPreviewFile(report)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-semibold"
                  >
                    <Eye size={14} /> View
                  </button>
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition text-xs font-semibold"
                  >
                    <Download size={14} /> Download
                  </a>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">
              Upload Medical Report
            </h2>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Files *
                </label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-teal-400 dark:hover:border-teal-500 transition cursor-pointer"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <Upload
                    size={36}
                    className="mx-auto text-slate-400 dark:text-slate-500 mb-2"
                  />
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                      >
                        <FileText
                          size={14}
                          className="text-teal-500 shrink-0"
                        />
                        <span className="flex-1 text-slate-700 dark:text-slate-300 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor picker */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Send to Doctor *
                </label>
                {allDoctors.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    Loading doctors…
                  </p>
                ) : (
                  <DoctorPicker
                    doctors={allDoctors}
                    value={uploadForm.doctorId}
                    onChange={handleDoctorSelect}
                  />
                )}
              </div>

              {/* Report type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Report Type
                </label>
                <select
                  value={uploadForm.reportType}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      reportType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter description or additional notes..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    uploading ||
                    selectedFiles.length === 0 ||
                    !uploadForm.doctorId
                  }
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {previewFile.description}
            </h2>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
              <iframe
                src={previewFile.fileUrl}
                className="w-full h-96 rounded-lg"
                title="Report Preview"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <a
                href={previewFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold text-sm"
              >
                <Download size={16} /> Download
              </a>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReports;
