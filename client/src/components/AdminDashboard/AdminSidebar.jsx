import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminContext } from "../../context/AdminContext";
import {
  LayoutGrid,
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Bell,
  LogOut,
  Loader2,
} from "lucide-react";

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
          if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) d[i + 3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        setSrc(canvas.toDataURL("image/png"));
      } catch (_) {
        setSrc("/favicon.png");
      }
    };
  }, []);
  return <img src={src} alt="MediLink" className={className} />;
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar, startRouteLoading, stopRouteLoading } =
    useAdminContext();
  const currentPath = location.pathname;

  useEffect(() => {
    stopRouteLoading();
  }, [location.pathname]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      await logout();
    } catch (_) {
    } finally {
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } catch (_) {}
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
    { icon: LayoutGrid, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Stethoscope, label: "Doctors", path: "/admin/doctors" },
    { icon: Calendar, label: "Appointments", path: "/admin/appointments" },
    { icon: CreditCard, label: "Payments", path: "/admin/payments" },
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
      </button>
    );
  };

  return (
    <div className="w-[260px] h-screen bg-[#F8FAFB] dark:bg-slate-900 flex flex-col pt-6 font-inter border-r border-[#E2E8F0] dark:border-slate-800 transition-colors duration-300">
      {/* Brand */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <ProcessedFavicon className="w-8 h-8 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[#055153] dark:text-teal-400 text-[18px] tracking-tight leading-tight uppercase font-manrope">
            MediLink
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}
      </nav>

      {/* Logout */}
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

export default AdminSidebar;
