import React, { createContext, useContext, useState, useEffect } from 'react';
import customFetch from '../utils/customFetch';
import { useAuth } from './AuthContext';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role === 'doctor' || user.role === 'admin')) {

      fetchDoctorProfile();
    } else {
      setDoctorProfile(null);
    }
  }, [user]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const startRouteLoading = () => setRouteLoading(true);
  const stopRouteLoading = () => setRouteLoading(false);

  const fetchDoctorProfile = async () => {
    const uid = user?.userId || user?.id || user?._id;
    if (!uid) return;

    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      // Send email & name as fallbacks so doctor-service can link profiles seeded with different emails
      const params = new URLSearchParams();
      if (user?.email) params.set('email', user.email);
      if (user?.name) params.set('name', user.name);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const { data } = await customFetch.get(`/api/doctors/user/${uid}${qs}`);
      if (data.success && data.data) {
        setDoctorProfile(data.data);
      } else {
        setProfileError('No doctor profile found. Please complete your profile setup.');
        setDoctorProfile(null);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      setProfileError('Failed to load doctor profile.');
      setDoctorProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const refreshDoctorProfile = () => {
    fetchDoctorProfile();
  };

  return (
    <DoctorContext.Provider
      value={{
        doctorProfile,
        /** Same id used when booking (custom doctorId or Mongo _id string) */
        doctorId:
          doctorProfile?.doctorId ||
          (doctorProfile?._id != null ? String(doctorProfile._id) : null),
        isLoadingProfile,
        profileError,
        refreshDoctorProfile,
        isSidebarOpen,
        toggleSidebar,
        routeLoading,
        startRouteLoading,
        stopRouteLoading,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );

};

export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctorContext must be used within a DoctorProvider');
  }
  return context;
};
