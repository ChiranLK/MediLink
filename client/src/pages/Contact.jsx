import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FaTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
import customFetch from "../utils/customFetch";

const contactDetails = [
  {
    icon: FiMail,
    label: "Email",
    value: "support@medilink.cloud",
    link: "mailto:support@medilink.cloud",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: "+94 11 234 5678",
    link: "tel:+94112345678",
  },
  {
    icon: FiMapPin,
    label: "Address",
    value: "123 Healthcare Way, Colombo 03, Sri Lanka",
    link: null,
  },
  {
    icon: FiClock,
    label: "Hours",
    value: "24 / 7 — We never sleep so you can.",
    link: null,
  },
];

const socials = [
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
];

const topics = [
  "General Inquiry",
  "Book Appointment",
  "Technical Support",
  "Billing & Payments",
  "Partner with Us",
  "Media & Press",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await customFetch.post("/api/auth/contact", {
        name: form.name,
        email: form.email,
        topic: form.topic,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F8FAFB] dark:bg-slate-900 overflow-x-hidden transition-colors duration-300">
      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary via-[#0c3756] to-primary opacity-95" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/30 rounded-full blur-[100px]" />
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 xl:px-20 relative z-10 text-center text-white">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold font-inter tracking-widest text-primary/90 uppercase mb-6"
          >
            <FiMessageSquare className="w-3.5 h-3.5" /> Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-manrope leading-tight mb-6"
          >
            We're here for you,
            <br />
            <span className="text-primary/90">every step of the way.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-white/70 font-inter text-lg leading-relaxed"
          >
            Questions, feedback, or partnership inquiries — reach out and our
            team will respond within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20">
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* ─ LEFT: Contact Details ─ */}
            <div className="w-full lg:w-2/5 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
                  Contact Details
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-2">
                  Let's start a conversation.
                </h2>
                <p className="text-neutral dark:text-slate-400 font-inter text-sm leading-relaxed">
                  We respond to every message. No chatbots, no scripted replies
                  — real humans who care about your experience.
                </p>
              </motion.div>

              <div className="space-y-4">
                {contactDetails.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <motion.div
                      key={d.label}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 flex items-start gap-4 hover:shadow-md hover:border-primary/10 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral dark:text-slate-400 font-inter uppercase tracking-wide mb-0.5">
                          {d.label}
                        </p>
                        {d.link ? (
                          <a
                            href={d.link}
                            className="text-tertiary dark:text-white font-inter text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors"
                          >
                            {d.value}
                          </a>
                        ) : (
                          <p className="text-tertiary dark:text-white font-inter text-sm">
                            {d.value}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social links */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700"
              >
                <p className="text-xs font-bold font-inter uppercase tracking-widest text-neutral dark:text-slate-400 mb-4">
                  Follow MediLink Cloud
                </p>
                <div className="flex gap-3">
                  {socials.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="w-10 h-10 rounded-xl bg-secondary dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center text-tertiary dark:text-white hover:bg-primary dark:hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ─ RIGHT: Form ─ */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-3/5"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-8 sm:p-10 shadow-sm transition-colors duration-300">
                {!submitted ? (
                  <>
                    <h3 className="text-xl font-extrabold font-manrope text-tertiary dark:text-white mb-1">
                      Send us a message
                    </h3>
                    <p className="text-sm text-neutral dark:text-slate-400 font-inter mb-8">
                      Fill in the form below — we'll get back to you within 24
                      hours.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-neutral dark:text-slate-400 font-inter uppercase tracking-wide mb-2">
                            Full Name
                          </label>
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-900/50 text-tertiary dark:text-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-neutral/50 dark:placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral dark:text-slate-400 font-inter uppercase tracking-wide mb-2">
                            Email Address
                          </label>
                          <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-900/50 text-tertiary dark:text-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-neutral/50 dark:placeholder-slate-500"
                          />
                        </div>
                      </div>

                      {/* Topic */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral dark:text-slate-400 font-inter uppercase tracking-wide mb-2">
                          Topic
                        </label>
                        <select
                          name="topic"
                          value={form.topic}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-900/50 text-tertiary dark:text-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select a topic…</option>
                          {topics.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral dark:text-slate-400 font-inter uppercase tracking-wide mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Tell us how we can help you…"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-[#F8FAFB] dark:bg-slate-900/50 text-tertiary dark:text-white font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-neutral/50 dark:placeholder-slate-500 resize-none"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 font-inter">
                          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold font-inter py-4 rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          <>
                            <FiSend className="w-4 h-4" /> Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                      <FiCheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold font-manrope text-tertiary dark:text-white mb-3">
                      Message received!
                    </h3>
                    <p className="text-neutral dark:text-slate-400 font-inter text-sm max-w-xs mx-auto leading-relaxed">
                      Thank you,{" "}
                      <span className="font-semibold text-tertiary dark:text-white">
                        {form.name}
                      </span>
                      . We'll reach out to{" "}
                      <span className="font-semibold text-primary">
                        {form.email}
                      </span>{" "}
                      within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: "",
                          email: "",
                          topic: "",
                          message: "",
                        });
                      }}
                      className="mt-8 text-sm text-primary font-semibold font-inter hover:underline underline-offset-4"
                    >
                      Send another message →
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAP PLACEHOLDER ── */}
      <section className="pb-20">
        <div className="container mx-auto px-5 sm:px-8 lg:px-16 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors"
          >
            <div className="bg-gradient-to-br from-primary/5 to-tertiary/5 dark:from-slate-900/50 dark:to-slate-900/50 h-60 flex items-center justify-center border-y border-white/50 dark:border-slate-700/50">
              <div className="text-center">
                <FiMapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-manrope font-bold text-tertiary dark:text-white">
                  123 Healthcare Way, Colombo 03, Sri Lanka
                </p>
                <p className="text-sm text-neutral dark:text-slate-400 font-inter mt-1">
                  Interactive map coming soon
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
