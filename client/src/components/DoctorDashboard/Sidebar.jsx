import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDoctorContext } from "../../context/DoctorContext";
import {
  LayoutGrid,
  Users,
  Calendar,
  FileText,
  BarChart,
  LogOut,
  Clock,
  UserCog,
  ShieldAlert,
  BadgeCheck,
  Loader2,
} from "lucide-react";

// Removes near-white background from favicon at runtime so it blends nicely
const ProcessedFavicon = ({ className }) => {
  const [src, setSrc] = useState("/favicon.png");
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/favicon.png";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i],
            g = d[i + 1],
            b = d[i + 2];
          // Make near-white fully transparent
          if (r > 245 && g > 245 && b > 245) {
            d[i + 3] = 0; // alpha
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setSrc(canvas.toDataURL("image/png"));
      } catch (_) {
        // Fallback to original favicon if canvas fails (e.g., CORS)
        setSrc("/favicon.png");
      }
    };
  }, []);
  return <img src={src} alt="MediLink" className={className} />;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
    doctorProfile,
    isSidebarOpen,
    toggleSidebar,
    startRouteLoading,
    stopRouteLoading,
  } = useDoctorContext();

  const isAdmin = user?.role === "admin";
  const currentPath = location.pathname;

  // Clear loading indicator when route actually changes
  useEffect(() => {
    stopRouteLoading();
  }, [location.pathname]);

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out of the doctor portal? You will need to sign in again to continue.",
    );
    if (!confirmed) return;
    try {
      await logout();
    } catch (e) {
      console.warn("Logout handler error:", e);
    } finally {
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } catch (_) {}
      // Use hard redirect to guarantee navigation even if React Router is in a bad state
      window.location.href = "/signin";
    }
  };

  const handleItemClick = (path) => {
    if (path === currentPath) return;
    startRouteLoading();
    navigate(path);
    if (isSidebarOpen) toggleSidebar();
  };

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/doctor/dashboard" },
    { icon: Users, label: "Patients", path: "/doctor/patients" },
    { icon: Calendar, label: "Schedules", path: "/doctor/schedules" },
    { icon: Clock, label: "Availability", path: "/doctor/availability" },
    { icon: FileText, label: "Clinical Notes", path: "/doctor/notes" },
    { icon: BarChart, label: "Reports", path: "/doctor/reports" },
    { icon: UserCog, label: "Manage Profile", path: "/doctor/profile" },
    { icon: BadgeCheck, label: "Verification", path: "/doctor/verification" },
  ];

  // Admin-only items
  const adminItems = [
    {
      icon: ShieldAlert,
      label: "Deletion Requests",
      path: "/doctor/admin/deletions",
      badge: true,
    },
  ];

  const NavButton = ({ item }) => {
    const isActive = currentPath === item.path;
    return (
      <button
        onClick={() => handleItemClick(item.path)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
          isActive
            ? "bg-white dark:bg-slate-800 text-[#055153] dark:text-teal-400 shadow-sm shadow-slate-200 dark:shadow-black/20 border border-slate-100 dark:border-slate-700"
            : "text-[#64748B] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-[#055153] dark:hover:text-teal-400"
        }`}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <span
            className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
            title="Pending items"
          />
        )}
      </button>
    );
  };

  return (
    <div className="w-[260px] h-screen bg-[#F8FAFB] dark:bg-slate-900 flex flex-col pt-6 font-inter border-r border-[#E2E8F0] dark:border-slate-800 transition-colors duration-300">
      {/* Brand Logo */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <ProcessedFavicon className="w-8 h-8 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[#055153] dark:text-teal-400 text-[18px] tracking-tight leading-tight uppercase font-manrope">
            MediLink
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase">
            {isAdmin ? "Admin Portal" : "Doctor Portal"}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-1">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">
                Admin Controls
              </p>
            </div>
            {adminItems.map((item, idx) => (
              <NavButton key={`admin-${idx}`} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-[#055153] dark:hover:text-teal-400"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
