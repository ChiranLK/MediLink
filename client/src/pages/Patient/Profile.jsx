import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi } from '../../patient/services/patientApi';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Heart, Edit2, Save, X } from 'lucide-react';

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
      // First try to get existing profile
      const uid = user?.userId || user?.id;
      if (uid) {
        const response = await patientApi.getPatientProfile(uid);
        if (response.data) {
          setProfile(response.data);
          setFormData(response.data);
        } else {
          // Profile doesn't exist yet
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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validation
      if (!formData.name || !formData.age || !formData.gender || !formData.phone || !formData.address) {
        toast.error('Please fill all required fields');
        return;
      }

      let response;
      if (profile) {
        // Update existing profile
        const uid = user?.userId || user?.id;
        response = await patientApi.updatePatientProfile(uid, formData);
      } else {
        const uid = user?.userId || user?.id;
        response = await patientApi.createPatientProfile({
          userId: uid,
          ...formData
        });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold" style={{ color: '#1e293b' }}>My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Edit2 size={20} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Profile Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{formData.name || user?.name || user?.fullName || 'Patient'}</h2>
              <p className="text-blue-100">Patient ID: {(user?.userId || user?.id)?.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Medical History</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter any relevant medical history, allergies, or chronic conditions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile || {});
                  }}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InfoCard icon={<User />} label="Name" value={formData.name || user?.name || user?.fullName || ''} />
                <InfoCard icon={<Heart />} label="Age" value={formData.age ? `${formData.age} years` : 'Not specified'} />
                <InfoCard icon={<User />} label="Gender" value={formData.gender} />
                <InfoCard icon={<Heart />} label="Blood Group" value={formData.bloodGroup || 'Not specified'} />
                <InfoCard icon={<Phone />} label="Phone" value={formData.phone} />
                <InfoCard icon={<MapPin />} label="Address" value={formData.address} />
              </div>

              {formData.medicalHistory && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1e293b' }}>Medical History</h3>
                  <p style={{ color: '#4b5563' }}>{formData.medicalHistory}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <div className="text-blue-500">{icon}</div>
      <span className="text-sm" style={{ color: '#4b5563' }}>{label}</span>
    </div>
    <p className="text-lg font-semibold" style={{ color: '#1e293b' }}>{value || 'Not specified'}</p>
  </div>
);

export default PatientProfile;
