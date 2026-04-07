import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileCode2, BookCheck, Network } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: FileCode2,
    number: "01",
    title: "Intelligent VCF Parsing",
    subtitle: "The Data Decoder",
    action: "High-speed extraction of drug-metabolizing alleles from raw, multi-gigabyte genetic files.",
    impact: "Converts raw DNA code into clinical insights in seconds, filtering out noise to focus on genes that matter.",
  },
  {
    icon: BookCheck,
    number: "02",
    title: "Clinical Expert Rules Engine",
    subtitle: "The Knowledge Base",
    action: "Real-time mapping of identified variants to global gold standards (CPIC and PharmGKB guidelines).",
    impact: "Evidence-based dosing recommendations doctors can trust, backed by international medical consensus.",
  },
  {
    icon: Network,
    number: "03",
    title: "Federated Learning",
    subtitle: "The Privacy Shield",
    action: "Training AI models across a decentralized network of hospitals using the Flower (flwr) framework.",
    impact: "Zero Data Movement. Raw DNA stays within hospital firewalls; only mathematical insights are shared.",
  },
];

export default function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sol-title", {
        scrollTrigger: { trigger: ".sol-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".sol-pillar", {
        scrollTrigger: { trigger: ".sol-pillars", start: "top 80%" },
        opacity: 0, y: 50, duration: 0.7, stagger: 0.25,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="solution" ref={sectionRef} className="section-padding relative">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="sol-title text-center mb-16">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">Our Solution</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            3 Core <span className="gradient-text">Pillars</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            A complete architecture for privacy-preserving, precision pharmacogenomics.
          </p>
        </div>

        <div className="sol-pillars space-y-6">
          {pillars.map((p, i) => (
            <div key={i} className="sol-pillar glass-card p-8 md:p-10 flex flex-col md:flex-row gap-8 group hover:border-primary/30 transition-all duration-300">
              <div className="flex-shrink-0 flex items-start gap-4">
                <span className="font-display text-4xl font-bold text-primary/20">{p.number}</span>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <p.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary font-medium tracking-wider uppercase mb-1">{p.subtitle}</p>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">{p.title}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">ACTION</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-accent font-medium mb-1">IMPACT</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
