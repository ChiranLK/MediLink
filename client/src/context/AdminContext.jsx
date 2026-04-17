import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const startRouteLoading = () => setRouteLoading(true);
  const stopRouteLoading = () => setRouteLoading(false);

  return (
    <AdminContext.Provider
      value={{
        user,
        isSidebarOpen,
        toggleSidebar,
        routeLoading,
        startRouteLoading,
        stopRouteLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdminContext must be used within AdminProvider");
  return context;
};
