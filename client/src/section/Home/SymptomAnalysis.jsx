import { motion } from "framer-motion";
import { FiCpu, FiUser, FiSend } from "react-icons/fi";

const benefits = [
  "Instant triage before you even leave home",
  "Smart specialist recommendations based on symptoms",
  "Identify urgency — know when to act fast",
];

function SymptomAnalysis() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary via-[#0d3b5c] to-primary" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left copy */}
          <div className="w-full lg:w-1/2 text-white">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold font-inter tracking-widest text-primary/80 uppercase mb-4 bg-white/10 px-3 py-1 rounded-full"
            >
              AI Symptom Engine
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-manrope mb-6 leading-tight"
            >
              Smart care starts
              <br />
              <span className="text-primary/90">before the appointment.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-white/70 font-inter text-base lg:text-lg leading-relaxed mb-8 max-w-md"
            >
              Our AI assistant understands your symptoms, learns your health
              profile, and connects you to the right expert — before you even
              pick up the phone.
            </motion.p>
            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-10"
            >
              {benefits.map((ben, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </span>
                  <span className="text-white/80 font-inter text-sm">
                    {ben}
                  </span>
                </li>
              ))}
            </motion.ul>
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2.5 bg-primary text-white font-semibold font-inter px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
              <FiCpu className="w-4 h-4" />
              Try AI Symptom Check
            </motion.button>
          </div>

          {/* Right — Chat UI mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full lg:w-1/2"
          >
            <div className="bg-white/8 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="bg-white/10 border-b border-white/10 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <FiCpu className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-semibold font-manrope text-sm">
                    MediLink AI
                  </p>
                  <p className="text-white/50 text-xs font-inter flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                    Online — ready to help
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4">
                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FiCpu className="text-primary w-4 h-4" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                    <p className="text-white/90 text-sm font-inter">
                      Hi! I'm your health assistant. What symptoms are you
                      experiencing today?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-end flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-white/70 w-4 h-4" />
                  </div>
                  <div className="bg-primary rounded-2xl rounded-br-none px-4 py-3 max-w-[80%] shadow-lg shadow-primary/20">
                    <p className="text-white text-sm font-inter">
                      I have a persistent headache for 2 days and mild fever...
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FiCpu className="text-primary w-4 h-4" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                    <p className="text-white/90 text-sm font-inter mb-2">
                      Understood. Based on your symptoms, I recommend seeing a{" "}
                      <span className="text-primary font-semibold">
                        General Physician
                      </span>
                      . Shall I find you one nearby?
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full font-inter">
                        Yes, find one
                      </button>
                      <button className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full font-inter">
                        Tell me more
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Describe your symptoms…"
                  className="flex-1 bg-white/10 text-white placeholder-white/30 text-sm font-inter rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white/15 transition-colors"
                />
                <button className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors">
                  <FiSend className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SymptomAnalysis;
