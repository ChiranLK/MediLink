import { motion } from "framer-motion";
import { FiUsers, FiHeart, FiStar, FiClock } from "react-icons/fi";

const stats = [
  {
    icon: FiUsers,
    value: "500+",
    label: "Expert Doctors",
    accent: "bg-blue-50 dark:bg-blue-500/10",
    color: "text-blue-500",
  },
  {
    icon: FiHeart,
    value: "50K+",
    label: "Happy Patients",
    accent: "bg-rose-50 dark:bg-rose-500/10",
    color: "text-rose-500",
  },
  {
    icon: FiStar,
    value: "4.9/5",
    label: "User Rating",
    accent: "bg-yellow-50 dark:bg-yellow-500/10",
    color: "text-yellow-500",
  },
  {
    icon: FiClock,
    value: "< 2min",
    label: "To Book Appt.",
    accent: "bg-primary/5",
    color: "text-primary",
  },
];

function Stats() {
  return (
    <section className="py-10 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-center gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${stat.accent} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-extrabold font-manrope text-tertiary dark:text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-neutral dark:text-slate-400 font-inter mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Stats;
