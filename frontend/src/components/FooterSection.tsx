import { Dna } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="border-t border-border/50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card p-10 md:p-16 text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            The right dose is no longer a guess —<br />
            <span className="gradient-text">it's a guarantee.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We aren't just building a software tool; we are building the bridge between India's
            ancient anthropological diversity and modern molecular medicine.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              Genie<span className="text-primary">Dose</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
