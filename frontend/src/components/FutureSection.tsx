import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fingerprint, Baby, FlaskConical } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const futures = [
  {
    icon: Fingerprint,
    title: "Integration with Ayushman Bharat (ABDM)",
    description: "Link with the ABHA ID system so a patient's pharmacogenomic 'Genetic Passport' travels securely across any hospital in India — metro or rural.",
  },
  {
    icon: Baby,
    title: "Rare Disease & Neonatal Screening",
    description: "The Federated Learning architecture can identify markers for rare genetic disorders and neonatal conditions — transforming GenieDose into a preventative diagnostic powerhouse.",
  },
  {
    icon: FlaskConical,
    title: "Real-time Clinical Trial Matching",
    description: "Help pharma companies identify eligible candidates for life-saving clinical trials based on DNA — without ever seeing raw genetic data. 100% patient anonymity.",
  },
];

export default function FutureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".future-title", {
        scrollTrigger: { trigger: ".future-title", start: "top 85%" },
        opacity: 0, y: 40, duration: 0.8,
      });
      gsap.from(".future-card", {
        scrollTrigger: { trigger: ".future-grid", start: "top 80%" },
        opacity: 0, y: 40, duration: 0.7, stagger: 0.2,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="future" ref={sectionRef} className="section-padding relative">
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="future-title text-center mb-16">
          <span className="text-xs font-medium text-primary tracking-wider uppercase">What's Next</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
            Future <span className="gradient-text">Scope</span>
          </h2>
        </div>

        <div className="future-grid grid md:grid-cols-3 gap-6">
          {futures.map((f, i) => (
            <div key={i} className="future-card glass-card p-8 group hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
