/* @refresh reset */
import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RotateCcw, ArrowLeft, Sparkles, ShoppingBag, Calendar,
  ChevronRight, ChevronUp, Palette, Ruler, Waves, X, FlipHorizontal, Users, Scissors
} from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFaceOverlay } from "@/hooks/useFaceOverlay";
import logoImg from "@/assets/logo.png";

const COLORS = [
  { name: "#1 Jet Black", value: "jet black hair color #1", hex: "#0a0a0a" },
  { name: "#1B Natural Black", value: "natural off-black hair color #1B", hex: "#1a1a1a" },
  { name: "#2 Dark Brown", value: "dark brown hair color #2", hex: "#3b2314" },
  { name: "#4 Medium Brown", value: "medium chocolate brown hair color #4", hex: "#5a3a22" },
  { name: "#6 Light Brown", value: "light chestnut brown hair color #6", hex: "#7a4f2c" },
  { name: "#8 Caramel", value: "caramel brown hair color #8", hex: "#9c6b3a" },
  { name: "#27 Honey Blonde", value: "honey blonde hair color #27, warm golden honey tone", hex: "#C8923B" },
  { name: "#30 Medium Auburn", value: "medium auburn hair color #30, warm reddish-brown", hex: "#9C5A2A" },
  { name: "#33 Dark Auburn", value: "dark auburn hair color #33, deep reddish brown", hex: "#7a3520" },
  { name: "#99J Burgundy", value: "burgundy wine hair color #99J", hex: "#6D1A36" },
  { name: "#350 Copper Red", value: "copper red hair color #350", hex: "#B8421C" },
  { name: "#613 Cookie Blonde", value: "light blonde hair color #613, pale cookie blonde, bleach blonde", hex: "#E8C988" },
  { name: "#60 Platinum", value: "platinum blonde hair color #60, icy white blonde", hex: "#EFE4CC" },
  { name: "#613/27 Honey Highlights", value: "honey blonde with #613 highlights, blended balayage", hex: "#D9B26A" },
  { name: "Silver Gray", value: "silver gray hair color, ash silver", hex: "#B8B8B8" },
  { name: "Rose Gold", value: "rose gold hair color, soft pink blonde", hex: "#D49A8A" },
];

const LENGTHS = ["Short", "Medium", "Long", "Extra Long"];
const TEXTURES = ["Straight", "Wavy", "Curly", "Coily"];
const SERVICES = ["Sew-In Install", "Wig Installation", "K-Tip Installation", "Tape-In Installation", "Microlink Installation"];

const optimizeSelfie = (imageData: string) => new Promise<string>((resolve) => {
  const image = new Image();
  image.onload = () => {
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, 768 / longestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      resolve(imageData);
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL("image/jpeg", 0.78));
  };
  image.onerror = () => resolve(imageData);
  image.src = imageData;
});

const LiveTryOnPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSeconds, setGenerationSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [captureSource, setCaptureSource] = useState<"live" | "file">("live");

  const [activeCategory, setActiveCategory] = useState<StyleCategory>("Wig Frontal & Closure");
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedLength, setSelectedLength] = useState("Medium");
  const [selectedTexture, setSelectedTexture] = useState("Straight");
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showStyles, setShowStyles] = useState(true);

  const filteredStyles = styles.filter((s) => s.category === activeCategory);
  const currentStyle = filteredStyles[selectedStyleIdx] || filteredStyles[0];

  // Scan status — updated via throttled callback from the hook (not useState in rAF)
  const [scanInfo, setScanInfo] = useState({ progress: 0, complete: false, faceDetected: false });
  const handleScanUpdate = useCallback((info: { progress: number; complete: boolean; faceDetected: boolean }) => {
    setScanInfo(info);
  }, []);

  const isMakeupCategory = activeCategory === "Makeup";

  // Real-time AR overlay with 5s scan phase
  useFaceOverlay({
    videoRef,
    overlayCanvasRef,
    active: cameraActive && !selfie,
    hairImageSrc: currentStyle?.image || "",
    onScanUpdate: handleScanUpdate,
    mode: isMakeupCategory ? "makeup" : "hair",
  });

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const openPhotoCapture = useCallback(() => {
    setCaptureSource("file");
    fileInputRef.current?.click();
  }, []);

  const buildCameraConstraintSequence = useCallback((preferredFacingMode: "user" | "environment") => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return [
      { video: true, audio: false },
      {
        video: {
          facingMode: { ideal: preferredFacingMode },
        },
        audio: false,
      },
      {
        video: {
          facingMode: preferredFacingMode,
        },
        audio: false,
      },
      {
        video: {
          facingMode: { ideal: preferredFacingMode },
          width: { ideal: isMobileDevice ? 1080 : 1280 },
          height: { ideal: isMobileDevice ? 1440 : 1720 },
        },
        audio: false,
      },
    ] satisfies MediaStreamConstraints[];
  }, []);

  const requestCameraStream = useCallback(async (preferredFacingMode: "user" | "environment") => {
    const constraintSequence = buildCameraConstraintSequence(preferredFacingMode);
    let lastError: unknown = null;

    for (const constraints of constraintSequence) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error: any) {
        lastError = error;
        const errorName = error?.name || "";

        if (!["OverconstrainedError", "AbortError"].includes(errorName)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error("Could not start the live camera.");
  }, [buildCameraConstraintSequence]);

  const handlePhotoInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = typeof reader.result === "string" ? reader.result : null;
      if (!imageData) {
        toast.error("Could not read the photo. Please try again.");
        return;
      }

      stopCamera();
      setCaptureSource("file");
      setSelfie(await optimizeSelfie(imageData));
      setResultImage(null);
    };
    reader.onerror = () => {
      toast.error("Could not load the photo. Please try again.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    // Check API availability first (some in-app browsers don't support getUserMedia)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Live camera is not supported here. Use Take Photo instead.");
      return;
    }

    // IMPORTANT: Call getUserMedia DIRECTLY in the user-gesture stack — no awaits before it.
    // Awaiting permissions.query() first breaks the gesture on Android (Samsung Internet / Chrome)
    // and triggers "This site can't ask for your permission".
    try {
      const mediaStream = await requestCameraStream(facingMode);
      setStream(mediaStream);
      setCameraActive(true);
      setCaptureSource("live");
      setSelfie(null);
      setResultImage(null);
    } catch (err: any) {
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        toast.error("The browser refused the live camera request. If this is a kiosk, allow camera access for this site in the kiosk browser settings.", { duration: 9000 });
      } else if (name === "NotFoundError") {
        toast.error("No compatible live camera was found on this device.");
      } else if (name === "NotReadableError") {
        toast.error("Camera is busy in another app. Close it and try again.");
      } else if (name === "AbortError") {
        toast.error("Camera request was interrupted. Try again.");
      } else {
        toast.error("Could not access the live camera on this device.");
      }
    }
  }, [facingMode, requestCameraStream]);

  const flipCamera = useCallback(async () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);

    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    try {
      const mediaStream = await requestCameraStream(newMode);
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      toast.error("Could not flip camera.");
    }
  }, [stream, facingMode, requestCameraStream]);

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

  useEffect(() => {
    if (!isGenerating) {
      setGenerationSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setGenerationSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    void optimizeSelfie(dataUrl).then(setSelfie);
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
    if (captureSource === "file") {
      openPhotoCapture();
      return;
    }

    startCamera();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col z-50"
      style={{
        backgroundColor: "hsl(270 65% 18%)",
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, hsl(280 70% 40% / 0.55), transparent 55%), radial-gradient(ellipse at 80% 90%, hsl(260 80% 25% / 0.7), transparent 60%), linear-gradient(135deg, hsl(270 70% 12%) 0%, hsl(275 65% 25%) 40%, hsl(268 60% 15%) 100%)",
      }}
    >
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handlePhotoInputChange}
      />

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
            <p className="text-white font-body mt-4 text-sm relative z-10">Creating your hair preview…</p>
            <div className="relative z-10 mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "8%" }}
                animate={{ width: generationSeconds < 3 ? `${Math.min(92, 12 + generationSeconds * 28)}%` : "96%" }}
                transition={{ duration: 0.25 }}
              />
            </div>
            <p className="text-white/60 font-body mt-2 text-xs relative z-10">{generationSeconds < 3 ? "Fast preview in progress" : "Adding the finishing details…"}</p>
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
              <Button variant="outline" size="lg" className="w-full bg-black text-white border border-white/20 hover:bg-black/80" onClick={openPhotoCapture}>
                <Camera className="w-5 h-5 mr-2" /> Take Photo Instead
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
                <Link to={`/discover?service=${encodeURIComponent(selectedService)}`} className="flex-1">
                  <Button variant="hero" className="w-full">
                    <Users className="w-4 h-4 mr-1" /> Book Service <ChevronRight className="w-4 h-4" />
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
                    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedColor(c)}
                          className="flex flex-col items-center gap-1 flex-shrink-0"
                          title={c.name}
                        >
                          <span
                            className={`w-8 h-8 rounded-full border-2 transition-all block ${
                              selectedColor.value === c.value
                                ? "border-primary scale-110 ring-2 ring-primary/40"
                                : "border-white/20 hover:border-white/50"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className={`text-[9px] font-body whitespace-nowrap ${
                            selectedColor.value === c.value ? "text-primary font-semibold" : "text-white/60"
                          }`}>
                            {c.name.split(" ")[0]}
                          </span>
                        </button>
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
                  {/* Installation service */}
                  <div>
                    <label className="text-[10px] font-body font-semibold text-white/60 mb-1.5 flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Service: {selectedService}
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                      {SERVICES.map((service) => (
                        <Button
                          key={service}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          variant={selectedService === service ? "default" : "outline"}
                          size="sm"
                          className="h-8 flex-shrink-0 whitespace-nowrap px-3 text-[10px]"
                        >
                          {service}
                        </Button>
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
            Customize Hair & Service
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
