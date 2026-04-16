import React from 'react';
import { Bell, Settings, HelpCircle, Menu, Sun, Moon } from 'lucide-react';
import { useDoctorContext } from '../../context/DoctorContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TopHeader = () => {
  const { doctorProfile, toggleSidebar } = useDoctorContext();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const doctorName = doctorProfile?.name || user?.name || user?.fullName || 'Doctor';
  const specialization = doctorProfile?.specialization || 'General Practice';
  const profileImage = doctorProfile?.profileImage?.startsWith('http')
    ? doctorProfile.profileImage
    : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=faces';

  return (
    <header className="w-full h-20 bg-white dark:bg-slate-950 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Action Icons */}
        <div className="flex items-center gap-1 md:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full">
            <Bell size={22} strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
          </button>

          <button className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full hidden md:block">
            <Settings size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 group text-start pl-2">
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-bold text-[#112429] dark:text-slate-200 group-hover:text-[#055153] dark:group-hover:text-teal-400 transition-colors font-manrope">
              Dr. {doctorName}
            </span>
            <span className="text-[9px] font-extrabold text-[#055153] dark:text-teal-400 uppercase tracking-wider bg-[#055153]/10 dark:bg-teal-400/10 px-1.5 py-0.5 rounded-md mt-0.5 w-fit ml-auto">
              {specialization}
            </span>
          </div>
          <div className="w-10 h-10 md:w-11 md:h-11 bg-teal-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#055153]/20 dark:group-hover:border-teal-400/20 transition-all shadow-sm">
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;

