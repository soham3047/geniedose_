import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileInput, Search, ShieldCheck, Stethoscope, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: FileInput,
    title: "Genomic Data Ingestion",
    desc: "Raw VCF files from local hospital storage",
    detail: "High-speed extraction of specific SNPs using CyVCF2/PyVCF",
  },
  {
    icon: Search,
    title: "Expert Knowledge Mapping",
    desc: "PharmGKB & CPIC integration",
    detail: "Cross-referencing alleles against established clinical guidelines",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-Preserving AI",
    desc: "Federated Learning via Flower",
    detail: "Each hospital trains locally; only mathematical gradients are shared",
  },
  {
    icon: Stethoscope,
    title: "Clinical Decision Support",
    desc: "Traffic Light System output",
    detail: "Red: Toxicity Risk · Yellow: Adjust Dose · Green: Safe",
  },
];

export default function ArchitectureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".arch-title", {
        scrollTrigger: { trigger: ".arch-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".arch-step", {
        scrollTrigger: { trigger: ".arch-flow", start: "top 80%" },
        opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.15,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="architecture" ref={sectionRef} className="section-padding relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative">
        <div className="arch-title text-center mb-16">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">Methodology</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            End-to-End <span className="gradient-text">Pipeline</span>
          </h2>
        </div>

        <div className="arch-flow grid md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="arch-step relative">
              <div className="glass-card p-6 h-full flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                <p className="text-xs text-primary/70 mt-auto">{s.detail}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-5 h-5 text-primary/40 -translate-y-1/2 z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
