// MirrorExperience - animated NEXTLOOK Smart Mirror walkthrough
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  Mic,
  Music,
  Navigation,
  ScanFace,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

type Step = { id: string; label: string };

const steps: Step[] = [
  { id: "brand", label: "NEXTLOOK" },
  { id: "welcome", label: "Welcome" },
  { id: "mirror-home", label: "Your smart mirror" },
  { id: "choose", label: "Choose your try-on" },
  { id: "beauty-scan", label: "Scan your face" },
  { id: "beauty-result", label: "Try on hair" },
  { id: "beauty-choice", label: "Choose what comes next" },
  { id: "apparel-scan", label: "Scan your body" },
  { id: "apparel-styles", label: "Choose your style" },
  { id: "shop", label: "Browse products" },
  { id: "book", label: "Book your stylist" },
  { id: "pay", label: "Secure checkout" },
  { id: "confirm", label: "You're booked" },
  { id: "arriving", label: "Stylist on the way" },
];

const STEP_MS = 3600;

const GoldWordmark = ({ small = false }: { small?: boolean }) => (
  <p
    className={`font-logo font-bold text-center leading-none ${small ? "text-xl" : "text-4xl"}`}
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
  </p>
);

const MirrorExperience = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % steps.length),
      STEP_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  const step = steps[index]?.id ?? "brand";

  return (
    <div className="relative h-full w-full overflow-hidden bg-charcoal">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 35%, hsl(280 20% 32% / 0.9), transparent 65%), linear-gradient(160deg, hsl(270 18% 14%) 0%, hsl(270 12% 8%) 100%)",
        }}
      />
      <div className="absolute left-1/2 top-[22%] h-28 w-28 -translate-x-1/2 rounded-full bg-cream/[0.06] blur-md" />
      <div className="absolute left-1/2 top-[46%] h-52 w-44 -translate-x-1/2 rounded-t-[6rem] bg-cream/[0.05] blur-lg" />
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 35%, hsl(0 0% 100% / 0.18) 50%, transparent 65%)",
        }}
        animate={{ x: ["-40%", "40%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-primary/40" />

      <AnimatePresence mode="wait">
        {step === "brand" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 10%, hsl(280 70% 40% / 0.55), transparent 55%), radial-gradient(ellipse at 80% 90%, hsl(260 80% 25% / 0.7), transparent 60%), linear-gradient(135deg, hsl(270 70% 12%) 0%, hsl(275 65% 25%) 40%, hsl(268 60% 15%) 100%)",
            }}
          >
            <motion.div initial={{ scale: 0.82 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
              <GoldWordmark />
            </motion.div>
            <p className="font-body text-[9px] uppercase tracking-[0.28em] text-cream/70">
              Beauty on demand
            </p>
          </motion.div>
        )}

        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-primary px-7 text-center"
          >
            <Sparkles className="h-8 w-8 text-gold" />
            <GoldWordmark small />
            <div>
              <p className="font-display text-2xl font-bold leading-tight text-cream">Welcome to</p>
              <p className="font-display text-2xl font-bold leading-tight text-cream">NEXTLOOK Virtual Try-On</p>
            </div>
            <div className="rounded-full bg-gold px-6 py-2 font-body text-[10px] font-bold uppercase text-charcoal">
              Get Started
            </div>
          </motion.div>
        )}

        {step === "mirror-home" && (
          <motion.div
            key="mirror-home"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col px-5 pb-5 pt-16"
          >
            <div className="text-center">
              <p className="font-display text-4xl leading-none text-cream">9:30</p>
              <p className="mt-1 font-body text-[9px] uppercase tracking-[0.2em] text-cream/60">Good morning</p>
            </div>
            <div className="mt-4 rounded-xl border border-gold/35 bg-charcoal/45 p-3 text-center backdrop-blur-md">
              <BookOpen className="mx-auto mb-1 h-4 w-4 text-gold" />
              <p className="font-display text-[12px] leading-snug text-cream">“I am fearfully and wonderfully made.”</p>
              <p className="mt-1 font-body text-[8px] text-gold">Psalm 139:14</p>
            </div>
            <div className="mt-3 rounded-xl border border-cream/15 bg-cream/10 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold/25">
                  <Music className="h-4 w-4 text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[9px] text-cream">Apple Music</p>
                  <p className="truncate font-body text-[8px] text-cream/55">Worship & Inspiration</p>
                </div>
                <Headphones className="h-4 w-4 text-cream/60" />
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream/15">
                <motion.div className="h-full bg-gold" animate={{ width: ["8%", "86%"] }} transition={{ duration: 3.2 }} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-cream/70">
              <Mic className="h-4 w-4 text-gold" />
              <p className="font-body text-[8px]">“Hey NEXTLOOK, play my music.”</p>
              <Clock className="h-3 w-3" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="mt-auto rounded-full border border-gold/60 bg-gold px-4 py-2 text-center font-body text-[10px] font-bold uppercase text-charcoal"
            >
              Open Virtual Try-On
            </motion.div>
          </motion.div>
        )}

        {step === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center px-5">
            <p className="text-center font-display text-xl font-bold text-cream">What would you like to try?</p>
            <p className="mt-1 text-center font-body text-[9px] text-cream/60">Choose your virtual fitting experience</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { title: "Beauty", detail: "Hair & makeup", icon: Sparkles },
                { title: "Apparel", detail: "Clothing & fit", icon: Shirt },
              ].map(({ title, detail, icon: Icon }, optionIndex) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: optionIndex * 0.18 }}
                  className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border p-3 text-center ${optionIndex === 0 ? "border-gold bg-gold/20" : "border-cream/20 bg-cream/10"}`}
                >
                  <Icon className={`h-7 w-7 ${optionIndex === 0 ? "text-gold" : "text-cream"}`} />
                  <p className="mt-3 font-display text-base font-bold text-cream">{title}</p>
                  <p className="font-body text-[8px] text-cream/55">{detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "beauty-scan" && (
          <motion.div key="beauty-scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center px-5">
            <div className="relative h-52 w-40 overflow-hidden rounded-[4rem] border border-gold/55 bg-cream/10">
              <UserRound className="absolute inset-x-0 bottom-0 mx-auto h-40 w-40 text-cream/15" />
              <div className="absolute left-1/2 top-8 h-24 w-20 -translate-x-1/2 rounded-[3rem] border border-gold/60" />
              <motion.div className="absolute left-2 right-2 h-12 bg-gradient-to-b from-transparent via-gold/45 to-transparent" animate={{ top: ["8%", "76%", "8%"] }} transition={{ duration: 2.6, repeat: Infinity }} />
              <div className="absolute inset-x-0 top-1/2 flex justify-center">
                <ScanFace className="h-7 w-7 text-gold" />
              </div>
            </div>
            <p className="mt-4 font-display text-base font-bold text-cream">Scanning your face</p>
            <p className="mt-1 text-center font-body text-[9px] text-cream/60">Finding your features for a natural hair try-on</p>
          </motion.div>
        )}

        {step === "beauty-result" && (
          <motion.div key="beauty-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col px-4 pb-4 pt-16">
            <div className="flex flex-wrap justify-center gap-1.5">
              {["Wig Frontal", "Braids", "Weave", "Makeup"].map((category, categoryIndex) => (
                <span key={category} className={`rounded-full px-2 py-1 font-body text-[8px] font-semibold ${categoryIndex === 0 ? "bg-gold text-charcoal" : "border border-cream/15 bg-cream/10 text-cream/70"}`}>{category}</span>
              ))}
            </div>
            <div className="relative mt-3 flex-1 overflow-hidden rounded-2xl border border-cream/10 bg-cream/5">
              <UserRound className="absolute inset-x-0 bottom-1 mx-auto h-48 w-48 text-cream/15" />
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-charcoal/65 px-2 py-1">
                <Sparkles className="h-3 w-3 text-gold" />
                <span className="font-body text-[8px] text-cream">Body Wave 18&quot;</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="mb-1 font-body text-[8px] text-cream/55">Slide to switch your hair</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className={`h-10 w-8 rounded-md ${item === 1 ? "bg-gold/35 ring-2 ring-gold" : "bg-cream/10 ring-1 ring-cream/25"}`} />)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "beauty-choice" && (
          <motion.div key="beauty-choice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center px-5">
            <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-3 text-center font-display text-xl font-bold text-cream">Love your new look?</p>
            <p className="mt-1 text-center font-body text-[9px] text-cream/60">Choose one option or get the complete look</p>
            <div className="mt-5 space-y-2">
              {[
                { name: "Book a Stylist", detail: "Professional installation", icon: Scissors },
                { name: "Purchase Hair", detail: "Buy the hair you tried on", icon: ShoppingBag },
                { name: "Hair + Stylist", detail: "Get both together", icon: Sparkles },
              ].map(({ name, detail, icon: Icon }, choiceIndex) => (
                <motion.div key={name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: choiceIndex * 0.13 }} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${choiceIndex === 2 ? "border-gold bg-gold/20" : "border-cream/15 bg-cream/10"}`}>
                  <Icon className="h-5 w-5 text-gold" />
                  <div><p className="font-body text-[10px] font-semibold text-cream">{name}</p><p className="font-body text-[8px] text-cream/55">{detail}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "apparel-scan" && (
          <motion.div key="apparel-scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center px-5">
            <div className="relative h-56 w-32">
              <UserRound className="h-full w-full text-cream/20" />
              <div className="absolute inset-1 rounded-[3rem] border border-gold/55" />
              {["top-12", "top-24", "top-40"].map((position, lineIndex) => <motion.div key={position} className={`absolute left-0 right-0 ${position} h-px bg-gold`} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.2, repeat: Infinity, delay: lineIndex * 0.2 }} />)}
            </div>
            <p className="mt-3 font-display text-base font-bold text-cream">Finding your body type</p>
            <div className="mt-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 font-body text-[9px] text-gold">Personal fit match in progress</div>
          </motion.div>
        )}

        {step === "apparel-styles" && (
          <motion.div key="apparel-styles" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center px-4">
            <p className="text-center font-display text-lg font-bold text-cream">Styles selected for your shape</p>
            <p className="mt-1 text-center font-body text-[8px] text-cream/55">Choose the clothing style you want to try</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {["Elegant", "Streetwear", "Workwear", "Evening", "Casual", "Faith Edit"].map((styleName, styleIndex) => (
                <motion.div key={styleName} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: styleIndex * 0.08 }} className={`flex h-24 flex-col items-center justify-center rounded-xl border ${styleIndex === 0 ? "border-gold bg-gold/20" : "border-cream/15 bg-cream/10"}`}>
                  <Shirt className={`h-7 w-7 ${styleIndex === 0 ? "text-gold" : "text-cream/60"}`} />
                  <p className="mt-2 font-body text-[8px] text-cream">{styleName}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 rounded-full bg-gold px-5 py-2 text-center font-body text-[10px] font-bold text-charcoal">Try Selected Outfit</div>
          </motion.div>
        )}

        {step === "shop" && (
          <motion.div key="shop" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center gap-4">
            <p className="px-5 font-logo text-base uppercase text-cream">Hair Extensions Near You</p>
            <motion.div className="flex gap-3 pl-5" animate={{ x: ["0%", "-42%"] }} transition={{ duration: 3.2, ease: "easeInOut" }}>
              {[
                { name: "Raw Body Wave", detail: '18" · Natural black', price: "$90" },
                { name: "K Tips Raw Hair", detail: '100g · 18"', price: "$130" },
                { name: "3 Bundle Brazilian", detail: '16" 18" 20"', price: "$280" },
                { name: "Pineapple Curls", detail: "4 bundles", price: "$210" },
              ].map((product) => (
                <div key={product.name} className="w-28 flex-shrink-0 overflow-hidden rounded-xl border border-cream/15 bg-cream/10 backdrop-blur-md">
                  <div className="flex h-16 items-center justify-center bg-gold/20"><ShoppingBag className="h-5 w-5 text-gold" /></div>
                  <div className="p-2"><p className="font-body text-[9px] leading-tight text-cream">{product.name}</p><p className="font-body text-[8px] text-cream/55">{product.detail}</p><p className="mt-1 font-body text-[10px] font-semibold text-gold">{product.price}</p></div>
                </div>
              ))}
            </motion.div>
            <div className="px-5"><div className="rounded-full bg-gold px-5 py-2 text-center font-body text-[10px] font-bold text-charcoal">Add selected hair to cart</div></div>
          </motion.div>
        )}

        {step === "book" && (
          <motion.div key="book" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col justify-center gap-3 px-5">
            <div className="flex items-center gap-3 rounded-xl border border-cream/15 bg-cream/10 p-3 backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-gold/20"><Scissors className="h-4 w-4 text-gold" /></div>
              <div className="flex-1"><p className="font-body text-[11px] font-semibold text-cream">Simone</p><p className="font-body text-[8px] text-gold">Golden Crown Stylist · 4.9 ★</p></div>
              <Navigation className="h-3.5 w-3.5 text-cream/50" />
            </div>
            <p className="font-display text-sm font-bold text-cream">Select a service</p>
            {[
              { name: "Wig Installation", price: "$180", time: "2 hrs" },
              { name: "Sew-In Install", price: "$150", time: "2.5 hrs" },
              { name: "Braid Touch-Up", price: "$65", time: "1 hr" },
            ].map((service, serviceIndex) => (
              <div key={service.name} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${serviceIndex === 0 ? "border-gold/60 bg-gold/20" : "border-cream/15 bg-cream/10"}`}>
                <div><p className="font-body text-[9px] text-cream">{service.name}</p><p className="font-body text-[8px] text-cream/55">{service.time}</p></div><p className="font-body text-[10px] font-semibold text-gold">{service.price}</p>
              </div>
            ))}
            <div className="mt-1 flex items-center gap-2 font-body text-[9px] text-cream"><Calendar className="h-3.5 w-3.5 text-gold" /> Friday · 11:00 AM</div>
          </motion.div>
        )}

        {step === "pay" && (
          <motion.div key="pay" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-full space-y-2.5 rounded-2xl border border-cream/15 bg-cream/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-gold" /><span className="font-body text-[11px] text-cream">Secure checkout</span></div>
              <div className="rounded-lg border border-cream/15 bg-cream/10 px-3 py-2 font-body text-[10px] tracking-widest text-cream/70">•••• •••• •••• 4242</div>
              <div className="flex justify-between font-body text-[9px] text-cream/70"><span>Hair + Install</span><span>$335</span></div>
              <div className="flex justify-between font-body text-[9px] text-cream/70"><span>Free install (REPENTNOW)</span><span className="text-gold">−$180</span></div>
              <div className="h-px bg-cream/15" />
              <div className="flex justify-between font-body text-[11px] font-semibold text-cream"><span>Total</span><span className="text-gold">$155</span></div>
            </div>
            <div className="rounded-full bg-gold px-6 py-2 font-body text-[10px] font-bold text-charcoal">Pay now</div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-gold/20"><CheckCircle2 className="h-8 w-8 text-gold" /></motion.div>
            <div className="text-center"><p className="font-body text-sm font-semibold text-cream">You’re booked!</p><p className="mt-1 font-body text-[9px] text-cream/70">Hair purchased · Simone · Friday at 11:00 AM</p></div>
            <div className="rounded-full border border-cream/15 bg-cream/10 px-4 py-1.5 font-body text-[8px] uppercase tracking-[0.18em] text-gold">Confirmation sent</div>
          </motion.div>
        )}

        {step === "arriving" && (
          <motion.div key="arriving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5">
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 2.6, repeat: Infinity }} className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 bg-gold/20"><Navigation className="h-5 w-5 text-gold" /></motion.div>
            <div className="relative z-10 rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-center backdrop-blur-md"><p className="font-body text-[11px] text-cream">Simone is on the way</p><p className="mt-0.5 font-body text-[10px] text-gold">Arriving in 12 minutes</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute left-0 right-0 top-8 z-30 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-charcoal/45 px-2.5 py-1 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="font-body text-[8px] font-semibold text-cream">{steps[index]?.label}</span>
        </div>
        <div className="flex max-w-[85%] gap-1">
          {steps.map((item, stepIndex) => (
            <span key={item.id} className={`h-1 rounded-full transition-all duration-500 ${stepIndex === index ? "w-4 bg-gold" : "w-1 bg-cream/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MirrorExperience;
