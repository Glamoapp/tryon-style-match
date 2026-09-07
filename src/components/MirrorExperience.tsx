// MirrorExperience - animated step-by-step Smart Mirror walkthrough
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Music,
  Clock,
  Sparkles,
  Navigation,
  Scissors,
  ShoppingBag,
  Calendar,
  CreditCard,
  CheckCircle2,
  Package,
} from "lucide-react";

type Step = {
  id: string;
  label: string;
};

const steps: Step[] = [
  { id: "mirror", label: "Just a mirror" },
  { id: "wake", label: "Talk to the mirror" },
  { id: "daily", label: "Music & time" },
  { id: "splash", label: "NEXTLOOK Try-On" },
  { id: "tryon", label: "Try on hair" },
  { id: "shop", label: "Buy the hair" },
  { id: "book", label: "Pick your time" },
  { id: "pay", label: "Secure checkout" },
  { id: "confirm", label: "Booked" },
  { id: "arriving", label: "Stylist on the way" },
];

const STEP_MS = 3600;

const MirrorExperience = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % steps.length), STEP_MS);
    return () => clearInterval(t);
  }, []);

  const step = steps[index].id;

  return (
    <div className="relative h-full w-full bg-[hsl(270_30%_8%)] overflow-hidden">
      {/* Mirror reflection base (always present) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 35%, hsl(280 20% 32% / 0.9), transparent 65%), linear-gradient(160deg, hsl(270 18% 14%) 0%, hsl(270 12% 8%) 100%)",
        }}
      />
      {/* Soft silhouette reflection */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[22%] w-28 h-28 rounded-full bg-white/[0.06] blur-md" />
      <div className="absolute left-1/2 -translate-x-1/2 top-[46%] w-44 h-52 rounded-t-[6rem] bg-white/[0.05] blur-lg" />
      {/* Glass sheen */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 35%, hsl(0 0% 100% / 0.18) 50%, transparent 65%)",
        }}
        animate={{ x: ["-40%", "40%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Screen wake dim layer */}
      <motion.div
        className="absolute inset-0 bg-[hsl(270_50%_10%)]"
        animate={{ opacity: step === "mirror" ? 0 : 0.55 }}
        transition={{ duration: 0.8 }}
      />

      <AnimatePresence mode="wait">
        {step === "mirror" && (
          <motion.div
            key="mirror"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-end justify-center pb-10"
          >
            <motion.p
              animate={{ opacity: [0.25, 0.8, 0.25] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-body"
            >
              Say "Hey NEXTLOOK"
            </motion.p>
          </motion.div>
        )}

        {step === "wake" && (
          <motion.div
            key="wake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-primary/25 border border-primary/50 flex items-center justify-center"
            >
              <Mic className="w-6 h-6 text-cream" />
            </motion.div>
            <div className="flex items-end gap-1 h-6">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-gold/80"
                  animate={{ height: ["20%", "100%", "35%"] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.09,
                  }}
                  style={{ height: "40%" }}
                />
              ))}
            </div>
            <p className="text-[11px] text-cream/80 font-body">
              "Show me braids for Friday"
            </p>
          </motion.div>
        )}

        {step === "daily" && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-5"
          >
            <div className="text-center">
              <p className="text-4xl font-display text-cream leading-none">7:42</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-cream/50 font-body mt-1">
                Friday morning
              </p>
            </div>
            <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/40 flex items-center justify-center">
                <Music className="w-4 h-4 text-cream" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-cream font-body">Morning Glow</p>
                <div className="h-1 mt-1.5 rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-gold"
                    animate={{ width: ["10%", "85%"] }}
                    transition={{ duration: 3.4, ease: "linear" }}
                  />
                </div>
              </div>
              <Clock className="w-4 h-4 text-cream/50" />
            </div>
          </motion.div>
        )}

        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 10%, hsl(280 70% 40% / 0.55), transparent 55%), radial-gradient(ellipse at 80% 90%, hsl(260 80% 25% / 0.7), transparent 60%), linear-gradient(135deg, hsl(270 70% 12%) 0%, hsl(275 65% 25%) 40%, hsl(268 60% 15%) 100%)",
            }}
          >
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="font-display font-bold tracking-[0.15em] text-center leading-none text-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #8A6A1F 0%, #E8CF7A 35%, #FFF3C4 50%, #C5A55A 65%, #8A6A1F 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              NEXTLOOK
            </motion.p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70 font-body">
              Try On Hair Styles
            </p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-widest font-body"
              style={{
                backgroundImage: "linear-gradient(135deg, #8A6A1F 0%, #E8CF7A 50%, #B8892E 100%)",
                color: "#2A1150",
                border: "1px solid rgba(255,243,196,0.5)",
              }}
            >
              Get Started
            </motion.div>
          </motion.div>
        )}

        {step === "tryon" && (
          <motion.div
            key="tryon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col px-4 pt-16 pb-4"
          >
            {/* Category tabs — matches real Try-On page */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {["Wig Frontal", "Braids", "Curls", "Makeup"].map((c, i) => (
                <motion.span
                  key={c}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-body font-semibold ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-cream/70 border border-white/15"
                  }`}
                >
                  {c}
                </motion.span>
              ))}
            </div>

            {/* Model preview with scan line */}
            <div className="relative flex-1 mt-3 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <div className="absolute left-1/2 -translate-x-1/2 top-[16%] w-24 h-28 rounded-[3rem] border border-gold/50" />
              <motion.div
                className="absolute left-0 right-0 h-14 bg-gradient-to-b from-transparent via-gold/25 to-transparent"
                animate={{ top: ["8%", "72%", "8%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute top-2 left-2 bg-black/50 rounded-full px-2.5 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                <span className="text-[9px] text-cream font-body">Body Wave 18"</span>
              </div>

              {/* Thumbnail strip */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[8px] text-cream/50 font-body mb-1">Tap to switch hair</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`w-8 h-10 rounded-md ${
                        i === 1
                          ? "ring-2 ring-gold bg-gold/30"
                          : "ring-1 ring-white/25 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Real page CTAs */}
            <div className="flex gap-2 mt-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 rounded-full bg-primary px-3 py-2 text-center text-[10px] font-semibold text-primary-foreground font-body flex items-center justify-center gap-1"
              >
                <Scissors className="w-3 h-3" /> Select a Stylist
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex-1 rounded-full bg-gold px-3 py-2 text-center text-[10px] font-semibold text-charcoal font-body flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" /> Buy Hair
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === "shop" && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-center gap-4"
          >
            <p className="px-5 text-[10px] uppercase tracking-[0.25em] text-cream/60 font-body">
              Hair Extensions Near You
            </p>
            {/* Sliding product row — like the website */}
            <motion.div
              className="flex gap-3 pl-5"
              animate={{ x: ["0%", "-38%"] }}
              transition={{ duration: 3.2, ease: "easeInOut" }}
            >
              {[
                { name: "Raw Body Wave", detail: '18" · Natural black', price: "$90" },
                { name: "K Tips Raw Hair", detail: "100g · 18\"", price: "$130" },
                { name: "3 Bundle Brazilian", detail: '16" 18" 20"', price: "$280" },
                { name: "Pineapple Curls", detail: "4 bundles", price: "$210" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="w-28 flex-shrink-0 rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 overflow-hidden"
                >
                  <div className="h-16 bg-gradient-to-br from-gold/30 to-primary/30 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-cream/70" />
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] text-cream font-body leading-tight">{p.name}</p>
                    <p className="text-[8px] text-cream/55 font-body">{p.detail}</p>
                    <p className="text-[10px] text-gold font-body font-semibold mt-1">{p.price}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="px-5">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="rounded-full bg-gold px-5 py-2 text-center text-[11px] font-semibold text-charcoal font-body"
              >
                Add to cart · $155
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === "book" && (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-center gap-3 px-5"
          >
            {/* Stylist card — like the booking page */}
            <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/50 to-primary/50 border border-gold/50 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-cream" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-cream font-body font-semibold">Simone</p>
                <p className="text-[9px] text-gold font-body">Golden Crown Stylist · 4.9 ★</p>
              </div>
              <Navigation className="w-3.5 h-3.5 text-cream/50" />
            </div>

            {/* Her services list */}
            <div className="space-y-2">
              {[
                { name: "Wig Installation", price: "$180", time: "2 hrs" },
                { name: "Sew-In Install", price: "$150", time: "2.5 hrs" },
                { name: "Braid Touch-Up", price: "$65", time: "1 hr" },
              ].map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.12 }}
                  className={`rounded-xl px-3 py-2.5 flex items-center justify-between border ${
                    i === 0
                      ? "bg-gold/20 border-gold/60"
                      : "bg-white/8 border-white/15"
                  }`}
                >
                  <div>
                    <p className="text-[10px] text-cream font-body">{s.name}</p>
                    <p className="text-[8px] text-cream/55 font-body">{s.time}</p>
                  </div>
                  <p className={`text-[10px] font-body font-semibold ${i === 0 ? "text-gold" : "text-cream/80"}`}>
                    {s.price}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Time picker */}
            <div className="flex items-center gap-2 text-cream font-body text-[10px] mt-1">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              Friday 11:00 AM
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {["Thu 10am", "Thu 2pm", "Fri 9am", "Fri 11am", "Sat 12pm", "Sat 3pm"].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={`rounded-lg px-2 py-2 text-center text-[9px] font-body border ${
                    i === 3
                      ? "bg-gold text-charcoal border-gold font-semibold"
                      : "bg-white/10 text-cream/80 border-white/20"
                  }`}
                >
                  {t}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "pay" && (
          <motion.div
            key="pay"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
          >
            <div className="w-full rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold" />
                <span className="text-[11px] text-cream font-body">Secure checkout</span>
              </div>
              <div className="rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-[11px] text-cream/70 font-body tracking-widest">
                •••• •••• •••• 4242
              </div>
              <div className="flex justify-between text-[10px] font-body text-cream/70">
                <span>Hair + Install</span>
                <span className="text-cream">$335</span>
              </div>
              <div className="flex justify-between text-[10px] font-body text-cream/70">
                <span>Free install (REPENTNOW)</span>
                <span className="text-gold">−$180</span>
              </div>
              <div className="h-px bg-white/15" />
              <div className="flex justify-between text-[11px] font-body font-semibold text-cream">
                <span>Total</span>
                <span className="text-gold">$155</span>
              </div>
            </div>
            <motion.div
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="rounded-full bg-gold px-6 py-2 text-[11px] font-semibold text-charcoal font-body"
            >
              Pay now
            </motion.div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-gold" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm text-cream font-body font-semibold">You're booked!</p>
              <p className="text-[10px] text-cream/70 font-body mt-1">
                Simone · Friday 11:00 AM · Confirmation sent
              </p>
            </div>
            <div className="rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] text-gold font-body">
              Golden Crown Stylist
            </div>
          </motion.div>
        )}

        {step === "arriving" && (
          <motion.div
            key="arriving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5"
          >
            {/* Map-ish grid */}
            <div className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 2.6, repeat: Infinity }}
              className="relative z-10 w-12 h-12 rounded-full bg-primary/40 border border-primary/60 flex items-center justify-center"
            >
              <Navigation className="w-5 h-5 text-cream" />
            </motion.div>
            <div className="relative z-10 rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 text-center">
              <p className="text-[11px] text-cream font-body">
                Simone is on the way
              </p>
              <p className="text-[10px] text-gold font-body mt-0.5">
                Arriving in 12 min
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step label + progress dots */}
      <div className="absolute top-9 left-0 right-0 z-30 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Sparkles className="w-3 h-3 text-gold" />
          <span className="text-[9px] font-semibold text-cream font-body">
            {steps[index].label}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "w-5 bg-gold" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MirrorExperience;
