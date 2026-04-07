import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dna, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <Dna className="w-7 h-7 text-primary transition-transform group-hover:rotate-180 duration-700" />
          <span className="font-display text-xl font-bold text-foreground">
            Genie<span className="text-primary">Dose</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => navigate('/sign-in')}
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-glow hover:bg-primary/90 transition duration-200 border border-primary/40"
          >
            Sign In
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              navigate('/sign-in');
              setOpen(false);
            }}
            className="block w-full text-left py-2 text-sm bg-primary text-primary-foreground px-4 rounded-md hover:bg-primary/90 transition-colors mt-2"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}
