import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, User, Camera, Calendar, DollarSign } from "lucide-react";

// Animated phone mockup that cycles through the stylist signup steps.
const steps = [
  {
    key: "visit",
    label: "1. Visit nextlookbeauty.com",
    accent: "Tap 'Join as a Stylist'",
    icon: Sparkles,
    body: (
      <div className="w-full h-full flex flex-col">
        <div className="text-[10px] font-body text-cream/60 mb-2">nextlookbeauty.com</div>
        <div className="text-lg font-display font-bold text-cream leading-tight">
          Beauty That<br />
          <span className="text-gradient-rose">Comes to You</span>
        </div>
        <div className="mt-auto space-y-2">
          <div className="h-9 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
            Join as a Stylist
          </div>
          <div className="h-8 rounded-full border border-cream/30 flex items-center justify-center text-[10px] text-cream/80">
            Find a Stylist
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "signup",
    label: "2. Create your account",
    accent: "Name, phone, city — 60 seconds",
    icon: User,
    body: (
      <div className="w-full h-full flex flex-col gap-2">
        <div className="text-sm font-display font-bold text-cream">Sign up</div>
        {["Full name", "Phone number", "City"].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.15 }}
            className="rounded-lg bg-cream/10 border border-cream/20 px-3 py-2"
          >
            <div className="text-[9px] text-cream/50 uppercase tracking-wider">{label}</div>
            <div className="h-2 mt-1 rounded-full bg-cream/30 w-3/4" />
          </motion.div>
        ))}
        <div className="mt-auto h-9 rounded-full bg-primary flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
          Continue
        </div>
      </div>
    ),
  },
  {
    key: "portfolio",
    label: "3. Upload your portfolio",
    accent: "Show off your best work",
    icon: Camera,
    body: (
      <div className="w-full h-full flex flex-col">
        <div className="text-sm font-display font-bold text-cream mb-2">Portfolio</div>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-md bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/40 border border-cream/20"
            />
          ))}
        </div>
        <div className="mt-2 h-8 rounded-full bg-cream/15 border border-cream/25 flex items-center justify-center text-[10px] text-cream">
          + Add photo
        </div>
      </div>
    ),
  },
  {
    key: "verify",
    label: "4. Get verified",
    accent: "Subscribe $50/mo → Golden Crown",
    icon: Calendar,
    body: (
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F4E29A] via-[#C5A55A] to-[#8A6E2A] flex items-center justify-center shadow-lg ring-2 ring-[#FFF6D1]/60">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
        <div className="mt-3 text-sm font-display font-bold text-cream">Verified Stylist</div>
        <div className="text-[10px] font-body text-cream/60 mt-1">$50 / month · Golden Crown badge</div>
        <div className="mt-3 h-8 px-3 rounded-full bg-gradient-to-r from-[#F4E29A] to-[#C5A55A] flex items-center justify-center text-[10px] font-bold text-[#3D1A6E]">
          Activate subscription
        </div>
      </div>
    ),
  },
  {
    key: "earn",
    label: "5. Get booked & paid",
    accent: "80% of every booking",
    icon: DollarSign,
    body: (
      <div className="w-full h-full flex flex-col">
        <div className="text-sm font-display font-bold text-cream">Today's bookings</div>
        <div className="mt-2 space-y-2 flex-1">
          {[
            { name: "Ava · Knotless braids", price: "$180" },
            { name: "Jade · Sew-in weave", price: "$240" },
            { name: "Nia · Silk press", price: "$95" },
          ].map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.12 }}
              className="flex items-center justify-between rounded-lg bg-cream/10 border border-cream/15 px-2.5 py-2"
            >
              <div className="text-[10px] text-cream/90 font-body">{b.name}</div>
              <div className="text-[11px] font-bold text-gold">{b.price}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-primary/30 border border-primary/50 px-3 py-2 flex items-center justify-between">
          <div className="text-[10px] text-cream/80">Payout today</div>
          <div className="text-sm font-bold text-cream">$412</div>
        </div>
      </div>
    ),
  },
];

const PhoneWalkthrough = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), 3600);
    return () => clearInterval(t);
  }, []);

  const step = steps[i];
  const Icon = step.icon;

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
      {/* Phone frame */}
      <div className="relative shrink-0">
        {/* Glow */}
        <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative w-[260px] h-[540px] rounded-[44px] bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] p-3 shadow-2xl ring-1 ring-cream/10">
          {/* Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black z-20" />
          {/* Screen */}
          <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-b from-charcoal via-[#1f1428] to-charcoal p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full pt-6"
              >
                {step.body}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 w-full">
        <div className="text-xs uppercase tracking-widest text-primary font-body font-semibold mb-3">
          A quick walkthrough
        </div>
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          From signup to first payout — right on your phone
        </h3>
        <div className="space-y-2">
          {steps.map((s, idx) => {
            const active = idx === i;
            const SIcon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setI(idx)}
                className={`w-full text-left flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/60 bg-card hover:border-primary/30"
                }`}
              >
                <div
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <SIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-foreground">{s.label}</div>
                  <div className="text-sm text-muted-foreground font-body">{s.accent}</div>
                </div>
                {active && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-2 h-2 rounded-full bg-primary mt-3"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhoneWalkthrough;
