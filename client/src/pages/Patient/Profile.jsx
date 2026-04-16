import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  MapPin,
  Heart,
  Edit2,
  Save,
  X,
  Shield,
  Droplets,
  Calendar,
  FileText,
  ClipboardList,
} from 'lucide-react';

const PatientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    bloodGroup: '',
    medicalHistory: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;
      if (uid) {
        const response = await patientApi.getPatientProfile(uid);
        if (response.data) {
          setProfile(response.data);
          setFormData(response.data);
        } else {
          setProfile(null);
          setFormData({
            name: user.name || user.fullName || '',
            age: '',
            gender: '',
            phone: '',
            address: '',
            bloodGroup: '',
            medicalHistory: '',
          });
        }
      }
    } catch (error) {
      console.log('Profile not found, initialize new');
      setProfile(null);
      setFormData(prev => ({
        ...prev,
        name: user?.name || user?.fullName || '',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!formData.name || !formData.age || !formData.gender || !formData.phone || !formData.address) {
        toast.error('Please fill all required fields');
        return;
      }

      let response;
      if (profile) {
        const uid = user?.userId || user?.id;
        response = await patientApi.updatePatientProfile(uid, formData);
      } else {
        const uid = user?.userId || user?.id;
        response = await patientApi.createPatientProfile({ userId: uid, ...formData });
      }

      if (response.success || response.data) {
        setProfile(response.data);
        setIsEditing(false);
        toast.success(profile ? 'Profile updated successfully' : 'Profile created successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = formData.name || user?.name || user?.fullName || 'Patient';
  const patientId = (user?.userId || user?.id) || '';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48" />
          <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100">
            <div className="h-40 bg-gray-200" />
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#112429' }}>
            My Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Manage your personal and medical information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#055153] hover:bg-[#044143] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-900/10"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">

        {/* Profile Header Banner */}
        <div className="relative bg-gradient-to-r from-[#055153] to-[#0E8A7F] px-8 py-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center shadow-xl">
              <span className="text-2xl font-extrabold text-white">{initials}</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1">{displayName}</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Shield size={12} className="text-white/80" />
                  <span className="text-xs font-semibold text-white/90">
                    Patient ID: {patientId.slice(0, 8)}...
                  </span>
                </div>
                {formData.bloodGroup && (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Droplets size={12} className="text-red-300" />
                    <span className="text-xs font-semibold text-white/90">{formData.bloodGroup}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {isEditing ? (
            <EditForm
              formData={formData}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={() => { setIsEditing(false); setFormData(profile || { name: user?.name || '' }); }}
              saving={saving}
            />
          ) : (
            <ViewMode formData={formData} user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── View Mode ─────────────────────────────────────────────────── */
const ViewMode = ({ formData, user }) => {
  const displayName = formData.name || user?.name || user?.fullName || '';

  const fields = [
    { icon: User, label: 'Full Name', value: displayName },
    { icon: Calendar, label: 'Age', value: formData.age ? `${formData.age} years` : null },
    { icon: User, label: 'Gender', value: formData.gender },
    { icon: Droplets, label: 'Blood Group', value: formData.bloodGroup },
    { icon: Phone, label: 'Phone', value: formData.phone },
    { icon: MapPin, label: 'Address', value: formData.address },
  ];

  return (
    <div className="space-y-8">
      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[#055153]/20 hover:bg-[#F2FDFE] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF5F9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#055153]/10 transition-colors">
              <Icon size={18} className="text-[#055153]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#94a3b8' }}>
                {label}
              </p>
              <p className="text-[15px] font-semibold truncate" style={{ color: value ? '#1e293b' : '#cbd5e1' }}>
                {value || 'Not specified'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Medical History Section */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-[#F8FAFC] border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[#055153]/10 flex items-center justify-center">
            <ClipboardList size={16} className="text-[#055153]" />
          </div>
          <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>Medical History</h3>
        </div>
        <div className="px-6 py-5">
          {formData.medicalHistory ? (
            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{formData.medicalHistory}</p>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <FileText size={20} className="text-gray-300" />
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                No medical history recorded. Click "Edit Profile" to add your medical history, allergies, or chronic conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Form ─────────────────────────────────────────────────── */
const EditForm = ({ formData, onChange, onSave, onCancel, saving }) => {
  const inputClass =
    'w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-[#1e293b] font-medium focus:ring-2 focus:ring-[#055153] focus:border-transparent outline-none transition-all placeholder:text-gray-400';
  const labelClass = 'block text-[11px] font-bold tracking-widest uppercase mb-2';

  return (
    <div className="space-y-8">
      {/* Personal Info Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-[#055153] rounded-full" />
          <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>Personal Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="Enter your full name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Age *</label>
            <input type="number" name="age" value={formData.age} onChange={onChange} placeholder="e.g. 25" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Gender *</label>
            <select name="gender" value={formData.gender} onChange={onChange} className={inputClass}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Blood Group</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={onChange} className={inputClass}>
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-[#0E8A7F] rounded-full" />
          <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>Contact Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="e.g. 0771234567" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#64748b' }}>Address *</label>
            <input type="text" name="address" value={formData.address} onChange={onChange} placeholder="Enter your address" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Medical History Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-amber-500 rounded-full" />
          <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>Medical History</h3>
        </div>
        <textarea
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={onChange}
          rows="4"
          placeholder="Enter any relevant medical history, allergies, chronic conditions, or current medications..."
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
          <Shield size={12} /> This information is encrypted and only shared with your healthcare providers.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
          style={{ color: '#475569' }}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#055153] hover:bg-[#044143] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-teal-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PatientProfile;
