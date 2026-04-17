import React, { useEffect, useState } from "react";
import Hero from "@/section/Home/Hero";
import Stats from "@/section/Home/Stats";
import Services from "@/section/Home/Services";
import SymptomAnalysis from "@/section/Home/SymptomAnalysis";
import Specialists from "@/section/Home/Specialists";
import PathToWellness from "@/section/Home/PathToWellness";
import WhyMediLink from "@/section/Home/WhyMediLink";
import Testimonials from "@/section/Home/Testimonials";
import AiChatBot from "@/components/AiChatBot";
import HomeSplashScreen from "@/components/UI/HomeSplashScreen";

const Home = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {showSplash && <HomeSplashScreen />}
      <main className="w-full overflow-x-hidden bg-[#F8FAFB] dark:bg-slate-900 transition-colors duration-300">
        <Hero />
        <Stats />
        <Services />
        <SymptomAnalysis />
        <Specialists />
        <PathToWellness />
        <WhyMediLink />
        <Testimonials />
        <AiChatBot />
      </main>
    </>
  );
};

export default Home;
