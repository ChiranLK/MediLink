import { motion } from "framer-motion";
import {
  FiShield,
  FiZap,
  FiCheckCircle,
  FiCreditCard,
  FiHeadphones,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FiShield,
    title: "End-to-End Privacy",
    desc: "Military-grade encryption on all medical data.",
    accent: "bg-blue-50 dark:bg-blue-500/10",
    color: "text-blue-500",
  },
  {
    icon: FiCheckCircle,
    title: "Verified Experts",
    desc: "All doctors are rigorously background-checked.",
    accent: "bg-green-50 dark:bg-green-500/10",
    color: "text-green-500",
  },
  {
    icon: FiZap,
    title: "Lightning Fast",
    desc: "From symptom to specialist in under 2 minutes.",
    accent: "bg-yellow-50 dark:bg-yellow-500/10",
    color: "text-yellow-500",
  },
  {
    icon: FiCreditCard,
    title: "Flexible Payments",
    desc: "Supports insurance, cards, and digital wallets.",
    accent: "bg-primary/5",
    color: "text-primary",
  },
];

function WhyMediLink() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFB] dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] -translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left — Copy */}
          <div className="w-full lg:w-5/12 flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-4"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight mb-6"
            >
              Healthcare that
              <br />
              actually puts{" "}
              <span className="text-primary italic">you first.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-neutral dark:text-slate-400 font-inter text-base lg:text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0"
            >
              We built MediLink Cloud to remove every friction between you and
              the care you deserve — no paperwork, no hold music, no confusion.
            </motion.p>

            {/* Support guarantee block */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-start gap-4 mb-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/25">
                <FiHeadphones className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-bold font-manrope text-tertiary dark:text-white mb-1">
                  24 / 7 Human Support
                </p>
                <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed">
                  Real people, always available. Medical + technical help, any
                  hour of the day.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/appointments">
                <button className="group inline-flex items-center gap-2 text-primary font-semibold font-inter text-sm hover:gap-3 transition-all">
                  Start your health journey
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right — Feature grid */}
          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${feat.accent} flex items-center justify-center mb-5`}
                    >
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <h3 className="font-bold font-manrope text-tertiary dark:text-white text-base mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed">
                      {feat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyMediLink;
