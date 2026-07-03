import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck, Zap, Lock, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-beauty.jpg";

const HomepageHero = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"services" | "stylists" | "products">("services");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "products") navigate("/extensions");
    else if (tab === "stylists") navigate("/stylists");
    else navigate("/discover");
  };

  const tabs = [
    { id: "services" as const, label: "Book Services" },
    { id: "stylists" as const, label: "Find Stylists" },
    { id: "products" as const, label: "Shop Products" },
  ];

  const trust = [
    { icon: ShieldCheck, label: "Verified Professionals" },
    { icon: Zap, label: "On-Demand Services" },
    { icon: Lock, label: "Secure Payments" },
    { icon: Star, label: "Top Rated" },
  ];

  return (
    <section className="relative pt-24 pb-12 bg-background overflow-hidden">
      {/* Soft gold + purple ambient glows */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[hsl(38_70%_55%/0.10)] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[hsl(270_70%_45%/0.08)] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          {/* Left: copy + booking widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.05]">
              BEAUTY MEETS <span className="text-gradient-purple">AI.</span>
              <br />
              <span className="text-foreground">LUXURY IS OUR </span>
              <span className="text-gradient-gold">STANDARD.</span>
            </h1>
            <p className="text-muted-foreground font-body mt-5 max-w-lg text-base">
              Book beauty services, shop premium products, and try your look with AI —
              all in one place.
            </p>

            {/* Booking widget card */}
            <div className="mt-8 bg-card rounded-2xl shadow-elevated border border-border/60 p-2">
              <div className="flex gap-1 p-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
                      tab === t.id
                        ? "bg-[hsl(270_70%_40%)] text-white shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1.1fr_1.1fr_1fr_auto] gap-2 p-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
                  <MapPin className="w-4 h-4 text-[hsl(38_70%_50%)]" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Location</p>
                    <p className="text-sm font-body text-foreground truncate">Fort Lauderdale, FL</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
                  <Sparkles className="w-4 h-4 text-[hsl(270_70%_45%)]" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Service</p>
                    <p className="text-sm font-body text-foreground truncate">Select a service</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Date</p>
                    <p className="text-sm font-body text-foreground truncate">Select date</p>
                  </div>
                </div>
                <Button type="submit" className="rounded-xl bg-[hsl(270_70%_40%)] hover:bg-[hsl(270_70%_35%)] text-white h-full px-6">
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Trust strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                  <span className="w-7 h-7 rounded-full bg-[hsl(38_70%_55%/0.15)] flex items-center justify-center">
                    <t.icon className="w-3.5 h-3.5 text-[hsl(38_70%_45%)]" />
                  </span>
                  <span className="font-medium text-foreground/80">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: hero portrait + AI mirror card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-[520px] ml-auto rounded-full overflow-hidden shadow-elevated bg-gradient-warm">
              <img src={heroImage} alt="Luxury beauty client" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-[hsl(38_70%_55%/0.35)] rounded-full pointer-events-none" />
            </div>

            {/* AI Smart Mirror floating card */}
            <Link to="/tryon" className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-4 left-2 sm:left-6 bg-card rounded-2xl shadow-elevated border border-border/70 p-4 w-[260px] sm:w-[300px] hover:shadow-glow transition-shadow"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(38_70%_50%)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(38_70%_45%)] font-body">
                    AI Smart Mirror
                  </span>
                </div>
                <p className="text-xs font-body text-muted-foreground mb-3 leading-snug">
                  Try on hairstyles, colors and looks in real-time with our AI technology.
                </p>
                <Button size="sm" className="rounded-full bg-[hsl(270_70%_40%)] hover:bg-[hsl(270_70%_35%)] text-white h-8 px-4 text-xs">
                  Try it Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
