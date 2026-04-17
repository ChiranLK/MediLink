import React, { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Clock,
  Building2,
  Award,
  GraduationCap,
  ExternalLink,
  User,
  BadgeCheck,
} from "lucide-react";
import customFetch from "../../utils/customFetch";
import toast from "react-hot-toast";

const AdminVerifications = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await customFetch.get("/api/doctors");
      const list = data.data || data.doctors || [];
      setAllDoctors(list);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = allDoctors.filter((d) => {
      const vs = d.verification?.status || "not_submitted";
      if (tabFilter === "pending") return vs === "pending";
      if (tabFilter === "approved") return vs === "approved";
      if (tabFilter === "rejected") return vs === "rejected";
      return true;
    });

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q),
      );
    }

    setDoctors(filtered);
  }, [allDoctors, tabFilter, search]);

  const pendingCount = allDoctors.filter(
    (d) => d.verification?.status === "pending",
  ).length;
  const approvedCount = allDoctors.filter(
    (d) => d.verification?.status === "approved",
  ).length;
  const rejectedCount = allDoctors.filter(
    (d) => d.verification?.status === "rejected",
  ).length;

  const handleApprove = async (doctor) => {
    if (
      !window.confirm(
        `Approve Dr. ${doctor.name}? This will verify them and make their profile active.`,
      )
    )
      return;
    setActionLoading(doctor._id);
    try {
      await customFetch.patch(
        `/api/doctors/${doctor._id}/verification/approve`,
      );
      toast.success(`Dr. ${doctor.name} has been verified!`);
      fetchDoctors();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to approve verification",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    const doctor = showRejectModal;
    setActionLoading(doctor._id);
    try {
      await customFetch.patch(
        `/api/doctors/${doctor._id}/verification/reject`,
        { reason: rejectReason },
      );
      toast.success(`Verification rejected for Dr. ${doctor.name}`);
      setShowRejectModal(null);
      setRejectReason("");
      fetchDoctors();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to reject verification",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const tabClass = (tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition ${
      tabFilter === tab
        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#112429] dark:text-slate-100 font-manrope">
            Doctor Verifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and approve doctor professional credentials
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTabFilter("pending")}
          className={tabClass("pending")}
        >
          <Clock size={14} className="inline mr-1.5" />
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setTabFilter("approved")}
          className={tabClass("approved")}
        >
          <CheckCircle size={14} className="inline mr-1.5" />
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setTabFilter("rejected")}
          className={tabClass("rejected")}
        >
          <XCircle size={14} className="inline mr-1.5" />
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full mx-4 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Doctor Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-teal-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-teal-200 dark:ring-teal-800">
                {selectedDoctor.verification?.profilePhotoUrl ||
                (selectedDoctor.profileImage &&
                  !selectedDoctor.profileImage.includes("default-avatar")) ? (
                  <img
                    src={
                      selectedDoctor.verification?.profilePhotoUrl ||
                      selectedDoctor.profileImage
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-teal-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#112429] dark:text-slate-100">
                  Dr. {selectedDoctor.name}
                </h3>
                <p className="text-sm text-teal-600 font-medium">
                  {selectedDoctor.specialization || "General Practice"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDoctor.email}
                </p>
              </div>
            </div>

            {/* Submitted Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 size={13} className="text-teal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Hospital
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedDoctor.hospital || "—"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <Award size={13} className="text-teal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Experience
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedDoctor.experience || 0} years
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap size={13} className="text-teal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Qualifications
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedDoctor.qualifications || "—"}
                </p>
              </div>
            </div>

            {/* SLMC Certificate */}
            {selectedDoctor.verification?.slmcCertificateUrl && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-teal-600" />
                  SLMC Registration Certificate
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {selectedDoctor.verification.slmcCertificateUrl.includes(
                    ".pdf",
                  ) ? (
                    <a
                      href={selectedDoctor.verification.slmcCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <FileText size={20} className="text-red-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        View PDF Certificate
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-slate-400 ml-auto"
                      />
                    </a>
                  ) : (
                    <a
                      href={selectedDoctor.verification.slmcCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={selectedDoctor.verification.slmcCertificateUrl}
                        alt="SLMC Certificate"
                        className="w-full max-h-80 object-contain bg-slate-50 dark:bg-slate-800"
                      />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Submission date */}
            {selectedDoctor.verification?.submittedAt && (
              <p className="text-xs text-slate-400 mb-4">
                Submitted:{" "}
                {new Date(
                  selectedDoctor.verification.submittedAt,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedDoctor.verification?.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedDoctor);
                      setSelectedDoctor(null);
                    }}
                    disabled={actionLoading === selectedDoctor._id}
                    className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(selectedDoctor);
                      setSelectedDoctor(null);
                    }}
                    disabled={actionLoading === selectedDoctor._id}
                    className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowRejectModal(null);
            setRejectReason("");
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full mx-4 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Reject Verification
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejecting Dr. {showRejectModal.name}
              &apos;s verification. This will be visible to the doctor.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Certificate is not legible, please reupload a clearer scan..."
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white transition resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading === showRejectModal._id}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {actionLoading === showRejectModal._id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className="animate-spin text-teal-600 dark:text-teal-400"
            size={30}
          />
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <div className="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            {tabFilter === "pending" ? (
              <Clock size={24} className="text-slate-400" />
            ) : tabFilter === "approved" ? (
              <BadgeCheck size={24} className="text-slate-400" />
            ) : (
              <XCircle size={24} className="text-slate-400" />
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No {tabFilter} verifications found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <div
              key={d._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Color bar */}
              <div
                className={`h-1 ${
                  d.verification?.status === "pending"
                    ? "bg-amber-400"
                    : d.verification?.status === "approved"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                }`}
              />

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {d.verification?.profilePhotoUrl ||
                    (d.profileImage &&
                      !d.profileImage.includes("default-avatar")) ? (
                      <img
                        src={d.verification?.profilePhotoUrl || d.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-teal-600">
                        {(d.name || "D").charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Dr. {d.name}
                    </h3>
                    <p className="text-xs text-teal-600 font-medium">
                      {d.specialization || "—"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      d.verification?.status === "pending"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : d.verification?.status === "approved"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {d.verification?.status || "—"}
                  </span>
                </div>

                {/* Quick info */}
                <div className="space-y-1.5 mb-4">
                  {d.hospital && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 size={12} className="text-slate-400" />
                      {d.hospital}
                    </div>
                  )}
                  {d.experience > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Award size={12} className="text-slate-400" />
                      {d.experience} years experience
                    </div>
                  )}
                  {d.qualifications && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <GraduationCap size={12} className="text-slate-400" />
                      <span className="truncate">{d.qualifications}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoctor(d)}
                    className="flex-1 py-2 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} />
                    Review
                  </button>
                  {d.verification?.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(d)}
                        disabled={actionLoading === d._id}
                        className="py-2 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 transition"
                        title="Approve"
                      >
                        {actionLoading === d._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(d)}
                        disabled={actionLoading === d._id}
                        className="py-2 px-3 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition"
                        title="Reject"
                      >
                        <XCircle size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
