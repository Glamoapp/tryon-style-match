import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Headphones,
  Heart,
  Mic,
  Music,
  Ruler,
  ScanFace,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Screen =
  | "brand"
  | "welcome"
  | "lifestyle"
  | "category"
  | "beauty-permission"
  | "beauty-scan"
  | "beauty-looks"
  | "beauty-action"
  | "apparel-permission"
  | "measurements"
  | "body-scan"
  | "apparel-styles"
  | "outfit-preview"
  | "complete";

const screenLabels: Record<Screen, string> = {
  brand: "NEXTLOOK",
  welcome: "Welcome",
  lifestyle: "Your smart mirror",
  category: "Choose a category",
  "beauty-permission": "Camera permission",
  "beauty-scan": "Face and head scan",
  "beauty-looks": "Choose your look",
  "beauty-action": "Complete your look",
  "apparel-permission": "Fit setup",
  measurements: "Your measurements",
  "body-scan": "Body scan",
  "apparel-styles": "Style recommendations",
  "outfit-preview": "Virtual outfit",
  complete: "Saved",
};

const GoldWordmark = ({ compact = false }: { compact?: boolean }) => (
  <p className={`${compact ? "text-2xl" : "text-5xl"} bg-gradient-to-r from-gold via-cream to-gold bg-clip-text text-center font-logo font-bold leading-none text-transparent`}>
    NEXTLOOK
  </p>
);

