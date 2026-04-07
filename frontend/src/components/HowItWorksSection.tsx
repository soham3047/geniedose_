import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dna, Activity, CheckCircle, XCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const archetypes = [
  { label: "Poor Metabolizer", color: "bg-destructive", textColor: "text-destructive", desc: "High toxicity risk — drug accumulates", icon: XCircle },
  { label: "Intermediate", color: "bg-yellow-500", textColor: "text-yellow-500", desc: "Standard dose slightly too strong", icon: Activity },
  { label: "Normal", color: "bg-emerald-500", textColor: "text-emerald-500", desc: "Drug works exactly as intended", icon: CheckCircle },
  { label: "Ultra-Rapid", color: "bg-orange-500", textColor: "text-orange-500", desc: "Treatment failure — drug destroyed", icon: XCircle },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-title", {
        scrollTrigger: { trigger: ".hiw-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".hiw-card", {
        scrollTrigger: { trigger: ".hiw-grid", start: "top 80%" },
        opacity: 0, x: -30, duration: 0.6, stagger: 0.15,
      });
      gsap.from(".hiw-info", {
        scrollTrigger: { trigger: ".hiw-info", start: "top 85%" },
        opacity: 0, y: 30, duration: 0.8,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="section-padding relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="hiw-title text-center mb-16">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">The Science</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            Your DNA: The <span className="glow-text">Metabolic Engine</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            CYP450 enzymes in your liver metabolize 70% of all common medications. Genetic mutations dictate
            how fast or slow these engines run, creating four distinct patient archetypes.
          </p>
        </div>

        <div className="hiw-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {archetypes.map((a, i) => (
            <div key={i} className="hiw-card glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div className={`w-10 h-10 rounded-full ${a.color}/15 flex items-center justify-center mx-auto mb-4`}>
                <a.icon className={`w-5 h-5 ${a.textColor}`} />
              </div>
              <div className={`w-16 h-1 ${a.color} rounded-full mx-auto mb-4`} />
              <h3 className={`font-display font-semibold ${a.textColor} mb-2`}>{a.label}</h3>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="hiw-info glass-card p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Dna className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">The Life-or-Death Impact</h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Example (Warfarin):</strong> A standard "blood thinner" dose is
              life-saving for one patient, but causes fatal internal hemorrhaging in another — due to a single
              genetic mismatch. GenieDose eliminates this deadly guesswork.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
