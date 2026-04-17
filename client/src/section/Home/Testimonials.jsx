import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    id: 1,
    quote:
      "I booked a specialist in under two minutes. No hold music, no confusion. MediLink is genuinely the future of healthcare.",
    author: "Sophia Reynolds",
    role: "Primary Care Patient",
    avatar:
      "https://ui-avatars.com/api/?name=Sophia+R&background=007A7C&color=fff&size=80&bold=true",
    condition: "Managed Hypertension",
  },
  {
    id: 2,
    quote:
      "The video consult quality was incredible. I genuinely felt like Dr. Chen was in the room with me. This platform is leagues ahead.",
    author: "James Thompson",
    role: "Remote Consultation User",
    avatar:
      "https://ui-avatars.com/api/?name=James+T&background=102A43&color=fff&size=80&bold=true",
    condition: "Orthopedic Follow-up",
  },
  {
    id: 3,
    quote:
      "The AI symptom checker sent me to the right doctor immediately. I didn't waste a single day waiting. It saved my peace of mind.",
    author: "Priya Nair",
    role: "New User",
    avatar:
      "https://ui-avatars.com/api/?name=Priya+N&background=5a2d73&color=fff&size=80&bold=true",
    condition: "AI Triage → Neurologist",
  },
];

function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFB] dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-end mb-14 gap-4"
        >
          <div>
            <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
              Patient Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight">
              Real people, real results.
            </h2>
          </div>
          <p className="text-neutral dark:text-slate-400 font-inter text-sm max-w-xs text-right hidden sm:block">
            Trusted by thousands of patients across the UK, US & South Asia.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              whileHover={{ y: -5 }}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-7 border border-gray-100 dark:border-slate-700 hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col ${index === 1 ? "lg:mt-8" : ""}`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-tertiary/80 dark:text-white/80 font-inter text-base leading-relaxed flex-grow mb-7">
                "{t.quote}"
              </blockquote>

              {/* Footer */}
              <div className="flex items-center gap-3 border-t border-gray-100 dark:border-slate-700 pt-5">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold font-manrope text-tertiary dark:text-white text-sm truncate">
                    {t.author}
                  </p>
                  <p className="text-xs text-neutral dark:text-slate-400 font-inter truncate">
                    {t.role}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="text-[10px] font-semibold font-inter text-primary bg-primary/8 dark:bg-primary/20 rounded-full px-2.5 py-1 whitespace-nowrap">
                    {t.condition}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 py-6 px-6 sm:px-8 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { val: "50,000+", lbl: "Patients served" },
              { val: "500+", lbl: "Verified doctors" },
              { val: "4.9/5", lbl: "Average rating" },
              { val: "99.9%", lbl: "Platform uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl font-extrabold font-manrope text-tertiary dark:text-white">
                  {stat.val}
                </p>
                <p className="text-xs text-neutral dark:text-slate-400 font-inter mt-0.5">
                  {stat.lbl}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
