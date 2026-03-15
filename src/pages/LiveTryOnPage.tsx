import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RotateCcw, ArrowLeft, Sparkles, ShoppingBag, Calendar,
  ChevronRight, Palette, Ruler, Waves, Loader2, X, FlipHorizontal
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import BookingDialog from "@/components/BookingDialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLORS = [
  { name: "Natural Black", value: "natural black", hex: "#1a1a1a" },
  { name: "Dark Brown", value: "dark brown", hex: "#3b2314" },
  { name: "Light Brown", value: "light brown", hex: "#8B6914" },
  { name: "Blonde", value: "blonde", hex: "#D4A843" },
  { name: "Platinum", value: "platinum blonde", hex: "#E8DCC8" },
  { name: "Red", value: "auburn red", hex: "#922B05" },
  { name: "Burgundy", value: "burgundy", hex: "#6D1A36" },
  { name: "Gray", value: "silver gray", hex: "#9E9E9E" },
];

const LENGTHS = ["Short", "Medium", "Long", "Extra Long"];
const TEXTURES = ["Straight", "Wavy", "Curly", "Coily"];

const LiveTryOnPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const [activeCategory, setActiveCategory] = useState<StyleCategory>("Braids");
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedLength, setSelectedLength] = useState("Medium");
  const [selectedTexture, setSelectedTexture] = useState("Straight");
  const [showCustomize, setShowCustomize] = useState(false);

  const filteredStyles = styles.filter((s) => s.category === activeCategory);
  const currentStyle = filteredStyles[selectedStyleIdx] || filteredStyles[0];

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
      setSelfie(null);
      setResultImage(null);
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const flipCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => startCamera(), 300);
  }, [stopCamera, startCamera]);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setSelfie(dataUrl);
    stopCamera();
  }, [stopCamera, facingMode]);

  const generateTryOn = useCallback(async () => {
    if (!selfie || !currentStyle) return;
    setIsGenerating(true);
    setResultImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("try-on-hair", {
        body: {
          selfieBase64: selfie,
          styleName: currentStyle.name,
          color: selectedColor.value,
          length: selectedLength,
          texture: selectedTexture,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.image) {
        setResultImage(data.image);
        toast.success("Your look is ready! 🔥");
      } else {
        throw new Error("No image generated");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate try-on. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [selfie, currentStyle, selectedColor, selectedLength, selectedTexture]);

  const resetAll = () => {
    setSelfie(null);
    setResultImage(null);
    setIsGenerating(false);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-6">
            <Link to="/tryon" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body">
              <ArrowLeft className="w-4 h-4" /> Back to Style Gallery
            </Link>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              AI Hair <span className="text-gradient-rose">Try-On</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg font-body text-sm md:text-base">
              Take a selfie, pick a style, and see how it looks on you — powered by AI.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* Left: Camera / Result */}
            <div>
              <div className="aspect-[3/4] max-h-[700px] rounded-3xl overflow-hidden relative bg-charcoal shadow-elevated">
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera feed */}
                {cameraActive && !selfie && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={facingMode === "user" ? { transform: "scaleX(-1)" } : undefined}
                    />
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-[15%] border-2 border-primary/40 rounded-[2rem]" />
                      <motion.div
                        className="absolute left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{ top: ["15%", "85%", "15%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    {/* Camera controls */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-10">
                      <Button variant="outline" size="icon" className="rounded-full bg-charcoal/60 border-cream/30 text-white h-12 w-12" onClick={flipCamera}>
                        <FlipHorizontal className="w-5 h-5" />
                      </Button>
                      <Button variant="hero" size="lg" className="rounded-full h-16 w-16 p-0" onClick={takeSelfie}>
                        <Camera className="w-7 h-7" />
                      </Button>
                    </div>
                    <div className="absolute top-4 left-4 bg-charcoal/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs text-white font-body">Scanning face…</span>
                    </div>
                  </>
                )}

                {/* Selfie captured / Result */}
                {selfie && !resultImage && !isGenerating && (
                  <>
                    <img src={selfie} alt="Your selfie" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-charcoal/70 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-xs text-white font-body">📸 Photo captured</span>
                    </div>
                    <div className="absolute bottom-6 left-4 right-4 flex gap-2 z-10">
                      <Button variant="outline" className="flex-1 bg-charcoal/60 border-cream/30 text-white" onClick={resetAll}>
                        <RotateCcw className="w-4 h-4 mr-1" /> Retake
                      </Button>
                      <Button variant="hero" className="flex-1" onClick={generateTryOn}>
                        <Sparkles className="w-4 h-4 mr-1" /> Try On {currentStyle?.name}
                      </Button>
                    </div>
                  </>
                )}

                {/* Generating */}
                {isGenerating && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-charcoal">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 text-primary" />
                    </motion.div>
                    <p className="text-white font-body mt-4 text-sm">AI is styling your look…</p>
                    <p className="text-cream/50 font-body mt-1 text-xs">This may take 10-20 seconds</p>
                  </div>
                )}

                {/* Result */}
                {resultImage && (
                  <>
                    <AnimatePresence>
                      <motion.img
                        key="result"
                        src={resultImage}
                        alt="AI Try-On Result"
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                    <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-xs text-white font-body font-semibold">{currentStyle?.name}</span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button variant="outline" size="icon" className="rounded-full bg-charcoal/60 border-cream/30 text-white h-9 w-9" onClick={resetAll}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent pt-12 pb-5 px-4 z-10">
                      <div className="flex gap-2 mb-2">
                        <Button variant="outline" className="flex-1 bg-charcoal/60 border-cream/30 text-white" onClick={() => { setResultImage(null); }}>
                          <RotateCcw className="w-4 h-4 mr-1" /> Try Another
                        </Button>
                        <Button variant="outline" className="bg-charcoal/60 border-cream/30 text-white" onClick={generateTryOn}>
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <BookingDialog
                          styleName={currentStyle?.name || ""}
                          trigger={
                            <Button variant="hero" className="flex-1">
                              <Calendar className="w-4 h-4 mr-1" /> Book This Style <ChevronRight className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <Link to="/extensions" className="flex-1">
                          <Button variant="gold" className="w-full">
                            <ShoppingBag className="w-4 h-4 mr-1" /> Buy Hair
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {/* Initial state - no camera */}
                {!cameraActive && !selfie && (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-16 h-16 text-primary/60 mb-4" />
                    <h3 className="text-white font-display text-xl font-bold mb-2">Ready to Try On?</h3>
                    <p className="text-cream/60 font-body text-sm mb-6 text-center px-8">
                      Open your camera and take a selfie to see how different styles look on you
                    </p>
                    <Button variant="hero" size="lg" onClick={startCamera}>
                      <Camera className="w-5 h-5 mr-2" /> Open Camera
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Style Selection & Customization */}
            <div className="space-y-5">
              {/* Category tabs */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Choose Style</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setSelectedStyleIdx(0); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-card text-muted-foreground hover:bg-secondary border border-border"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredStyles.map((style, idx) => (
                    <div
                      key={style.name}
                      onClick={() => setSelectedStyleIdx(idx)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group ${
                        selectedStyleIdx === idx
                          ? "ring-2 ring-primary scale-[1.03]"
                          : "ring-1 ring-border hover:ring-primary/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="aspect-[3/4]">
                        <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1 left-1 right-1">
                        <span className="font-body font-semibold text-white text-[10px] leading-tight">{style.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization */}
              <div>
                <button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="font-body font-semibold text-sm text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" /> Customize Look
                  </span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showCustomize ? "rotate-90" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCustomize && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-4">
                        {/* Color */}
                        <div>
                          <label className="text-xs font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5" /> Hair Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => setSelectedColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedColor.value === c.value
                                    ? "border-primary scale-110 shadow-soft"
                                    : "border-border hover:border-primary/50"
                                }`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground font-body mt-1 block">{selectedColor.name}</span>
                        </div>

                        {/* Length */}
                        <div>
                          <label className="text-xs font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5" /> Hair Length
                          </label>
                          <div className="flex gap-1.5">
                            {LENGTHS.map((l) => (
                              <button
                                key={l}
                                onClick={() => setSelectedLength(l)}
                                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                                  selectedLength === l
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Texture */}
                        <div>
                          <label className="text-xs font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Waves className="w-3.5 h-3.5" /> Hair Texture
                          </label>
                          <div className="flex gap-1.5">
                            {TEXTURES.map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedTexture(t)}
                                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                                  selectedTexture === t
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick action */}
              {selfie && !isGenerating && (
                <Button variant="hero" className="w-full" size="lg" onClick={generateTryOn}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {resultImage ? "Regenerate with These Options" : `Try On ${currentStyle?.name}`}
                </Button>
              )}

              {/* Info */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-body font-semibold text-sm text-foreground mb-1">How it works</h4>
                <ol className="text-xs text-muted-foreground font-body space-y-1 list-decimal list-inside">
                  <li>Open camera & take a selfie</li>
                  <li>Pick a hairstyle and customize color, length & texture</li>
                  <li>Tap "Try On" — AI generates your new look in seconds</li>
                  <li>Love it? Book the stylist or buy the hair!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LiveTryOnPage;
