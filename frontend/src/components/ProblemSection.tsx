import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Users, Skull } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    icon: Users,
    title: 'The "One-Size-Fits-All" Myth',
    description: "Standard doses are designed for the 'average' patient, but nobody is average. Genetics dictates how we process 70% of all common drugs.",
    stat: "70%",
    statLabel: "of drugs affected by genetics",
  },
  {
    icon: AlertTriangle,
    title: "The Fatal Gap",
    description: "Up to 10% of hospital admissions in India are due to Adverse Drug Reactions. Doctors currently 'prescribe and pray,' waiting for side effects before adjusting.",
    stat: "10%",
    statLabel: "hospital admissions from ADRs",
  },
  {
    icon: Skull,
    title: "High-Stakes Failure",
    description: "For critical drugs like Blood Thinners or Chemotherapy, the first dose is the most dangerous. A 'standard' dose can be a life-saver for one, but poison for another.",
    stat: "1st",
    statLabel: "dose is the most dangerous",
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".problem-title", {
        scrollTrigger: { trigger: ".problem-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".problem-card", {
        scrollTrigger: { trigger: ".problem-cards", start: "top 80%" },
        opacity: 0, y: 50, duration: 0.7, stagger: 0.2,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="problem" ref={sectionRef} className="section-padding relative">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-destructive/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative">
        <div className="problem-title text-center mb-16">
          <span className="text-xs font-medium text-destructive tracking-wider uppercase">The Problem</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            Medicine's Deadly <span className="text-destructive">Blind Spot</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Millions suffer because drug dosing ignores the one thing that matters most — your DNA.
          </p>
        </div>

        <div className="problem-cards grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <div key={i} className="problem-card glass-card p-8 group hover:border-destructive/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                <p.icon className="w-6 h-6 text-destructive" />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-destructive">{p.stat}</span>
                <p className="text-xs text-muted-foreground mt-1">{p.statLabel}</p>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
