import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  CreditCard, 
  User,
  LogOut,
  Bell,
  Settings,
  Video,
  Upload,
  Pill,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PatientAuthProvider } from '../patient/context/PatientAuthContext';
import Logo from '../components/UI/Logo';

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', icon: Activity, path: '/patient/dashboard' },
    { name: 'My Appointments', icon: Calendar, path: '/patient/appointments' },
    { name: 'Video Consultations', icon: Video, path: '/patient/telemedicine' },
    { name: 'My Profile', icon: User, path: '/patient/profile' },
    { name: 'Medical Reports', icon: Upload, path: '/patient/reports' },
    { name: 'My Prescriptions', icon: Pill, path: '/patient/prescriptions' },
    { name: 'Find Doctors', icon: Users, path: '/patient/doctors' },
    { name: 'Payments', icon: CreditCard, path: '/patient/payments' },
  ];


  return (
    <div className="min-h-screen bg-[#F4F7F9] font-inter">
      {/* Top Navbar */}
      <header className="bg-white px-6 h-16 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             {/* Text logo matching style */}
             <span className="font-bold text-xl text-[#055153]">Aura <span className="font-medium">Health</span></span>
          </div>

          {/* Top Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[#4B5A69] font-medium text-[15px]">
            <a href="#" className="text-[#055153] border-b-2 border-[#055153] pb-1">Find Care</a>
            <a href="#" className="hover:text-[#055153] pb-1 border-b-2 border-transparent">Services</a>
            <a href="#" className="hover:text-[#055153] pb-1 border-b-2 border-transparent">Doctors</a>
            <a href="#" className="hover:text-[#055153] pb-1 border-b-2 border-transparent">About Us</a>
          </nav>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-5 text-gray-500 bg-white">
          <button className="hover:text-[#055153] transition-colors"><Bell size={20} /></button>
          <button className="hover:text-[#055153] transition-colors"><Settings size={20} /></button>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex max-w-[1400px] mx-auto w-full pt-8 px-4 lg:px-8 gap-8 items-start">
        
        {/* Left Sidebar */}
        <aside className="w-[240px] flex-shrink-0 hidden lg:flex flex-col gap-8 sticky top-28">
          
          {/* User Synopsis */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
               {user?.avatar ? (
                <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-[#055153] text-white flex items-center justify-center font-bold text-lg">
                    {(user?.name || user?.fullName || 'P').charAt(0)}
                  </div>
               )}
            </div>
            <div>
              <p className="text-[12px] text-gray-400 font-medium tracking-wide">Welcome back</p>
              <h3 className="font-bold text-[#055153] text-[15px] leading-tight truncate w-[160px]">
                {user?.name || user?.fullName || "Patient"}
              </h3>
            </div>
          </div>

          {/* Book Appointment CTA Button */}
          <button 
            onClick={() => navigate('/appointments')}
            className="w-full bg-[#0E8A7F] hover:bg-[#0b746a] text-white font-semibold py-3 px-4 rounded-[14px] shadow-sm transition-all"
          >
            Book Appointment
          </button>

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-all duration-200
                    ${isActive 
                      ? 'bg-white shadow-sm text-[#055153] shadow-gray-200/50' 
                      : 'text-[#4B5A69] hover:bg-white/60 hover:text-[#055153]'}
                  `}
                >
                  <Icon size={18} className="opacity-80" />
                  {item.name}
                </NavLink>
              );
            })}
             <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-all duration-200 text-[#4B5A69] hover:bg-white/60 hover:text-red-600 mt-2"
              >
                <LogOut size={18} className="opacity-80" />
                Sign Out
              </button>
          </nav>

        </aside>

        {/* Dashboard Content Outlet */}
        <main className="flex-1 min-w-0 pb-20">
          <PatientAuthProvider>
            <Outlet />
          </PatientAuthProvider>
        </main>

      </div>
    </div>
  );
};

export default PatientLayout;
