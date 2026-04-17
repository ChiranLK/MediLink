import React from "react";
import { motion } from "framer-motion";

const HomeSplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#031417]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.24),transparent_32%),linear-gradient(135deg,#031417_0%,#06242A_52%,#020B0D_100%)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative flex w-full max-w-3xl flex-col items-center"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.82, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-36 w-36 items-center justify-center md:h-40 md:w-40"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-[2rem] border border-white/10"
              style={{
                background:
                  "conic-gradient(from 180deg, rgba(20,184,166,0) 0deg, rgba(20,184,166,0.65) 120deg, rgba(14,165,233,0.55) 220deg, rgba(20,184,166,0) 360deg)",
                padding: "1px",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <div className="absolute inset-[10px] rounded-[1.8rem] border border-white/10 bg-white/8 backdrop-blur-xl shadow-[0_0_60px_rgba(20,184,166,0.18)]" />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.4rem] bg-white shadow-2xl md:h-28 md:w-28"
            >
              <img
                src="/favicon.png"
                alt="MediLink"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65 }}
            className="mt-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
            <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              Smart Care Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.72 }}
            className="mt-6 text-center font-manrope text-[42px] font-black tracking-[-0.04em] text-white md:text-[72px]"
          >
            MediLink
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.65 }}
            className="mt-3 max-w-xl text-center font-inter text-[14px] font-medium leading-7 text-white/68 md:text-[16px]"
          >
            Connected appointments, telemedicine, records, and care workflows in
            one modern healthcare experience.
          </motion.p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-4">
            <div className="relative h-[6px] overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 shadow-[0_0_20px_rgba(94,234,212,0.55)]"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              <span>Initializing</span>
              <span>Experience Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeSplashScreen;
