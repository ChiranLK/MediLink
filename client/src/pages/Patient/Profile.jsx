import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../patient/services/patientApi";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Shield,
  Droplets,
  Calendar,
  FileText,
  ClipboardList,
  Camera,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* helper */
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const PatientProfile = () => {
  const { user, updateAvatar } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    bloodGroup: "",
    medicalHistory: "",
  });

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;
      if (!uid) return;
      const response = await patientApi.getPatientProfile(uid);
      if (response.data) {
        setProfile(response.data);
        setFormData(response.data);
        if (response.data.profilePhoto)
          updateAvatar(response.data.profilePhoto);
      } else {
        setProfile(null);
        setFormData((prev) => ({
          ...prev,
          name: user?.name || user?.fullName || "",
        }));
      }
    } catch {
      setProfile(null);
      setFormData((prev) => ({
        ...prev,
        name: user?.name || user?.fullName || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (
        !formData.name ||
        !formData.age ||
        !formData.gender ||
        !formData.phone ||
        !formData.address
      ) {
        toast.error("Please fill all required fields");
        return;
      }
      const uid = user?.userId || user?.id;
      let response;
      if (profile) {
        response = await patientApi.updatePatientProfile(uid, formData);
      } else {
        response = await patientApi.createPatientProfile({
          userId: uid,
          ...formData,
        });
      }
      const saved = response?.data || response;
      setProfile(saved);
      setFormData(saved);
      setIsEditing(false);
      toast.success(
        profile
          ? "Profile updated successfully!"
          : "Profile created successfully!",
      );

      // Fire notification (fire-and-forget)
      if (user?.email && saved.phone && saved.name) {
        patientApi
          .sendNotification({
            email: user.email,
            phone: saved.phone,
            name: saved.name,
            type: "PROFILE_UPDATED",
            recipientId: uid,
            recipientRole: "patient",
          })
          .catch(() => {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    try {
      setUploadingPhoto(true);
      const uid = user?.userId || user?.id;
      const fd = new FormData();
      fd.append("photo", file);
      const response = await patientApi.uploadProfilePhoto(uid, fd);
      const photoUrl = response?.data?.profilePhoto;
      if (photoUrl) {
        setProfile((prev) => ({ ...prev, profilePhoto: photoUrl }));
        updateAvatar(photoUrl);
        toast.success("Profile photo updated!");
      }
    } catch {
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setRemovingPhoto(true);
      const uid = user?.userId || user?.id;
      await patientApi.removeProfilePhoto(uid);
      setProfile((prev) => ({
        ...prev,
        profilePhoto: undefined,
        profilePhotoPublicId: undefined,
      }));
      updateAvatar(null);
      toast.success("Profile photo removed!");
    } catch {
      toast.error("Failed to remove photo.");
    } finally {
      setRemovingPhoto(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setRequestingDelete(true);
      const uid = user?.userId || user?.id;
      await patientApi.requestProfileDeletion(uid);
      setProfile((prev) => ({
        ...prev,
        deletionRequested: true,
        deletionRequestedAt: new Date().toISOString(),
      }));
      setShowDeleteConfirm(false);
      toast.success(
        "Deletion request submitted. An admin will review it shortly.",
      );
    } catch {
      toast.error("Failed to submit deletion request. Please try again.");
    } finally {
      setRequestingDelete(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) setFormData(profile);
    else
      setFormData({
        name: user?.name || "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        bloodGroup: "",
        medicalHistory: "",
      });
  };

  const displayName =
    formData.name || user?.name || user?.fullName || "Patient";
  const patientId = user?.userId || user?.id || "";
  const initials = getInitials(displayName);
  const photoSrc = profile?.profilePhoto || user?.avatar || null;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-48" />
          <div className="bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="h-36 sm:h-44 bg-gray-200 dark:bg-slate-700" />
            <div className="p-4 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[#F8FAFB] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#112429] dark:text-white">
            My Profile
          </h1>
          <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
            Manage your personal and medical information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#055153] hover:bg-[#044143] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-900/10"
          >
            <Edit2 size={15} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Deletion Pending Banner */}
      {profile?.deletionRequested && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 rounded-2xl px-4 py-3 text-sm">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Account deletion requested.</strong> An administrator will
            review and process your request soon.
          </span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Profile Banner */}
        <div className="relative bg-gradient-to-br from-[#055153] to-[#0E8A7F] px-5 sm:px-8 py-8 sm:py-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 relative z-10">
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center shadow-xl overflow-hidden">
                {uploadingPhoto ? (
                  <Loader2 size={28} className="text-white animate-spin" />
                ) : photoSrc ? (
                  <img
                    src={photoSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-white">
                    {initials}
                  </span>
                )}
              </div>
              <label
                htmlFor="profile-photo-input"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-[#055153] hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
                title="Change profile photo"
              >
                <Camera
                  size={14}
                  className="text-[#055153] dark:text-teal-400"
                />
              </label>
              {photoSrc && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={removingPhoto}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-slate-800 transition-colors disabled:opacity-50"
                  title="Remove profile photo"
                >
                  {removingPhoto ? (
                    <Loader2 size={12} className="text-white animate-spin" />
                  ) : (
                    <X size={12} className="text-white" />
                  )}
                </button>
              )}
              <input
                id="profile-photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Name & badges */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 truncate">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Shield size={11} className="text-white/80" />
                  <span className="text-xs font-semibold text-white/90">
                    ID: {patientId.slice(0, 8)}...
                  </span>
                </div>
                {formData.bloodGroup && (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Droplets size={11} className="text-red-300" />
                    <span className="text-xs font-semibold text-white/90">
                      {formData.bloodGroup}
                    </span>
                  </div>
                )}
                {profile?.deletionRequested && (
                  <div className="flex items-center gap-1.5 bg-amber-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <AlertTriangle size={11} className="text-amber-200" />
                    <span className="text-xs font-semibold text-amber-200">
                      Deletion Pending
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8">
          {isEditing ? (
            <EditForm
              formData={formData}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
              deletionRequested={profile?.deletionRequested}
              setShowDeleteConfirm={setShowDeleteConfirm}
            />
          ) : (
            <ViewMode formData={formData} user={user} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1e293b] dark:text-slate-100">
                  Request Account Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action requires admin approval
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Your account deletion request will be sent to an administrator for
              final review. Your data will remain until the admin approves the
              request. You can cancel this request by contacting support.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 border-2 border-gray-200 dark:border-slate-700 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={requestingDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                {requestingDelete ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                {requestingDelete ? "Submitting..." : "Request Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* View Mode */
const ViewMode = ({ formData, user }) => {
  const displayName = formData.name || user?.name || user?.fullName || "";
  const fields = [
    { icon: User, label: "Full Name", value: displayName },
    {
      icon: Calendar,
      label: "Age",
      value: formData.age ? `${formData.age} years` : null,
    },
    { icon: User, label: "Gender", value: formData.gender },
    { icon: Droplets, label: "Blood Group", value: formData.bloodGroup },
    { icon: Phone, label: "Phone", value: formData.phone },
    { icon: MapPin, label: "Address", value: formData.address },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-[#055153]/20 dark:hover:border-teal-400/20 hover:bg-[#F2FDFE] dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EEF5F9] dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#055153]/10 dark:group-hover:bg-teal-900/30 transition-colors">
              <Icon size={16} className="text-[#055153] dark:text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5 text-slate-400 dark:text-slate-500">
                {label}
              </p>
              <p
                className={`text-sm font-semibold truncate ${value ? "text-[#1e293b] dark:text-slate-100" : "text-slate-300 dark:text-slate-600"}`}
              >
                {value || "Not specified"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[#F8FAFC] dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-[#055153]/10 flex items-center justify-center">
            <ClipboardList
              size={15}
              className="text-[#055153] dark:text-teal-400"
            />
          </div>
          <h3 className="font-bold text-sm text-[#1e293b] dark:text-slate-100">
            Medical History
          </h3>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {formData.medicalHistory ? (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {formData.medicalHistory}
            </p>
          ) : (
            <div className="flex items-center gap-3 py-3">
              <FileText
                size={18}
                className="text-gray-300 dark:text-slate-600 flex-shrink-0"
              />
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No medical history recorded. Click "Edit Profile" to add your
                medical history, allergies, or chronic conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Edit Form */
const EditForm = ({
  formData,
  onChange,
  onSave,
  onCancel,
  saving,
  deletionRequested,
  setShowDeleteConfirm,
}) => {
  const inputClass =
    "w-full px-4 py-3 bg-[#F8FAFC] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[#1e293b] dark:text-slate-100 font-medium focus:ring-2 focus:ring-[#055153] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm";
  const labelClass =
    "block text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-1.5 text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Personal Info */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#055153] rounded-full" />
          <h3 className="font-bold text-sm text-[#1e293b] dark:text-slate-100">
            Personal Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={onChange}
              placeholder="e.g. 25"
              min="1"
              max="150"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              className={inputClass}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={onChange}
              className={inputClass}
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#0E8A7F] rounded-full" />
          <h3 className="font-bold text-sm text-[#1e293b] dark:text-slate-100">
            Contact Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="e.g. 0771234567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder="Enter your address"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="font-bold text-sm text-[#1e293b] dark:text-slate-100">
            Medical History
          </h3>
        </div>
        <textarea
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={onChange}
          rows="4"
          placeholder="Enter any relevant medical history, allergies, chronic conditions, or current medications..."
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs mt-2 flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <Shield size={11} className="flex-shrink-0" />
          This information is encrypted and only shared with your healthcare
          providers.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
        {/* Danger */}
        {!deletionRequested ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 dark:border-red-800/40 rounded-xl font-semibold text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 size={15} />
            Request Account Deletion
          </button>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <AlertTriangle size={15} />
            Deletion request pending admin review
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-slate-700 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          >
            <X size={15} />
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#055153] hover:bg-[#044143] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
