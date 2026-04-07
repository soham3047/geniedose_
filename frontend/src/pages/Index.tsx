import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FooterSection from "@/components/FooterSection";
import IntroSplash from "@/components/IntroSplash";

const Index = () => {
  const [introDone, setIntroDone] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

  return (
    <div className="min-h-screen bg-background">
      {!introDone && <IntroSplash onComplete={handleIntroComplete} />}
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <FooterSection />
    </div>
  );
};

export default Index;
