/* @refresh reset */
import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RotateCcw, ArrowLeft, Sparkles, ShoppingBag, Calendar,
  ChevronRight, ChevronUp, Palette, Ruler, Waves, X, FlipHorizontal, Users
} from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFaceOverlay } from "@/hooks/useFaceOverlay";
import logoImg from "@/assets/logo.png";

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
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const [activeCategory, setActiveCategory] = useState<StyleCategory>("Wig Frontal & Closure");
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedLength, setSelectedLength] = useState("Medium");
  const [selectedTexture, setSelectedTexture] = useState("Straight");
  const [showCustomize, setShowCustomize] = useState(false);
  const [showStyles, setShowStyles] = useState(true);

  const filteredStyles = styles.filter((s) => s.category === activeCategory);
  const currentStyle = filteredStyles[selectedStyleIdx] || filteredStyles[0];

  // Scan status — updated via throttled callback from the hook (not useState in rAF)
  const [scanInfo, setScanInfo] = useState({ progress: 0, complete: false, faceDetected: false });
  const handleScanUpdate = useCallback((info: { progress: number; complete: boolean; faceDetected: boolean }) => {
    setScanInfo(info);
  }, []);

  // Real-time AR hair overlay with 5s scan phase
  useFaceOverlay({
    videoRef,
    overlayCanvasRef,
    active: cameraActive && !selfie,
    hairImageSrc: currentStyle?.image || "",
    onScanUpdate: handleScanUpdate,
  });

  const startCamera = useCallback(async () => {
    try {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: isMobileDevice ? 1080 : 1280 },
          height: { ideal: isMobileDevice ? 1440 : 1720 },
          ...(isMobileDevice && facingMode === "user" ? { zoom: 1.0 } as any : {}),
        },
        audio: false,
      });
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

  const flipCamera = useCallback(async () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);

    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    try {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode,
          width: { ideal: isMobileDevice ? 1080 : 1280 },
          height: { ideal: isMobileDevice ? 1440 : 1720 },
          ...(isMobileDevice && newMode === "user" ? { zoom: 1.0 } as any : {}),
        },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      toast.error("Could not flip camera.");
    }
  }, [stream, facingMode]);

  useEffect(() => {
    if (!videoRef.current || !stream || !cameraActive) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {
      // autoplay may be blocked on some browsers until user interaction
    });
  }, [stream, cameraActive]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

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
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2 bg-gradient-to-b from-black/60 to-transparent">
        <Link to="/tryon" className="flex items-center gap-1 text-white/90 text-sm font-body">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <h1 className="text-white font-display font-bold text-base">
          NEXTLOOK AI Try-On
        </h1>
        <div className="w-10" />
      </div>

      {/* Full-screen camera / result area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera feed */}
        {cameraActive && !selfie && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                ...(facingMode === "user" ? { transform: "scaleX(-1)" } : {}),
                filter: "brightness(1.08) contrast(1.02) saturate(1.05)",
              }}
            />
            {/* AR hair overlay canvas — positioned exactly over the video */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              style={facingMode === "user" ? { transform: "scaleX(-1)" } : undefined}
            />
            {/* Face guide overlay (subtle, behind AR) */}
            <div className="absolute inset-0 pointer-events-none z-[5]">
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] max-w-[280px] aspect-[3/4] border-2 border-primary/20 rounded-[2.5rem]" />
            </div>
            {/* Scan status badge */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 z-20">
              {!scanInfo.faceDetected ? (
                <>
                  <Camera className="w-3 h-3 text-white/60" />
                  <span className="text-xs text-white/60 font-body">Position your face in frame</span>
                </>
              ) : !scanInfo.complete ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-xs text-white font-body">Scanning face… {Math.round(scanInfo.progress)}%</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs text-white font-body font-semibold">{currentStyle?.name}</span>
                </>
              )}
            </div>
          </>
        )}

        {/* Selfie captured (pre-generate) */}
        {selfie && !resultImage && !isGenerating && (
          <>
            <img src={selfie} alt="Your selfie" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-xs text-white font-body">📸 Photo captured</span>
            </div>
          </>
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            {selfie && <img src={selfie} alt="Your selfie" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Sparkles className="w-14 h-14 text-primary" />
            </motion.div>
            <p className="text-white font-body mt-4 text-sm relative z-10">AI is styling your look…</p>
            <p className="text-white/50 font-body mt-1 text-xs relative z-10">This may take 10-20 seconds</p>
          </div>
        )}

        {/* Result */}
        {resultImage && (
          <AnimatePresence>
            <motion.img
              key="result"
              src={resultImage}
              alt="AI Try-On Result"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        )}

        {/* Initial state with logo */}
        {!cameraActive && !selfie && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-6">
            <motion.img
              src={logoImg}
              alt="NextLook Beauty"
              className="w-24 h-24 rounded-2xl shadow-elevated mb-6 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            <h3 className="text-white font-display text-xl font-bold mb-2">Ready to Try On?</h3>
            <p className="text-white/50 font-body text-sm mb-6 text-center">
              Open your camera and see how styles look on you in real-time
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button variant="hero" size="lg" className="w-full" onClick={startCamera}>
                <Camera className="w-5 h-5 mr-2" /> Open Camera
              </Button>
              <Link to="/stylists" className="w-full">
                <Button variant="gold" size="lg" className="w-full">
                  <Users className="w-5 h-5 mr-2" /> Select a Stylist
                </Button>
              </Link>
              <Link to="/extensions" className="w-full">
                <Button size="lg" className="w-full bg-black text-white border border-white/20 hover:bg-black/80">
                  <ShoppingBag className="w-5 h-5 mr-2" /> Shop Extensions
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom overlay controls (Snapchat-style) */}
      {(cameraActive || selfie) && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom,8px)]">
          {/* Result action bar */}
          {resultImage && (
            <div className="px-4 pb-3 space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-black/50 border-white/20 text-white backdrop-blur-sm" onClick={() => setResultImage(null)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Try Another
                </Button>
                <Button variant="outline" className="bg-black/50 border-white/20 text-white backdrop-blur-sm" onClick={generateTryOn}>
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Link to={`/stylists?specialty=${encodeURIComponent(currentStyle?.category || '')}`} className="flex-1">
                  <Button variant="hero" className="w-full">
                    <Users className="w-4 h-4 mr-1" /> Select a Stylist <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/extensions" className="flex-1">
                  <Button variant="gold" className="w-full">
                    <ShoppingBag className="w-4 h-4 mr-1" /> Buy Hair
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Selfie action buttons (before generate) */}
          {selfie && !resultImage && !isGenerating && (
            <div className="px-4 pb-2 flex gap-2">
              <Button variant="outline" className="flex-1 bg-black/50 border-white/20 text-white backdrop-blur-sm" onClick={resetAll}>
                <RotateCcw className="w-4 h-4 mr-1" /> Retake
              </Button>
              <Button variant="hero" className="flex-1" onClick={generateTryOn}>
                <Sparkles className="w-4 h-4 mr-1" /> Try On {currentStyle?.name}
              </Button>
            </div>
          )}

          {/* Customize panel (expandable) */}
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/80 backdrop-blur-xl px-4 pt-3 pb-2 space-y-3">
                  {/* Colors */}
                  <div>
                    <label className="text-[10px] font-body font-semibold text-white/60 mb-1.5 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Color: {selectedColor.name}
                    </label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            selectedColor.value === c.value
                              ? "border-primary scale-110"
                              : "border-white/20 hover:border-white/50"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Length */}
                  <div>
                    <label className="text-[10px] font-body font-semibold text-white/60 mb-1.5 flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Length
                    </label>
                    <div className="flex gap-1.5">
                      {LENGTHS.map((l) => (
                        <button
                          key={l}
                          onClick={() => setSelectedLength(l)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-body font-semibold transition-all ${
                            selectedLength === l
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Texture */}
                  <div>
                    <label className="text-[10px] font-body font-semibold text-white/60 mb-1.5 flex items-center gap-1">
                      <Waves className="w-3 h-3" /> Texture
                    </label>
                    <div className="flex gap-1.5">
                      {TEXTURES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTexture(t)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-body font-semibold transition-all ${
                            selectedTexture === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
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

          {/* Customize toggle */}
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="w-full flex items-center justify-center gap-1 py-2 bg-black/70 backdrop-blur-sm text-white/80 text-xs font-body font-semibold"
          >
            <Palette className="w-3.5 h-3.5 text-primary" />
            Customize
            <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showCustomize ? "" : "rotate-180"}`} />
          </button>

          {/* Category tabs */}
          <div className="bg-black/80 backdrop-blur-xl px-3 pt-2">
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSelectedStyleIdx(0); }}
                  className={`px-3 py-1 rounded-full text-[11px] font-body font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Style thumbnails (horizontal scroll at bottom, like Snapchat filters) */}
          <div className="bg-black/80 backdrop-blur-xl px-3 pb-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filteredStyles.map((style, idx) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyleIdx(idx)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all ${
                    selectedStyleIdx === idx ? "scale-105" : "opacity-60 hover:opacity-90"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all bg-white/5 ${
                      selectedStyleIdx === idx
                        ? "border-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                        : "border-white/10"
                    }`}
                  >
                    <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] text-white/80 font-body font-semibold max-w-[64px] truncate">
                    {style.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera controls when camera active */}
          {cameraActive && !selfie && (
            <div className="absolute bottom-[220px] left-0 right-0 flex justify-center gap-5 z-20">
              <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/30 text-white h-11 w-11 backdrop-blur-sm" onClick={flipCamera}>
                <FlipHorizontal className="w-5 h-5" />
              </Button>
              <Button variant="hero" size="lg" className="rounded-full h-16 w-16 p-0 shadow-[0_0_20px_rgba(var(--primary),0.5)]" onClick={takeSelfie}>
                <Camera className="w-7 h-7" />
              </Button>
              <div className="w-11" /> {/* spacer */}
            </div>
          )}

          {/* Close / reset button for result */}
          {resultImage && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-20 right-4 rounded-full bg-black/50 border-white/30 text-white h-9 w-9 backdrop-blur-sm z-30"
              onClick={resetAll}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTryOnPage;
