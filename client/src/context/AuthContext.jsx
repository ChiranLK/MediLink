import React, { createContext, useContext, useState, useEffect } from "react";
import customFetch from "../utils/customFetch";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

// ─── Helper: read cached user from sessionStorage ───────────────────────────
const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Initialise synchronously from sessionStorage so ProtectedRoute never
  // sees a false null while the async verify is still in-flight.
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    return getStoredUser(); // may be null on very first load, verify will fill it
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading spinner if we have a token but no cached user yet
    const token = sessionStorage.getItem("token");
    const stored = getStoredUser();
    return !!(token && !stored); // true only when token exists but user not cached
  });

  const checkUserStatus = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await customFetch.post("/api/auth/verify", { token });
      const verified = {
        userId: data.userId,
        role: data.role,
        name: data.fullName || data.name,
        email: data.email,
      };
      sessionStorage.setItem("user", JSON.stringify(verified));
      setUser(verified);
    } catch (error) {
      console.warn("Auth verification failed:", error.message);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only run verify if we have a token but no cached user data yet
    const token = sessionStorage.getItem("token");
    const stored = getStoredUser();
    if (token && !stored) {
      checkUserStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    // Normalise field names so both login response and verify response look the same
    const normalised = {
      userId: userData.userId || userData._id,
      role: userData.role,
      name: userData.name || userData.fullName,
      email: userData.email,
    };
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(normalised));
    setUser(normalised); // synchronous — ProtectedRoute sees this immediately
  };

  const updateAvatar = (avatarUrl) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: avatarUrl };
      sessionStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await customFetch.post("/api/auth/logout");
    } catch (error) {
      console.warn("Logout API failed:", error.message);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, checkUserStatus, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
