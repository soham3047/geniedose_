import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, Database, Container, Monitor, Workflow, FlaskConical } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stack = [
  { icon: Brain, label: "The Brain", items: ["FastAPI (Python)", "Biopython / PyVCF", "CyVCF2"], color: "text-primary" },
  { icon: Database, label: "Database", items: ["Firebase (Firestore)"], color: "text-sky-400" },
  { icon: Container, label: "Infrastructure", items: ["Docker", "Decentralized Hospital Nodes"], color: "text-blue-400" },
  { icon: Monitor, label: "Frontend", items: ["React + Vite", "Lucide-React Icons"], color: "text-accent" },
  { icon: Workflow, label: "Federated Learning", items: ["Flower (flwr)", "Privacy-Preserving AI"], color: "text-indigo-400" },
  { icon: FlaskConical, label: "Genomics", items: ["PharmGKB", "CPIC Guidelines"], color: "text-violet-400" },
];

export default function TechStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ts-title", {
        scrollTrigger: { trigger: ".ts-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".ts-card", {
        scrollTrigger: { trigger: ".ts-grid", start: "top 80%" },
        opacity: 0, y: 30, duration: 0.5, stagger: 0.1,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="tech-stack" ref={sectionRef} className="section-padding relative">
      <div className="max-w-6xl mx-auto">
        <div className="ts-title text-center mb-16">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">Technology</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            Tech <span className="gradient-text">Stack</span>
          </h2>
        </div>

        <div className="ts-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stack.map((s, i) => (
            <div key={i} className="ts-card glass-card p-6 group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <s.icon className={`w-6 h-6 ${s.color}`} />
                <h3 className="font-display font-semibold text-foreground">{s.label}</h3>
              </div>
              <ul className="space-y-2">
                {s.items.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
