import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SolutionSection from "@/components/SolutionSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import TechStackSection from "@/components/TechStackSection";
import FutureSection from "@/components/FutureSection";
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
      <ProblemSection />
      <HowItWorksSection />
      <SolutionSection />
      <ArchitectureSection />
      <TechStackSection />
      <FutureSection />
      <FooterSection />
    </div>
  );
};

export default Index;
