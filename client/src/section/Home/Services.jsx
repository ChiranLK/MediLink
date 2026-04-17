import { motion } from "framer-motion";
import {
  FiCalendar,
  FiVideo,
  FiActivity,
  FiFileText,
  FiBookOpen,
  FiArrowRight,
  FiLock,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    icon: FiCalendar,
    title: "Instant Booking",
    desc: "Book with any specialist in under 60 seconds — no phone calls, no waiting rooms.",
    accent: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    icon: FiVideo,
    title: "Video Consults",
    desc: "High-definition virtual care from home. Secure, private, and instant.",
    accent: "bg-violet-50 dark:bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    id: 3,
    icon: FiActivity,
    title: "AI Diagnostics",
    desc: "Our ML-powered symptom engine provides accurate preliminary assessments instantly.",
    accent: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    id: 4,
    icon: FiLock,
    title: "Secure Records",
    desc: "End-to-end encrypted medical history, always accessible, always private.",
    accent: "bg-green-50 dark:bg-green-500/10",
    iconColor: "text-green-600",
  },
  {
    id: 5,
    icon: FiBookOpen,
    title: "E-Prescriptions",
    desc: "Receive digital prescriptions sent directly to you or your local pharmacy.",
    accent: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    id: 6,
    icon: FiFileText,
    title: "Health Reports",
    desc: "AI-generated health summaries that help you understand your results clearly.",
    accent: "bg-pink-50 dark:bg-pink-500/10",
    iconColor: "text-pink-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Services() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-10 lg:mb-16"
        >
          <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-4">
            Everything you need for
            <br />
            <span className="text-primary">modern healthcare.</span>
          </h2>
          <p className="text-neutral dark:text-slate-400 font-inter text-base lg:text-lg max-w-xl">
            A complete, AI-powered suite designed around your comfort and
            convenience.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.id}
                variants={item}
                whileHover={{ y: -5 }}
                className="group relative bg-secondary dark:bg-slate-800 rounded-3xl p-7 overflow-hidden cursor-default border border-transparent hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 dark:group-hover:from-primary/10 group-hover:to-primary/0 transition-all duration-500 rounded-3xl" />

                <div
                  className={`w-12 h-12 rounded-2xl ${svc.accent} flex items-center justify-center mb-5 flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${svc.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold font-manrope text-tertiary dark:text-white mb-2">
                  {svc.title}
                </h3>
                <p className="text-neutral dark:text-slate-400 font-inter text-sm leading-relaxed">
                  {svc.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link to="/appointments">
            <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold font-inter text-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
              Explore all features
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default Services;
