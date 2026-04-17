import { motion } from "framer-motion";
import { FiSearch, FiCalendar, FiVideo, FiHeart } from "react-icons/fi";

const steps = [
  {
    num: "01",
    title: "Search & Filter",
    desc: "Browse verified specialists by specialty, location, language, or rating.",
    Icon: FiSearch,
    accent: "bg-primary text-white",
  },
  {
    num: "02",
    title: "Pick a Slot",
    desc: "See live availability and instantly secure your preferred time and format.",
    Icon: FiCalendar,
    accent: "bg-blue-500 text-white",
  },
  {
    num: "03",
    title: "Attend & Consult",
    desc: "Join via high-definition video or visit in-clinic — your choice, every time.",
    Icon: FiVideo,
    accent: "bg-orange-500 text-white",
  },
  {
    num: "04",
    title: "Heal & Follow Up",
    desc: "Receive your digital prescription, track recovery, and schedule follow-ups.",
    Icon: FiHeart,
    accent: "bg-rose-500 text-white",
  },
];

function PathToWellness() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-20"
        >
          <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight">
            Your path to wellness
            <br />
            in 4 simple steps.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden lg:block absolute top-[38px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] z-0">
            <div className="w-full border-t-2 border-dashed border-primary/20" />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon box */}
              <div
                className={`relative w-[76px] h-[76px] rounded-2xl flex items-center justify-center mb-6 z-10 transition-all duration-300 ${
                  index === 0
                    ? "bg-primary shadow-xl shadow-primary/30"
                    : "bg-secondary dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700"
                }`}
              >
                <step.Icon
                  className={`w-7 h-7 ${index === 0 ? "text-white" : "text-tertiary dark:text-white"}`}
                />
                {/* Small number label */}
                <span
                  className={`absolute -top-2 -right-2 text-[10px] font-bold font-manrope w-5 h-5 rounded-full flex items-center justify-center ${
                    index === 0
                      ? "bg-white dark:bg-slate-900 text-primary"
                      : "bg-primary text-white"
                  }`}
                >
                  {index + 1}
                </span>
              </div>

              <h3 className="font-bold font-manrope text-tertiary dark:text-white text-base mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-neutral dark:text-slate-400 font-inter leading-relaxed max-w-[180px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PathToWellness;
