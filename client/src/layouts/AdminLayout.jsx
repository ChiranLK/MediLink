import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminDashboard/AdminSidebar";
import AdminTopHeader from "../components/AdminDashboard/AdminTopHeader";
import { AdminProvider, useAdminContext } from "../context/AdminContext";
import { Loader2 } from "lucide-react";

const AdminLayoutContent = () => {
  const { isSidebarOpen, toggleSidebar } = useAdminContext();

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFB] dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-[60] lg:static lg:z-auto transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}
      >
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-shrink-0">
          <AdminTopHeader />
        </div>

        <RouteLoadingOverlay />

        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-[1600px] h-full pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const RouteLoadingOverlay = () => {
  const { routeLoading } = useAdminContext();
  if (!routeLoading) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/60 dark:bg-black/50" />
      <div className="relative z-[56] flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl">
        <Loader2 className="animate-spin" size={22} />
        <span className="font-bold text-sm">Loading…</span>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <AdminProvider>
    <AdminLayoutContent />
  </AdminProvider>
);

export default AdminLayout;
