/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import customFetch from "@/utils/customFetch";

const PatientAuthContext = createContext(null);

const derivePatientId = (user) => {
  return (
    user?.patientId ||
    user?.patient?.id ||
    user?.patient?._id ||
    user?.profile?.patientId ||
    user?.userId ||
    user?.id ||
    user?._id ||
    ""
  );
};

export function PatientAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError("");
      
      // Only try to fetch if we have a token
      const token = sessionStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        setPatientId("");
        setIsLoadingAuth(false);
        return;
      }
      
      const { data } = await customFetch.get("/api/users/current-user");
      const user = data?.user || data;
      const resolvedPatientId = derivePatientId(user);
      setCurrentUser(user || null);
      setPatientId(resolvedPatientId);
    } catch (error) {
      // If 401, user is not authenticated - that's ok
      if (error?.response?.status === 401) {
        setCurrentUser(null);
        setPatientId("");
        setAuthError("");
      } else {
        setCurrentUser(null);
        setPatientId("");
        setAuthError(error?.response?.data?.message || "Unable to load authenticated patient session.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const contextValue = useMemo(
    () => ({ currentUser, patientId, isLoadingAuth, authError, refreshAuth }),
    [currentUser, patientId, isLoadingAuth, authError, refreshAuth]
  );

  return <PatientAuthContext.Provider value={contextValue}>{children}</PatientAuthContext.Provider>;
}

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error("usePatientAuth must be used inside PatientAuthProvider.");
  }
  return context;
};
