import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import customFetch from "../../utils/customFetch";
import { FiArrowRight, FiCalendar, FiShield, FiActivity } from "react-icons/fi";

// Floating stats badges
const statBadges = [
  { value: "50K+", label: "Happy Patients", color: "bg-white", delay: 1.0 },
  { value: "500+", label: "Expert Doctors", color: "bg-primary/5", delay: 1.3 },
];

function Hero() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Only try to fetch if we have a token
        const token = sessionStorage.getItem("token");
        if (!token) {
          setCurrentUser(null);
          return;
        }

        const { data } = await customFetch.get("/api/users/current-user");
        setCurrentUser(data.user || data);
      } catch (error) {
        // If 401 or any other error, just set to null
        setCurrentUser(null);
      }
    };
    getCurrentUser();
  }, []);

  const handleBookClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to book an appointment");
      navigate("/signin");
      return;
    }
    navigate("/appointments");
  };

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#F8FAFB] dark:bg-slate-900 transition-colors duration-300">
      {/* Background — soft radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[620px] h-[620px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px]" />
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#102A43 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10 pt-24 pb-10 lg:pt-28 lg:pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 xl:gap-20">
          {/* ── LEFT COPY ── */}
          <div className="w-full lg:w-[52%] flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 lg:space-y-7">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-2"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary font-inter tracking-wide">
                AI-Enabled Healthcare Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-manrope text-tertiary dark:text-white leading-[1.07] tracking-tight transition-colors duration-300">
                Your Health,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">Reimagined</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/10 rounded-full -z-0" />
                </span>{" "}
                for the
                <br />
                Digital Age.
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-neutral dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 font-inter transition-colors duration-300"
            >
              Connect with top-rated specialists, book appointments in seconds,
              and manage your complete health journey — all in one intelligent
              platform.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center lg:items-start"
            >
              <button
                onClick={handleBookClick}
                className="group flex items-center justify-center gap-3 bg-primary text-white font-semibold font-inter px-7 py-4 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/95 hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
              >
                <FiCalendar className="w-5 h-5" />
                Book an Appointment
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/about">
                <button className="group flex items-center justify-center gap-2 border-2 border-tertiary/15 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-tertiary dark:text-white font-semibold font-inter px-6 py-4 rounded-2xl hover:border-primary/30 dark:hover:border-primary/30 hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto">
                  <FiActivity className="w-4 h-4" />
                  Learn More
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-4 pt-2 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2.5">
                {[
                  "/Images/specialist_1.png",
                  "/Images/specialist_2.png",
                  "/Images/specialist_3.png",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Doctor"
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 object-cover object-top bg-[#F8FAFB] dark:bg-slate-900"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-neutral dark:text-slate-400 font-inter transition-colors duration-300">
                  <span className="font-semibold text-tertiary dark:text-white">
                    4.9/5
                  </span>{" "}
                  from 12,000+ reviews
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT VISUAL ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
            className="w-full lg:w-[48%] relative flex-shrink-0"
          >
            {/* Main image card */}
            <div className="relative">
              {/* Glowing ring */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-3xl scale-95" />

              <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/60 dark:border-white/10 shadow-2xl h-[300px] sm:h-[420px] lg:h-[560px] bg-gradient-to-br from-primary/5 to-tertiary/5 dark:from-primary/10 dark:to-slate-800/50">
                <img
                  src="/Images/hero-doctors.png"
                  alt="MediLink Doctors"
                  className="w-full h-full object-cover object-top"
                />
                {/* Colour gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-tertiary/30 via-transparent to-transparent" />
              </div>

              {/* Floating stat cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="absolute -left-3 sm:-left-8 top-[18%] glass dark:bg-slate-800/80 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3.5 shadow-xl hidden sm:flex items-center gap-3 z-20 min-w-[130px] sm:min-w-[150px] dark:border dark:border-slate-700/50"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiShield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-extrabold text-tertiary dark:text-white font-manrope text-base leading-none mb-0.5">
                    50K+
                  </p>
                  <p className="text-xs text-neutral dark:text-slate-400 font-inter">
                    Happy Patients
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-3 sm:-right-8 bottom-[20%] glass dark:bg-slate-800/80 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3.5 shadow-xl hidden sm:flex items-center gap-3 z-20 min-w-[130px] sm:min-w-[150px] dark:border dark:border-slate-700/50"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-tertiary dark:text-white font-manrope text-base leading-none mb-0.5">
                    500+
                  </p>
                  <p className="text-xs text-neutral dark:text-slate-400 font-inter">
                    Expert Doctors
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
