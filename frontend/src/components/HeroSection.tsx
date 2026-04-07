import { useEffect, useRef } from "react";
import gsap from "gsap";
import DNAHelix from "./DNAHelix";
import { ArrowDown, Shield, Zap, Brain } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
      gsap.from(".hero-title", { opacity: 0, y: 40, duration: 1, delay: 0.4 });
      gsap.from(".hero-subtitle", { opacity: 0, y: 30, duration: 0.8, delay: 0.7 });
      gsap.from(".hero-stats", { opacity: 0, y: 30, duration: 0.8, delay: 1, stagger: 0.15 });
      gsap.from(".hero-cta", { opacity: 0, y: 20, duration: 0.8, delay: 1.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <DNAHelix />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary tracking-wider uppercase">Precision Medicine Platform</span>
        </div>

        <h1 className="hero-title font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          <span className="text-foreground">The Right Dose,</span>
          <br />
          <span className="gradient-text">Written in Your DNA</span>
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          GenieDose uses your genetic blueprint to transform drug dosing from dangerous guesswork
          into precision science. No more "one-size-fits-all."
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {[
            { icon: Shield, label: "Privacy-First", value: "Zero Data Movement" },
            { icon: Zap, label: "Instant Analysis", value: "Seconds, Not Days" },
            { icon: Brain, label: "AI-Powered", value: "Federated Learning" },
          ].map((stat, i) => (
            <div key={i} className="hero-stats glass-card px-6 py-4 flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <a href="#problem" className="hero-cta inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <span>Discover How</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
