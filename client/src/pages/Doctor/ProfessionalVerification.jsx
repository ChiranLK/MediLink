import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileCheck,
  Camera,
  Building2,
  Award,
  GraduationCap,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  XCircle,
} from "lucide-react";
import customFetch from "@/utils/customFetch";
import { useAuth } from "@/context/AuthContext";
import { useDoctorContext } from "@/context/DoctorContext";
import toast from "react-hot-toast";

export default function ProfessionalVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { doctorProfile, refreshDoctorProfile, isLoadingProfile } =
    useDoctorContext();

  const [formData, setFormData] = useState({
    hospital: "",
    experience: "",
    qualifications: "",
  });
  const [slmcFile, setSlmcFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [slmcPreview, setSlmcPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (doctorProfile) {
      const v = doctorProfile.verification;
      if (v && v.status) {
        setVerificationStatus(v.status);
      }
      // Pre-fill form if doctor has existing data
      if (doctorProfile.hospital)
        setFormData((p) => ({ ...p, hospital: doctorProfile.hospital }));
      if (doctorProfile.experience)
        setFormData((p) => ({
          ...p,
          experience: String(doctorProfile.experience),
        }));
      if (doctorProfile.qualifications)
        setFormData((p) => ({
          ...p,
          qualifications: doctorProfile.qualifications,
        }));
    }
  }, [doctorProfile]);

  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (type === "slmc") {
      setSlmcFile(file);
      if (file.type.startsWith("image/")) {
        setSlmcPreview(URL.createObjectURL(file));
      } else {
        setSlmcPreview(null);
      }
    } else {
      // Validate photo is image
      if (!file.type.startsWith("image/")) {
        toast.error("Profile photo must be an image file");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slmcFile || !photoFile) {
      toast.error("Please upload both SLMC certificate and profile photo");
      return;
    }
    if (
      !formData.hospital.trim() ||
      !formData.experience.trim() ||
      !formData.qualifications.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const doctorId = doctorProfile?._id || doctorProfile?.doctorId;
    if (!doctorId) {
      toast.error("Doctor profile not found. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("slmcCertificate", slmcFile);
      fd.append("profilePhoto", photoFile);
      fd.append("hospital", formData.hospital.trim());
      fd.append("experience", formData.experience.trim());
      fd.append("qualifications", formData.qualifications.trim());

      await customFetch.post(`/api/doctors/${doctorId}/verification`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        "Verification submitted! An admin will review your application.",
      );
      setVerificationStatus("pending");
      refreshDoctorProfile();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to submit verification";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (type) => {
    if (type === "slmc") {
      setSlmcFile(null);
      setSlmcPreview(null);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  // If loading
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  // Already verified
  if (doctorProfile?.isVerified) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            You&apos;re Verified!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your professional credentials have been verified. You have full
            access to the platform.
          </p>
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pending review
  if (verificationStatus === "pending") {
    return (
      <div className="max-w-xl mx-auto p-6 mt-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <Clock className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Verification Under Review
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your documents have been submitted and are awaiting admin review.
            You&apos;ll be notified once the review is complete.
          </p>
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Rejected — show reason and let resubmit
  const isRejected = verificationStatus === "rejected";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 mt-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-6">
          <h1 className="text-xl font-bold text-white">
            Professional Verification
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            Submit your credentials to get verified and start practicing on
            MediLink
          </p>
        </div>

        {/* Rejection Notice */}
        {isRejected && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
            <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Your previous submission was rejected
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {doctorProfile?.verification?.rejectionReason ||
                  "Please review your documents and resubmit."}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step Indicators */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {[
              { icon: Camera, label: "Photo" },
              { icon: FileCheck, label: "Certificate" },
              { icon: Building2, label: "Details" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <step.icon size={15} className="text-teal-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              A clear, professional headshot. This will be displayed to patients
              across the platform.
            </p>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-teal-200 dark:ring-teal-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("photo")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition">
                  <Camera size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "photo")}
                  />
                </label>
              )}
              <div className="text-xs text-slate-400">
                <p>JPG, PNG or WebP</p>
                <p>Max 10MB, min 200×200px</p>
              </div>
            </div>
          </div>

          {/* SLMC Certificate Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              SLMC Registration Certificate{" "}
              <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Upload a scanned copy or clear photo of your Sri Lanka Medical
              Council registration certificate.
            </p>
            {slmcFile ? (
              <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl">
                <FileCheck size={20} className="text-teal-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {slmcFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(slmcFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile("slmc")}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition">
                <Upload size={24} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-500">
                  Click to upload certificate
                </span>
                <span className="text-xs text-slate-400">
                  PDF, JPG, PNG — Max 10MB
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "slmc")}
                />
              </label>
            )}
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              <Building2 size={14} className="inline mr-1.5 text-teal-600" />
              Hospital / Clinic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hospital}
              onChange={(e) =>
                setFormData((p) => ({ ...p, hospital: e.target.value }))
              }
              placeholder="e.g., National Hospital of Sri Lanka"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-white transition"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              <Award size={14} className="inline mr-1.5 text-teal-600" />
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={formData.experience}
              onChange={(e) =>
                setFormData((p) => ({ ...p, experience: e.target.value }))
              }
              placeholder="e.g., 5"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-white transition"
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              <GraduationCap
                size={14}
                className="inline mr-1.5 text-teal-600"
              />
              Qualifications <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.qualifications}
              onChange={(e) =>
                setFormData((p) => ({ ...p, qualifications: e.target.value }))
              }
              placeholder="e.g., MBBS (University of Colombo), MD - Cardiology, MRCP (UK)"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-white transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading & Submitting...
              </>
            ) : (
              <>
                <Upload size={16} />
                Submit for Verification
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            Your documents will be reviewed by our admin team. This usually
            takes 24–48 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
