import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShield,
  FiZap,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiGlobe,
  FiCpu,
  FiTarget,
  FiTrendingUp,
  FiStar,
  FiCheck,
  FiCalendar,
  FiVideo,
  FiActivity,
} from "react-icons/fi";

/* ── Data ─────────────────────────────────────────────── */

const values = [
  {
    icon: FiHeart,
    title: "Patient-First Care",
    desc: "Every decision starts with one question — is this better for the patient? That compass guides our product, our people, our culture.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    icon: FiShield,
    title: "Uncompromising Privacy",
    desc: "Your medical records are yours alone. We enforce end-to-end encryption on every byte — no exceptions, no shortcuts.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: FiZap,
    title: "Speed & Simplicity",
    desc: "Great healthcare should feel effortless. We obsess over removing friction so you can focus on what matters — your health.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: FiGlobe,
    title: "Inclusive Access",
    desc: "Breaking geographical barriers to bring world-class care to every doorstep, regardless of location or background.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
];

const milestones = [
  {
    year: "2021",
    title: "The Beginning",
    event:
      "MediLink Cloud founded in Colombo, Sri Lanka — born from frustration with outdated healthcare systems.",
    icon: FiTarget,
  },
  {
    year: "2022",
    title: "Beta Launch",
    event:
      "Launched with 50 verified doctors across 3 specialties. First 1,000 patients onboarded in 90 days.",
    icon: FiTrendingUp,
  },
  {
    year: "2023",
    title: "AI Revolution",
    event:
      "Reached 10,000 active patients. Introduced our proprietary AI Symptom Engine with 94% accuracy.",
    icon: FiCpu,
  },
  {
    year: "2024",
    title: "Rapid Growth",
    event:
      "Expanded to 500+ doctors across 30+ specialties. Launched HD video consultations platform-wide.",
    icon: FiUsers,
  },
  {
    year: "2025",
    title: "Industry Leader",
    event:
      "50,000+ patients served. Named the top HealthTech platform in South Asia by TechReview.",
    icon: FiAward,
  },
];

const team = [
  {
    name: "Dr. Arun Patel",
    role: "Chief Medical Officer",
    avatar: "/Images/specialist_1.png",
    bio: "20+ years of cardiology practice. Now bridging the gap between clinical excellence and technology.",
    gradient:
      "from-blue-500/20 to-primary/20 dark:from-blue-500/30 dark:to-primary/30",
  },
  {
    name: "Dr. Lena Huang",
    role: "Head of AI Research",
    avatar: "/Images/specialist_3.png",
    bio: "PhD in Computational Medicine from MIT. Pioneering diagnostic AI that doctors actually trust.",
    gradient:
      "from-violet-500/20 to-primary/20 dark:from-violet-500/30 dark:to-primary/30",
  },
  {
    name: "Dr. Fatima Malik",
    role: "Patient Experience Lead",
    avatar: "/Images/specialist_2.png",
    bio: "Ensuring every patient touchpoint feels human, warm, and trustworthy — at digital speed.",
    gradient:
      "from-rose-500/20 to-primary/20 dark:from-rose-500/30 dark:to-primary/30",
  },
];

const capabilities = [
  {
    icon: FiCalendar,
    label: "Instant Booking",
    desc: "60-second specialist appointments",
  },
  {
    icon: FiVideo,
    label: "HD Video Consults",
    desc: "Secure, private virtual care",
  },
  {
    icon: FiCpu,
    label: "AI Diagnostics",
    desc: "94% symptom accuracy rate",
  },
  {
    icon: FiActivity,
    label: "Health Tracking",
    desc: "All records in one place",
  },
  {
    icon: FiShield,
    label: "Military-Grade Security",
    desc: "End-to-end encrypted data",
  },
  {
    icon: FiGlobe,
    label: "Global Access",
    desc: "Care from anywhere, anytime",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const childFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── Component ────────────────────────────────────────── */

function About() {
  return (
    <main className="bg-secondary dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
      {/* ═══════════════════  HERO  ═══════════════════ */}
      <section className="relative pt-36 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary via-[#0c3756] to-primary" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />

        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-5 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-white/90 font-inter tracking-wide uppercase">
                About MediLink Cloud
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-manrope text-white leading-[1.08] tracking-tight mb-7"
            >
              Healthcare that
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">
                  works for you
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 rounded-full -z-0" />
              </span>
              , not
              <br />
              against you.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-white/60 font-inter text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
            >
              We started MediLink with a radical idea: that seeing a world-class
              doctor should be as simple as sending a message. Today, we&apos;re
              making that a reality for over 50,000 patients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <button className="group flex items-center justify-center gap-3 bg-primary text-white font-semibold font-inter px-8 py-4 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                  Join MediLink Today
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/appointments">
                <button className="flex items-center justify-center gap-2 border-2 border-white/15 bg-white/5 backdrop-blur-sm text-white font-semibold font-inter px-7 py-4 rounded-2xl hover:border-primary/40 hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                  <FiCalendar className="w-4 h-4" />
                  Book Appointment
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════  STATS RIBBON  ═══════════════ */}
      <section className="relative -mt-12 z-20 pb-8">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-black/5 dark:shadow-black/20 p-8 sm:p-10"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {[
                {
                  val: "50K+",
                  lbl: "Patients Served",
                  icon: FiUsers,
                  color: "text-primary",
                },
                {
                  val: "500+",
                  lbl: "Verified Doctors",
                  icon: FiHeart,
                  color: "text-rose-500",
                },
                {
                  val: "30+",
                  lbl: "Medical Specialties",
                  icon: FiActivity,
                  color: "text-blue-500",
                },
                {
                  val: "4.9/5",
                  lbl: "Patient Rating",
                  icon: FiStar,
                  color: "text-amber-500",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.lbl}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold font-manrope text-tertiary dark:text-white leading-none">
                      {s.val}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral dark:text-slate-400 font-inter mt-0.5">
                      {s.lbl}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════  MISSION + VALUES  ═══════════════ */}
      <section className="py-24 bg-secondary dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">
            {/* Left — Copy */}
            <div className="w-full lg:w-5/12 lg:sticky lg:top-32">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-4"
              >
                Our Mission
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-6"
              >
                Technology that puts{" "}
                <span className="text-primary italic">humanity first.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-neutral dark:text-slate-400 font-inter text-base lg:text-lg leading-relaxed mb-6"
              >
                We built MediLink Cloud to dismantle the walls between patients
                and the care they deserve. No endless queues, no confusion over
                records, no friction between you and a verified specialist.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-neutral dark:text-slate-400 font-inter text-base lg:text-lg leading-relaxed mb-8"
              >
                Our AI-enabled platform powers every interaction — from the
                moment you describe a symptom to the second a prescription
                reaches your phone.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/appointments">
                  <button className="group inline-flex items-center gap-2 text-primary font-semibold font-inter text-sm hover:gap-3 transition-all">
                    Start your health journey
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right — Values grid */}
            <div className="w-full lg:w-7/12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {values.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <motion.div
                      key={v.title}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      whileHover={{ y: -4 }}
                      className={`bg-white dark:bg-slate-900 rounded-3xl p-7 border border-gray-100 dark:border-slate-800 hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 ${
                        i % 2 === 1 ? "sm:mt-8" : ""
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl ${v.bg} flex items-center justify-center mb-5`}
                      >
                        <Icon className={`w-5 h-5 ${v.color}`} />
                      </div>
                      <h3 className="font-bold font-manrope text-tertiary dark:text-white text-base mb-2">
                        {v.title}
                      </h3>
                      <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed">
                        {v.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════  CAPABILITIES  ═══════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
              What We Do
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-4">
              A complete health platform,
              <br />
              <span className="text-primary">not just an app.</span>
            </h2>
            <p className="text-neutral dark:text-slate-400 font-inter text-base lg:text-lg">
              Everything you need for modern healthcare, powered by AI and
              designed around your comfort.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.label}
                  variants={childFade}
                  whileHover={{ y: -4 }}
                  className="group flex items-start gap-4 bg-secondary dark:bg-slate-800 rounded-2xl p-6 border border-transparent hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:shadow-md group-hover:shadow-primary/25 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-bold font-manrope text-tertiary dark:text-white text-sm mb-1">
                      {cap.label}
                    </h3>
                    <p className="text-xs text-neutral dark:text-slate-400 font-inter leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════  TIMELINE  ═══════════════ */}
      <section className="py-24 bg-secondary dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight">
              From a bold idea to an
              <br />
              industry-leading platform.
            </h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-7 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-800" />

            <div className="space-y-12">
              {milestones.map((m, i) => {
                const Icon = m.icon;
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={m.year}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`relative flex items-start gap-5 lg:gap-0 ${
                      isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-7 lg:left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                          i === milestones.length - 1
                            ? "bg-primary shadow-primary/30"
                            : "bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            i === milestones.length - 1
                              ? "text-white"
                              : "text-primary"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Content card */}
                    <div
                      className={`ml-20 lg:ml-0 lg:w-[calc(50%-40px)] ${
                        isLeft ? "lg:pr-0" : "lg:pl-0"
                      }`}
                    >
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-6 py-5 hover:shadow-md hover:border-primary/10 dark:hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-extrabold font-manrope text-primary bg-primary/10 dark:bg-primary/15 px-2.5 py-1 rounded-lg">
                            {m.year}
                          </span>
                          <span className="text-sm font-bold font-manrope text-tertiary dark:text-white">
                            {m.title}
                          </span>
                        </div>
                        <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed">
                          {m.event}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════  TEAM  ═══════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
              Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-4">
              The minds behind MediLink.
            </h2>
            <p className="text-neutral dark:text-slate-400 font-inter text-base">
              A team of clinicians, engineers, and designers united by one
              mission — making healthcare work for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="group bg-secondary dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300"
              >
                {/* Avatar area */}
                <div
                  className={`relative h-56 bg-gradient-to-b ${member.gradient} flex items-end justify-center overflow-hidden`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-[75%] h-[90%] object-cover object-top transition-transform duration-500 group-hover:scale-105 relative z-10 drop-shadow-lg"
                  />
                </div>

                {/* Info */}
                <div className="p-6 text-center">
                  <h3 className="font-bold font-manrope text-tertiary dark:text-white text-base mb-0.5">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary font-inter mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════  TRUST SIGNALS  ═══════════════ */}
      <section className="py-20 bg-secondary dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 sm:p-12"
          >
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left */}
              <div className="w-full lg:w-1/2">
                <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-4">
                  Why Patients Trust Us
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-6">
                  Built on trust, powered by innovation.
                </h2>
                <div className="space-y-4">
                  {[
                    "All doctors are rigorously verified and background-checked",
                    "SOC 2 Type II compliant with end-to-end encryption",
                    "24/7 human support for medical and technical help",
                    "99.9% platform uptime — your health never waits",
                    "No hidden fees, transparent pricing on every consultation",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiCheck className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-sm text-tertiary/80 dark:text-slate-300 font-inter leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right — rating card */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-tertiary to-[#0c3756] rounded-3xl p-8 sm:p-10 text-white max-w-sm w-full relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "radial-gradient(white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className="w-5 h-5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-5xl font-extrabold font-manrope mb-2">
                      4.9<span className="text-xl text-white/50">/5</span>
                    </p>
                    <p className="text-white/60 font-inter text-sm mb-6">
                      Based on 12,000+ verified patient reviews
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "Doctor Quality", pct: 98 },
                        { label: "Platform Experience", pct: 96 },
                        { label: "Booking Speed", pct: 99 },
                      ].map((bar) => (
                        <div key={bar.label}>
                          <div className="flex justify-between text-xs font-inter mb-1">
                            <span className="text-white/70">{bar.label}</span>
                            <span className="text-white font-semibold">
                              {bar.pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${bar.pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════  CTA  ═══════════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-tertiary via-[#0c3756] to-primary rounded-3xl p-10 sm:p-16 text-center text-white overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/30 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-manrope mb-5 leading-tight">
                Ready to experience
                <br />
                <span className="text-primary/90">better healthcare?</span>
              </h2>
              <p className="text-white/60 font-inter text-lg mb-8 max-w-xl mx-auto">
                Join 50,000+ patients already using MediLink Cloud to take
                control of their health journeys — for free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <button className="group flex items-center justify-center gap-3 bg-primary text-white font-semibold font-inter px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                    Get Started Free
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/appointments">
                  <button className="flex items-center justify-center gap-2 border-2 border-white/15 text-white font-semibold font-inter px-7 py-4 rounded-2xl hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                    Browse Doctors
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default About;
