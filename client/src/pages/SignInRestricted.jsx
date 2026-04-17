import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../utils/customFetch";
import axios from "axios";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";

import { useAuth } from "../context/AuthContext";

function SignInRestricted() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setEmailError(errors.email);
    setPasswordError(errors.password);
    return isValid;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await customFetch.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        const { token, patient: userData } = response.data;
        const actualRole = userData.role;

        // Only allow doctor or admin to login via restricted endpoint
        if (actualRole !== "doctor" && actualRole !== "admin") {
          toast.error(
            "This login is restricted to doctors and admins only. Please use regular login.",
          );
          setIsLoading(false);
          return;
        }

        // Use central login function
        login(userData, token);

        toast.success("Login successful!");

        // Redirect based on actual DB role
        if (actualRole === "admin") {
          navigate("/admin/dashboard");
        } else if (actualRole === "doctor") {
          // Check verification status - redirect to verification if not verified
          try {
            const doctorRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"}/api/doctors/user/${userData._id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const doctor = doctorRes.data.doctor || doctorRes.data;
            if (
              !doctor.isVerified &&
              doctor.verification?.status !== "approved"
            ) {
              navigate("/doctor/verification");
            } else {
              navigate("/doctor/dashboard");
            }
          } catch {
            navigate("/doctor/verification");
          }
        } else {
          navigate("/doctor/dashboard");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Invalid email or password";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex lg:flex-row flex-col min-h-screen bg-[#F8FAFB] dark:bg-slate-900">
      {/* ── LEFT SIDE: Hero Section ── */}
      <div className="lg:w-1/2 w-full relative hidden lg:flex flex-col justify-center overflow-hidden">
        {/* Background Image with Teal Overlay */}
        <div className="absolute inset-0">
          <img
            src="/Images/login-hero-new.png"
            alt="Medical Hero"
            className="w-full h-full object-cover object-[center_top]"
          />
          {/* Deep dark teal multi-stop overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#012022] via-[#054E50]/95 to-[#087D80]/70" />
        </div>

        {/* Left Side Content Overlaid */}
        <div className="relative z-10 px-16 xl:px-24 py-20 h-full flex flex-col justify-between">
          <div className="max-w-xl mt-12">
            {/* Trusted Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/30 dark:border-white/10">
              <IoCheckmarkCircle className="text-teal-200" />
              <span className="text-white/90 text-sm font-semibold tracking-wider font-manrope uppercase">
                Professional Access
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-white text-4xl xl:text-5xl font-black font-manrope leading-[1.1] tracking-tight mb-16 drop-shadow-lg">
              Healthcare professionals portal.
            </h1>

            {/* Quote Block */}
            <div className="border-l-4 border-white/50 pl-6 mt-12 drop-shadow-md">
              <p className="text-white text-xl xl:text-2xl font-serif italic leading-relaxed mb-4">
                "Manage your practice efficiently with MediLink Cloud - powering
                healthcare professionals worldwide."
              </p>
              <p className="text-white/80 text-sm font-inter uppercase tracking-widest font-semibold flex items-center gap-2 drop-shadow-sm">
                <span className="w-4 h-[1px] bg-white/70 inline-block"></span>
                Healthcare Professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Form Section ── */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center items-center py-6 px-4 sm:px-10 lg:px-12 relative bg-[#F8FAFB] dark:bg-slate-900 min-h-screen">
        <div className="w-full max-w-[460px] bg-white/70 dark:bg-slate-800/40 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/50 px-6 py-6 sm:px-8 sm:py-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20">
          {/* Titles */}
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112429] dark:text-white font-manrope mb-1">
              Professional Login
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm font-inter">
              Sign in to your professional dashboard
            </p>
          </div>

          <div className="space-y-5">
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#112429] dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoMailOutline className="text-[#94A3B8] dark:text-slate-500 w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="Enter your E-mail"
                  className={`w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/50 dark:bg-slate-800/50 dark:text-white border border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-colors focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 ${
                    touched.email && emailError
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-[#E2E8F0] dark:border-slate-700 focus:border-[#055153] dark:focus:border-primary focus:ring-4 focus:ring-[#055153]/10 dark:focus:ring-primary/20 hover:border-[#CBD5E1] dark:hover:border-slate-600"
                  } font-inter`}
                />
              </div>
              {touched.email && emailError && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-inter font-medium">
                  <MdErrorOutline size={14} />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#112429] dark:text-slate-200">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#055153] dark:text-primary transition-colors text-[11px] font-semibold hover:underline font-inter"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosedOutline className="text-[#94A3B8] dark:text-slate-500 w-5 h-5" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-2.5 text-sm font-medium bg-white/50 dark:bg-slate-800/50 dark:text-white border border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-colors focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 ${
                    touched.password && passwordError
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-[#E2E8F0] dark:border-slate-700 focus:border-[#055153] dark:focus:border-primary focus:ring-4 focus:ring-[#055153]/10 dark:focus:ring-primary/20 hover:border-[#CBD5E1] dark:hover:border-slate-600"
                  } font-inter`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] dark:text-slate-500 hover:text-[#64748B] dark:hover:text-slate-300 transition-colors"
                >
                  {passwordVisible ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-inter font-medium">
                  <MdErrorOutline size={14} />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Keep Signed In Checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-[#055153] dark:text-primary border-[#CBD5E1] dark:border-slate-600 rounded focus:ring-[#055153] dark:focus:ring-primary dark:bg-slate-800 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-2.5 block text-sm text-[#475569] dark:text-slate-300 font-medium font-inter cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleFormSubmit}
              disabled={isLoading}
              className="w-full bg-[#055153] dark:bg-primary hover:bg-[#044143] dark:hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#055153]/20 dark:shadow-primary/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <FaArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-[#475569] dark:text-slate-400 text-sm font-medium mt-6 font-inter">
            Don't have an account?{" "}
            <Link
              to="/signup/restricted"
              className="text-[#055153] dark:text-primary font-bold hover:underline transition-colors block mx-auto py-1"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInRestricted;
