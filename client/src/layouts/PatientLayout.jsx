import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  CreditCard,
  User,
  LogOut,
  Settings,
  Video,
  Upload,
  Pill,
  Menu,
  Sun,
  Moon,
  LayoutGrid,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PatientAuthProvider } from "../patient/context/PatientAuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "../components/NotificationBell";

const navItems = [
  { name: "Dashboard", icon: LayoutGrid, path: "/patient/dashboard" },
  { name: "My Appointments", icon: Calendar, path: "/patient/appointments" },
  { name: "Video Consultations", icon: Video, path: "/patient/telemedicine" },
  { name: "My Profile", icon: User, path: "/patient/profile" },
  { name: "Medical Reports", icon: Upload, path: "/patient/reports" },
  { name: "My Prescriptions", icon: Pill, path: "/patient/prescriptions" },
  { name: "Find Doctors", icon: Users, path: "/patient/doctors" },
  { name: "Payments", icon: CreditCard, path: "/patient/payments" },
  {
    name: "AI Symptom Checker",
    icon: Stethoscope,
    path: "/patient/symptom-checker",
  },
];

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return;
    try {
      await logout();
    } catch (_) {}
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/signin";
  };

  const patientName = user?.name || user?.fullName || "Patient";
  const initials = patientName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const NavButton = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
          isActive
            ? "bg-white dark:bg-slate-800 text-[#055153] dark:text-teal-400 shadow-sm shadow-slate-200 dark:shadow-black/20 border border-slate-100 dark:border-slate-700"
            : "text-[#64748B] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-[#055153] dark:hover:text-teal-400"
        }`}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="flex-1 text-left">{item.name}</span>
      </button>
    );
  };

  const Sidebar = () => (
    <div className="w-[260px] h-screen bg-[#F8FAFB] dark:bg-slate-900 flex flex-col pt-6 font-inter border-r border-[#E2E8F0] dark:border-slate-800 transition-colors duration-300">
      {/* Brand */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <img
          src="/favicon.png"
          alt="MediLink Logo"
          className="w-10 h-10 object-contain drop-shadow-md bg-white/10 dark:bg-slate-800/50 rounded-xl p-1"
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-[#055153] dark:text-teal-400 text-[18px] tracking-tight leading-tight uppercase font-manrope">
            MediLink
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase">
            Patient Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFB] dark:bg-slate-950 overflow-hidden transition-colors duration-300 font-inter">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[60] lg:static lg:z-auto transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="w-full h-20 bg-white dark:bg-slate-950 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1 md:gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <NotificationBell />
              <button className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-full hidden md:block">
                <Settings size={22} strokeWidth={2.5} />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

            {/* Patient Profile */}
            <button
              onClick={() => navigate("/patient/profile")}
              className="flex items-center gap-3 group text-start pl-2"
            >
              <div className="flex-col hidden sm:flex">
                <span className="text-sm font-bold text-[#112429] dark:text-slate-200 group-hover:text-[#055153] dark:group-hover:text-teal-400 transition-colors font-manrope">
                  {patientName}
                </span>
                <span className="text-[9px] font-extrabold text-[#055153] dark:text-teal-400 uppercase tracking-wider bg-[#055153]/10 dark:bg-teal-400/10 px-1.5 py-0.5 rounded-md mt-0.5 w-fit ml-auto">
                  Patient
                </span>
              </div>
              <div className="w-10 h-10 md:w-11 md:h-11 bg-teal-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#055153]/20 dark:group-hover:border-teal-400/20 transition-all shadow-sm flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#055153] dark:text-teal-400 font-bold text-sm">
                    {initials}
                  </span>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-[1600px] h-full pb-10">
            <PatientAuthProvider>
              <Outlet />
            </PatientAuthProvider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
