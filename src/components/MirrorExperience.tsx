import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Clock,
  CloudSun,
  CalendarDays,
  Headphones,
  Heart,
  Mic,
  MapPin,
  Music,
  Play,
  Ruler,
  ScanFace,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceBookingRequest = {
  service: string;
  dateLabel: string;
  dateValue: string;
  location: string;
};

const bookingServices = ["Braids", "Weave", "Wigs", "Locs", "K-Tips", "Makeup", "Natural Hair", "Frontals"];

const dailyAffirmations = [
  { text: "I am fearfully and wonderfully made.", verse: "Psalm 139:14" },
  { text: "I am clothed with strength and dignity.", verse: "Proverbs 31:25" },
  { text: "God’s grace is sufficient for me today.", verse: "2 Corinthians 12:9" },
  { text: "I can do all things through Christ who strengthens me.", verse: "Philippians 4:13" },
  { text: "I am God’s workmanship, created with purpose.", verse: "Ephesians 2:10" },
  { text: "The joy of the Lord is my strength.", verse: "Nehemiah 8:10" },
  { text: "I will shine because God’s light is within me.", verse: "Matthew 5:16" },
];

type MirrorExperienceProps = {
  presentation?: "preview" | "page";
};

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

const MirrorExperience = ({ presentation = "preview" }: MirrorExperienceProps) => {
  const routeTo = useNavigate();
  const isPage = presentation === "page";
  const [screen, setScreen] = useState<Screen>("brand");
  const [history, setHistory] = useState<Screen[]>([]);
  const [hair, setHair] = useState("Body Wave");
  const [hairColor, setHairColor] = useState("Natural Black");
  const [style, setStyle] = useState("Elegant");
  const [completion, setCompletion] = useState("Your look is saved");
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState("Tap to use your location");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap to speak");
  const [showNextlookPlaylist, setShowNextlookPlaylist] = useState(false);
  const [voiceBooking, setVoiceBooking] = useState<VoiceBookingRequest | null>(null);

  const affirmation = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return dailyAffirmations[day % dailyAffirmations.length];
  }, []);

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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const openAppleMusic = () => {
    window.open("https://music.apple.com/", "_blank", "noopener,noreferrer");
  };

  const toggleNextlookPlaylist = () => {
    setShowNextlookPlaylist((current) => !current);
  };

  const speakAsGwen = (message: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const response = new SpeechSynthesisUtterance(message);
    response.rate = 0.95;
    response.pitch = 1.05;
    window.speechSynthesis.speak(response);
  };

  const buildVoiceBooking = (command: string): VoiceBookingRequest => {
    const service = bookingServices.find((item) => command.includes(item.toLowerCase()))
      ?? (command.includes("braid") ? "Braids" : command.includes("wig") ? "Wigs" : command.includes("hair") ? "Natural Hair" : "All");
    const requestedDate = new Date();
    let dateLabel = "Any available date";
    let dateValue = "";
    if (command.includes("tomorrow")) {
      requestedDate.setDate(requestedDate.getDate() + 1);
      dateLabel = "Tomorrow";
      dateValue = requestedDate.toISOString().slice(0, 10);
    } else if (command.includes("today")) {
      dateLabel = "Today";
      dateValue = requestedDate.toISOString().slice(0, 10);
    }
    const locationMatch = command.match(/(?:\bin\b|\bnear\b)\s+(.+?)(?=\s+(?:today|tomorrow|this|next)\b|$)/i);
    const spokenLocation = locationMatch?.[1]?.trim().replace(/[.,!?]+$/, "");
    const location = !spokenLocation || spokenLocation.toLowerCase() === "me" ? "Near me" : spokenLocation;
    return { service, dateLabel, dateValue, location };
  };

  const openVoiceBooking = (request = voiceBooking) => {
    if (!request) return;
    const params = new URLSearchParams();
    if (request.service !== "All") params.set("service", request.service);
    if (request.location !== "Near me") params.set("location", request.location);
    if (request.dateValue) params.set("date", request.dateValue);
    speakAsGwen("Perfect. I’m showing you matching NEXTLOOK stylists now.");
    routeTo(`/discover?${params.toString()}`);
  };

  const loadWeather = () => {
    if (!navigator.geolocation) {
      setWeather("Location is not available on this device");
      return;
    }
    setWeatherLoading(true);
    setWeather("Finding your local weather…");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
          );
          if (!response.ok) throw new Error("Weather unavailable");
          const data = await response.json() as { current?: { temperature_2m?: number; weather_code?: number } };
          const temperature = data.current?.temperature_2m;
          const code = data.current?.weather_code ?? 0;
          const condition = code === 0 ? "Clear" : code <= 3 ? "Partly cloudy" : code <= 67 ? "Rain nearby" : code <= 77 ? "Snow nearby" : "Storms nearby";
          setWeather(typeof temperature === "number" ? `${Math.round(temperature)}°F · ${condition}` : condition);
        } catch {
          setWeather("Weather is temporarily unavailable");
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeather("Allow location to see local weather");
        setWeatherLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  };

  const startVoiceAssistant = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus("Voice assistant is not supported in this browser");
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    setVoiceStatus("Listening…");
    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript.toLowerCase() ?? "";
      setVoiceStatus(`You said: “${command}”`);
      if (command.includes("confirm") && voiceBooking) openVoiceBooking();
      else if (command.includes("book") || command.includes("appointment") || command.includes("stylist")) {
        const request = buildVoiceBooking(command);
        setVoiceBooking(request);
        setVoiceStatus("Gwen found your booking request");
        speakAsGwen(`I found your ${request.service === "All" ? "beauty" : request.service} booking request for ${request.dateLabel.toLowerCase()} ${request.location === "Near me" ? "near you" : `in ${request.location}`}. Please confirm it on the screen.`);
      }
      else if (command.includes("beauty") || command.includes("hair")) navigate("beauty-permission");
      else if (command.includes("apparel") || command.includes("clothes")) navigate("apparel-permission");
      else if (command.includes("try on") || command.includes("open")) navigate("category");
      else if (command.includes("my apple") || command.includes("my music") || command.includes("account")) openAppleMusic();
      else if (command.includes("music") || command.includes("playlist")) {
        setShowNextlookPlaylist(true);
        setVoiceStatus("Opening the NEXTLOOK playlist");
      }
      else if (command.includes("weather")) loadWeather();
      else if (command.includes("time")) setVoiceStatus(`It is ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      else {
        setVoiceStatus("Try saying “Gwen, book braids tomorrow”");
        speakAsGwen("Try saying, Gwen, book braids tomorrow near me.");
      }
    };
    recognition.onerror = () => setVoiceStatus("I couldn’t hear that. Tap to try again.");
    recognition.onend = () => setTimeout(() => setVoiceStatus((current) => current === "Listening…" ? "Tap to speak" : current), 400);
    recognition.start();
  };

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
  const isIntro = screen === "brand" || screen === "welcome";

  return (
    <div
      data-presentation={presentation}
      className={`relative w-full overflow-hidden ${isIntro ? "bg-purple-deep text-cream" : "mirror-light bg-background text-foreground"} ${
        isPage ? "min-h-[calc(100vh-5rem)]" : "h-full"
      }`}
    >
      <div className={`absolute inset-0 ${isIntro ? "bg-gradient-to-b from-accent via-purple-deep to-charcoal" : "bg-gradient-to-b from-background via-muted to-secondary"}`} />
      <div className="absolute inset-x-0 top-0 z-30 flex h-12 items-end justify-center pb-1.5">
        <span className={`rounded-full px-3 py-1 font-body text-[8px] font-semibold backdrop-blur-md ${isIntro ? "bg-charcoal/55" : "border border-border bg-background/80 text-accent"}`}>
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
          className={
            isPage
              ? "relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col px-5 pb-10 pt-20 sm:px-10 sm:pb-12 sm:pt-24"
              : "absolute inset-0 z-10 flex flex-col px-4 pb-5 pt-14"
          }
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
                <p className="font-display text-4xl font-bold leading-none text-accent">{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                <p className="mt-1 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, beautiful</p>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-background/90 p-3 text-center shadow-soft backdrop-blur-md">
                <BookOpen className="mx-auto mb-1 h-4 w-4 text-accent" />
                <p className="font-display text-[12px] font-bold leading-snug text-foreground">“{affirmation.text}”</p>
                <p className="mt-1 font-body text-[8px] font-semibold text-accent">{affirmation.verse} · Today’s affirmation</p>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-muted/80 p-3">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-accent" />
                  <div className="min-w-0 flex-1"><p className="font-body text-[9px] font-bold">Music</p><p className="truncate font-body text-[8px] text-muted-foreground">Choose NEXTLOOK or your Apple Music</p></div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button onClick={toggleNextlookPlaylist} variant={showNextlookPlaylist ? "default" : "outline"} size="sm" className="h-8 px-2 text-[8px]"><Headphones className="mr-1 h-3 w-3" />NEXTLOOK Playlist</Button>
                  <Button onClick={openAppleMusic} variant="outline" size="sm" className="h-8 px-2 text-[8px]"><Play className="mr-1 h-3 w-3" />My Apple Music</Button>
                </div>
                {showNextlookPlaylist && (
                  <iframe
                    title="NEXTLOOK Gospel Worship playlist"
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                    src="https://embed.music.apple.com/us/playlist/gospel-worship/pl.2bdba44288924df98a9118c263a1b5a8"
                    className="mt-2 h-[175px] w-full rounded-lg border-0 bg-background"
                  />
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button onClick={startVoiceAssistant} variant="outline" className="h-auto min-h-20 flex-col whitespace-normal border-border bg-background p-2 text-center text-foreground"><Mic className="h-4 w-4 text-accent" /><span className="mt-1 font-body text-[8px] font-semibold">Gwen Voice Assistant</span><span className="mt-1 font-body text-[7px] font-normal text-muted-foreground">{voiceStatus}</span></Button>
                <Button onClick={loadWeather} disabled={weatherLoading} variant="outline" className="h-auto min-h-20 flex-col whitespace-normal border-border bg-background p-2 text-center text-foreground"><div className="flex gap-1"><Clock className="h-4 w-4 text-accent" /><CloudSun className="h-4 w-4 text-accent" /></div><span className="mt-1 font-body text-[8px] font-semibold">Time & weather</span><span className="mt-1 font-body text-[7px] font-normal text-muted-foreground">{weather}</span></Button>
              </div>
              {voiceBooking && (
                <div className="mt-3 rounded-lg border border-accent/30 bg-background p-3 shadow-soft" aria-live="polite">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /><p className="font-display text-[10px] font-bold text-foreground">Gwen’s booking request</p></div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center font-body text-[7px] text-muted-foreground">
                    <span className="rounded-md bg-muted p-1.5"><Scissors className="mx-auto mb-1 h-3 w-3 text-accent" />{voiceBooking.service === "All" ? "Any service" : voiceBooking.service}</span>
                    <span className="rounded-md bg-muted p-1.5"><CalendarDays className="mx-auto mb-1 h-3 w-3 text-accent" />{voiceBooking.dateLabel}</span>
                    <span className="rounded-md bg-muted p-1.5"><MapPin className="mx-auto mb-1 h-3 w-3 text-accent" />{voiceBooking.location}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button onClick={() => { setVoiceBooking(null); setVoiceStatus("Tap to speak"); }} variant="outline" size="sm" className="h-8 text-[8px]">Cancel</Button>
                    <Button onClick={() => openVoiceBooking()} size="sm" className="h-8 bg-accent text-[8px] text-accent-foreground hover:bg-accent/90">Find My Stylist</Button>
                  </div>
                </div>
              )}
              <Button onClick={() => navigate("category")} size="sm" className="mt-auto w-full bg-accent text-accent-foreground text-[10px] font-bold uppercase hover:bg-accent/90">Open Virtual Try-On <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
            </div>
          )}

          {screen === "category" && (
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="text-center font-display text-xl font-bold">What would you like to try?</h3>
              <p className="mt-1 text-center font-body text-[9px] text-muted-foreground">Choose an experience to begin</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button onClick={() => navigate("beauty-permission")} variant="outline" className="flex h-auto min-h-36 flex-col items-center justify-center whitespace-normal border-accent bg-background p-3 text-foreground shadow-soft">
                  <Sparkles className="h-8 w-8 text-accent" /><span className="mt-3 font-display text-base font-bold">Beauty</span><span className="font-body text-[8px] text-muted-foreground">Hair, wigs & color</span>
                </Button>
                <Button onClick={() => navigate("apparel-permission")} variant="outline" className="flex h-auto min-h-36 flex-col items-center justify-center whitespace-normal border-border bg-muted p-3 text-foreground">
                  <Shirt className="h-8 w-8 text-accent" /><span className="mt-3 font-display text-base font-bold">Apparel</span><span className="font-body text-[8px] text-muted-foreground">Clothing & fit</span>
                </Button>
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
                <Button onClick={() => screen === "beauty-permission" ? routeTo("/tryon/live") : navigate("body-scan")} variant="gold" size="sm" className="w-full text-[10px]"><Camera className="mr-1.5 h-3.5 w-3.5" />{screen === "beauty-permission" ? "Use My Real Photo" : "Allow Camera"}</Button>
                {screen === "beauty-permission" && <p className="font-body text-[8px] leading-relaxed text-muted-foreground">On the next screen, open your camera or choose a photo already on your device.</p>}
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