const MirrorExperience = () => {
  const [screen, setScreen] = useState<Screen>("brand");
  const [history, setHistory] = useState<Screen[]>([]);
  const [hair, setHair] = useState("Body Wave");
  const [hairColor, setHairColor] = useState("Natural Black");
  const [style, setStyle] = useState("Elegant");
  const [completion, setCompletion] = useState("Your look is saved");

  const navigate = (next: Screen) => {
    setHistory((current) => [...current, screen]);
    setScreen(next);
  };

  const back = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setScreen(previous);
  };

  useEffect(() => {
    if (screen !== "brand" && screen !== "welcome" && screen !== "beauty-scan" && screen !== "body-scan") return;
    const next: Screen = screen === "brand" ? "welcome" : screen === "welcome" ? "lifestyle" : screen === "beauty-scan" ? "beauty-looks" : "apparel-styles";
    const duration = screen === "welcome" ? 3000 : screen === "brand" ? 2200 : 2800;
    const timer = window.setTimeout(() => navigate(next), duration);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const progress = useMemo(() => {
    const path: Screen[] = screen.startsWith("apparel") || ["measurements", "body-scan", "outfit-preview"].includes(screen)
      ? ["lifestyle", "category", "apparel-permission", "body-scan", "apparel-styles", "outfit-preview"]
      : ["lifestyle", "category", "beauty-permission", "beauty-scan", "beauty-looks", "beauty-action"];
    return Math.max(1, path.indexOf(screen) + 1);
  }, [screen]);

  const finish = (message: string) => {
    setCompletion(message);
    navigate("complete");
  };

  const navVisible = !["brand", "welcome", "lifestyle", "complete"].includes(screen);

  return (
    <div className="relative h-full w-full overflow-hidden bg-purple-deep text-cream">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-purple-deep to-charcoal" />
      <div className="absolute inset-x-0 top-0 z-30 flex h-12 items-end justify-center pb-1.5">
        <span className="rounded-full bg-charcoal/55 px-3 py-1 font-body text-[8px] font-semibold backdrop-blur-md">
          {screenLabels[screen]}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="absolute inset-0 z-10 flex flex-col px-4 pb-5 pt-14"
        >
          {screen === "brand" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
              <GoldWordmark />
              <p className="font-body text-[9px] uppercase tracking-[0.2em] text-cream/70">Beauty on demand</p>
            </div>
          )}

          {screen === "welcome" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
              <Sparkles className="h-9 w-9 text-gold" />
              <GoldWordmark compact />
              <h3 className="max-w-[220px] font-display text-2xl font-bold leading-tight">Welcome to NextLook Virtual Try-On</h3>
              <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-cream/20">
                <motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "linear" }} />
              </div>
            </div>
          )}

          {screen === "lifestyle" && (
            <div className="flex flex-1 flex-col">
              <div className="text-center">
                <p className="font-display text-4xl leading-none">9:30</p>
                <p className="mt-1 font-body text-[9px] uppercase tracking-[0.16em] text-cream/60">Good morning, beautiful</p>
              </div>
              <div className="mt-4 rounded-xl border border-gold/30 bg-charcoal/40 p-3 text-center backdrop-blur-md">
                <BookOpen className="mx-auto mb-1 h-4 w-4 text-gold" />
                <p className="font-display text-[12px] leading-snug">“I am fearfully and wonderfully made.”</p>
                <p className="mt-1 font-body text-[8px] text-gold">Psalm 139:14</p>
              </div>
              <div className="mt-3 rounded-xl border border-cream/15 bg-cream/10 p-3">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-gold" />
                  <div className="min-w-0 flex-1"><p className="font-body text-[9px]">Apple Music</p><p className="truncate font-body text-[8px] text-cream/55">Worship & Inspiration</p></div>
                  <Headphones className="h-4 w-4 text-cream/60" />
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream/15"><motion.div className="h-full bg-gold" animate={{ width: ["12%", "82%"] }} transition={{ duration: 5, repeat: Infinity }} /></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-cream/10 p-2 text-center"><Mic className="mx-auto h-4 w-4 text-gold" /><p className="mt-1 font-body text-[8px]">Voice assistant</p></div>
                <div className="rounded-lg bg-cream/10 p-2 text-center"><Clock className="mx-auto h-4 w-4 text-gold" /><p className="mt-1 font-body text-[8px]">Time & weather</p></div>
              </div>
              <Button onClick={() => navigate("category")} variant="gold" size="sm" className="mt-auto w-full text-[10px] font-bold uppercase">Open Virtual Try-On <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
            </div>
          )}

          {screen === "category" && (
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="text-center font-display text-xl font-bold">What would you like to try?</h3>
              <p className="mt-1 text-center font-body text-[9px] text-cream/60">Choose an experience to begin</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => navigate("beauty-permission")} className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-gold bg-gold/15 p-3 text-cream">
                  <Sparkles className="h-8 w-8 text-gold" /><span className="mt-3 font-display text-base font-bold">Beauty</span><span className="font-body text-[8px] text-cream/60">Hair, wigs & color</span>
                </button>
                <button onClick={() => navigate("apparel-permission")} className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-cream/20 bg-cream/10 p-3 text-cream">
                  <Shirt className="h-8 w-8 text-gold" /><span className="mt-3 font-display text-base font-bold">Apparel</span><span className="font-body text-[8px] text-cream/60">Clothing & fit</span>
                </button>
              </div>
            </div>
          )}

          {(screen === "beauty-permission" || screen === "apparel-permission") && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15"><Camera className="h-7 w-7 text-gold" /></div>
              <h3 className="mt-4 font-display text-xl font-bold">Camera permission</h3>
              <p className="mt-2 max-w-[230px] font-body text-[9px] leading-relaxed text-cream/65">
                {screen === "beauty-permission" ? "We use the camera to map your face and head so hair sits naturally. Your scan starts only after you allow it." : "We use the camera to understand proportions and recommend a comfortable fit. Your scan starts only after you allow it."}
              </p>
              <div className="mt-5 w-full space-y-2">
                <Button onClick={() => navigate(screen === "beauty-permission" ? "beauty-scan" : "body-scan")} variant="gold" size="sm" className="w-full text-[10px]"><Camera className="mr-1.5 h-3.5 w-3.5" />Allow Camera</Button>
                {screen === "apparel-permission" && <Button onClick={() => navigate("measurements")} variant="hero-outline" size="sm" className="w-full text-[10px]"><Ruler className="mr-1.5 h-3.5 w-3.5" />Enter Measurements</Button>}
                <Button onClick={() => navigate(screen === "beauty-permission" ? "beauty-looks" : "apparel-styles")} variant="ghost" size="sm" className="w-full text-[9px] text-cream/60">Skip for now</Button>
              </div>
            </div>
          )}

          {(screen === "beauty-scan" || screen === "body-scan") && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className={`relative overflow-hidden border border-gold/60 bg-cream/10 ${screen === "beauty-scan" ? "h-48 w-36 rounded-[4rem]" : "h-52 w-28 rounded-[3rem]"}`}>
                <UserRound className="absolute inset-x-0 bottom-0 mx-auto h-full w-full text-cream/15" />
                <motion.div className="absolute left-1 right-1 h-12 bg-gradient-to-b from-transparent via-gold/55 to-transparent" animate={{ top: ["4%", "78%", "4%"] }} transition={{ duration: 2.2, repeat: Infinity }} />
                <ScanFace className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-gold" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{screen === "beauty-scan" ? "Scanning face & head" : "Creating your fit profile"}</h3>
              <p className="mt-1 font-body text-[9px] text-cream/60">Keep still while we find your best match</p>
            </div>
          )}

          {screen === "measurements" && (
            <div className="flex flex-1 flex-col justify-center">
              <Ruler className="mx-auto h-8 w-8 text-gold" /><h3 className="mt-3 text-center font-display text-xl font-bold">Enter your measurements</h3>
              <p className="mt-1 text-center font-body text-[8px] text-cream/60">Used only to improve size and fit recommendations</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {["Height", "Bust", "Waist", "Hips"].map((label) => <label key={label} className="rounded-lg border border-cream/15 bg-cream/10 p-2 font-body text-[8px] text-cream/60">{label}<span className="mt-1 block text-[10px] text-cream">Enter inches</span></label>)}
              </div>
              <Button onClick={() => navigate("apparel-styles")} variant="gold" size="sm" className="mt-4 w-full text-[10px]">Continue</Button>
            </div>
          )}

          {screen === "beauty-looks" && (
            <div className="flex flex-1 flex-col">
              <h3 className="text-center font-display text-lg font-bold">Find your perfect look</h3>
              <div className="mt-3 flex justify-center gap-1">{["Hair", "Wigs", "Extensions", "Color"].map((item, i) => <span key={item} className={`rounded-full px-2 py-1 font-body text-[7px] ${i === 0 ? "bg-gold text-charcoal" : "bg-cream/10 text-cream/70"}`}>{item}</span>)}</div>
              <div className="relative mt-3 flex-1 overflow-hidden rounded-xl border border-cream/15 bg-cream/5"><UserRound className="absolute inset-x-0 bottom-0 mx-auto h-52 w-52 text-cream/15" /><div className="absolute left-2 top-2 rounded-full bg-charcoal/70 px-2 py-1 font-body text-[8px] text-gold">{hair} · {hairColor}</div></div>
              <div className="mt-2 flex gap-1.5 overflow-hidden">{["Body Wave", "Braids", "Silk Press", "K-Tips"].map((item) => <button key={item} onClick={() => setHair(item)} className={`min-w-16 rounded-lg px-2 py-2 font-body text-[7px] ${hair === item ? "bg-gold text-charcoal" : "bg-cream/10 text-cream"}`}>{item}</button>)}</div>
              <div className="mt-2 flex items-center justify-between"><span className="font-body text-[8px] text-cream/60">Hair color</span><button onClick={() => setHairColor(hairColor === "Natural Black" ? "Honey Blonde" : "Natural Black")} className="rounded-full border border-gold/40 px-3 py-1 font-body text-[8px] text-gold">{hairColor}</button></div>
              <Button onClick={() => navigate("beauty-action")} variant="gold" size="sm" className="mt-2 w-full text-[10px]">Continue</Button>
            </div>
          )}

          {screen === "beauty-action" && (
            <div className="flex flex-1 flex-col justify-center text-center">
              <Check className="mx-auto h-9 w-9 text-gold" /><h3 className="mt-3 font-display text-xl font-bold">Complete your look</h3><p className="mt-1 font-body text-[9px] text-cream/60">Your {hair} look is ready</p>
              <div className="mt-5 space-y-2">
                <Button onClick={() => finish("Your stylist request is ready")} variant="hero-outline" size="sm" className="w-full justify-start text-[10px]"><Scissors className="mr-2 h-4 w-4" />Book a stylist</Button>
                <Button onClick={() => finish("Your hair is saved to your bag")} variant="hero-outline" size="sm" className="w-full justify-start text-[10px]"><ShoppingBag className="mr-2 h-4 w-4" />Purchase the hair or product</Button>
                <Button onClick={() => finish("Your hair and stylist are ready")} variant="gold" size="sm" className="w-full justify-start text-[10px]"><Sparkles className="mr-2 h-4 w-4" />Book stylist + purchase product</Button>
              </div>
            </div>
          )}

          {screen === "apparel-styles" && (
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="text-center font-display text-lg font-bold">Made for your fit</h3><p className="mt-1 text-center font-body text-[8px] text-cream/60">Recommended by body type, measurements, and fit preferences</p>
              <div className="mt-4 grid grid-cols-3 gap-2">{["Elegant", "Streetwear", "Workwear", "Evening", "Casual", "Faith Edit"].map((item) => <button key={item} onClick={() => setStyle(item)} className={`flex h-20 flex-col items-center justify-center rounded-lg border font-body text-[8px] ${style === item ? "border-gold bg-gold/20" : "border-cream/15 bg-cream/10"}`}><Shirt className="mb-1.5 h-5 w-5 text-gold" />{item}</button>)}</div>
              <Button onClick={() => navigate("outfit-preview")} variant="gold" size="sm" className="mt-4 w-full text-[10px]">Try Selected Style</Button>
            </div>
          )}

          {screen === "outfit-preview" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="relative h-52 w-36 overflow-hidden rounded-xl border border-gold/50 bg-cream/10"><UserRound className="absolute inset-0 h-full w-full text-cream/15" /><Shirt className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-gold/70" /><span className="absolute bottom-2 left-2 right-2 rounded-full bg-charcoal/70 py-1 font-body text-[8px]">{style} fit · Best match</span></div>
              <h3 className="mt-3 font-display text-lg font-bold">See it on your body</h3><p className="mt-1 font-body text-[8px] text-cream/60">Preview the cut, length, and overall fit</p>
              <div className="mt-4 flex w-full gap-2"><Button onClick={() => finish("Your outfit is saved")} variant="hero-outline" size="sm" className="flex-1 text-[9px]"><Heart className="mr-1 h-3.5 w-3.5" />Save</Button><Button onClick={() => finish("Your outfit is ready to purchase")} variant="gold" size="sm" className="flex-1 text-[9px]"><ShoppingBag className="mr-1 h-3.5 w-3.5" />Purchase</Button></div>
            </div>
          )}

          {screen === "complete" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold bg-gold/15"><Check className="h-8 w-8 text-gold" /></div><h3 className="mt-4 font-display text-xl font-bold">All set</h3><p className="mt-2 font-body text-[9px] text-cream/65">{completion}</p><Button onClick={() => { setHistory([]); setScreen("lifestyle"); }} variant="gold" size="sm" className="mt-5 text-[10px]">Return to Mirror</Button></div>
          )}

          {navVisible && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
              <Button onClick={back} variant="ghost" size="sm" className="h-7 px-2 text-[8px] text-cream/70"><ArrowLeft className="mr-1 h-3 w-3" />Back</Button>
              <div className="flex gap-1">{Array.from({ length: 6 }).map((_, index) => <span key={index} className={`h-1 rounded-full ${index < progress ? "w-3 bg-gold" : "w-1 bg-cream/25"}`} />)}</div>
              <Button onClick={() => navigate(screen.startsWith("apparel") || screen === "measurements" || screen === "body-scan" ? "apparel-styles" : "beauty-looks")} variant="ghost" size="sm" className="h-7 px-2 text-[8px] text-cream/70">Skip</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MirrorExperience;