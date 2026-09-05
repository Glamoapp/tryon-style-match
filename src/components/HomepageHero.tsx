import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Search, MapPin, ShieldCheck, Zap, Lock, Star, Sparkles, LocateFixed, CalendarDays } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-beauty.jpg";

const SERVICE_OPTIONS = [
  "All",
  "Braids",
  "Weave",
  "Wigs",
  "Locs",
  "K-Tips",
  "Makeup",
  "Natural Hair",
  "Frontals",
];

const HomepageHero = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"services" | "stylists" | "products">("services");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("All");
  const [date, setDate] = useState<Date | undefined>();
  const [locating, setLocating] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          const a = data?.address || {};
          const city = a.city || a.town || a.village || a.county || "";
          const state = a.state_code || a.state || "";
          setLocation([city, state].filter(Boolean).join(", ") || "My location");
        } catch {
          setLocation("My location");
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (date) params.set("date", format(date, "yyyy-MM-dd"));

    if (tab === "products") {
      if (service !== "All") params.set("q", service);
      navigate(`/extensions?${params.toString()}`);
    } else if (tab === "stylists") {
      if (service !== "All") params.set("specialty", service);
      navigate(`/stylists?${params.toString()}`);
    } else {
      if (service !== "All") params.set("service", service);
      navigate(`/discover?${params.toString()}`);
    }
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
    <section className="relative pt-48 pb-24 overflow-hidden bg-background">
      {/* Subtle clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-background to-purple/5 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 items-stretch">
          {/* Left: copy + booking widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Booking widget card */}
            <div className="bg-white rounded-2xl shadow-soft border border-border/60 p-2">
              <div className="flex gap-1 p-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                      tab === t.id
                        ? "bg-accent text-white shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1.1fr_1.1fr_1fr_auto] gap-2 p-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background/80">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Location</p>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or ZIP"
                      className="h-6 px-0 border-0 shadow-none focus-visible:ring-0 text-sm font-body bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    aria-label="Use my location"
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <LocateFixed className={`w-4 h-4 ${locating ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background/80 text-left"
                    >
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Service</p>
                        <p className="text-sm font-body text-foreground truncate">
                          {service === "All" ? "Select a service" : service}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-1 bg-popover z-50">
                    {SERVICE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setService(s);
                          setServiceOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body hover:bg-secondary transition-colors ${
                          service === s ? "text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        {s === "All" ? "All services" : s}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background/80 text-left"
                    >
                      <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Date</p>
                        <p className="text-sm font-body text-foreground truncate">
                          {date ? format(date, "MMM d, yyyy") : "Select date"}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0 bg-popover z-50">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        setDateOpen(false);
                      }}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button type="submit" className="rounded-xl bg-accent hover:bg-purple-deep text-white h-full px-6">
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Trust strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <t.icon className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="font-medium text-foreground/80">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: hero portrait */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-full flex"
          >
            <div className="relative w-full max-w-[760px] ml-auto rounded-2xl overflow-hidden shadow-elevated bg-gradient-warm min-h-[600px] lg:min-h-[780px]">
              <img src={heroImage} alt="Luxury beauty client" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-primary/20 rounded-2xl pointer-events-none" />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;