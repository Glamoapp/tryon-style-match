import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Sparkles, ChevronRight, X, ScanFace, RefreshCw } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";

const VirtualTryOn = () => {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [activeCategory, setActiveCategory] = useState<StyleCategory>("All");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStyles = activeCategory === "All"
    ? styles
    : styles.filter((s) => s.category === activeCategory);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    setFaceDetected(false);
    setShowOverlay(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 800 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setUserPhoto(null);
      setIsScanning(true);
      setTimeout(() => {
        setFaceDetected(true);
        setIsScanning(false);
        setShowOverlay(true);
      }, 2500);
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setUserPhoto(canvas.toDataURL("image/jpeg"));
      stopCamera();
      setShowOverlay(true);
      setFaceDetected(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUserPhoto(ev.target?.result as string);
        stopCamera();
        setIsScanning(true);
        setTimeout(() => {
          setFaceDetected(true);
          setIsScanning(false);
          setShowOverlay(true);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAll = () => {
    stopCamera();
    setUserPhoto(null);
    setFaceDetected(false);
    setShowOverlay(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentStyle = filteredStyles[selectedStyle] || filteredStyles[0];
  const hasVisual = isCameraActive || userPhoto;

  return (
    <section id="tryon" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
            AI Face Scanner
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Scan Your Face &{" "}
            <span className="text-gradient-gold">Try On Looks</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto font-body">
            Our AI scans your face to perfectly overlay hairstyles and makeup so you can see your new look before booking.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedStyle(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-muted-foreground hover:bg-secondary border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Camera / Photo area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {!hasVisual ? (
              <div className="aspect-[3/4] rounded-3xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center shadow-card">
                <div className="w-24 h-24 rounded-full bg-purple-light flex items-center justify-center mb-6 relative">
                  <ScanFace className="w-10 h-10 text-purple" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-pulse" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Scan Your Face
                </h3>
                <p className="text-muted-foreground text-sm font-body mb-6 text-center px-8">
                  Use your camera for a live face scan or upload a front-facing photo
                </p>
                <div className="flex gap-3">
                  <Button variant="hero" size="sm" onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-1" /> Open Camera
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-1" /> Upload Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-elevated bg-charcoal">
                {isCameraActive && (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay playsInline muted
                    style={{ transform: "scaleX(-1)" }}
                  />
                )}
                {userPhoto && (
                  <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                )}

                {/* Scanning overlay */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-charcoal/30" />
                      <div className="relative w-48 h-60 md:w-56 md:h-72">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                        <motion.div
                          className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                          animate={{ top: ["10%", "90%", "10%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      <div className="absolute bottom-8 left-0 right-0 text-center">
                        <div className="inline-flex items-center gap-2 bg-charcoal/80 backdrop-blur-sm px-4 py-2 rounded-full">
                          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-sm font-body text-cream">Scanning your face...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Style overlay */}
                <AnimatePresence>
                  {faceDetected && showOverlay && currentStyle && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0"
                    >
                      <div className="absolute inset-0">
                        <img
                          src={currentStyle.image}
                          alt={currentStyle.name}
                          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                      </div>
                      <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <ScanFace className="w-4 h-4 text-cream" />
                        <span className="text-sm font-semibold text-cream font-body">Face Detected</span>
                      </div>
                      <div className="absolute top-4 right-12 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink" />
                        <span className="text-sm font-semibold text-cream font-body">{currentStyle.name}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={clearAll}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal/80 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4 text-cream" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 space-y-2 z-10">
                  {isCameraActive && (
                    <Button variant="hero" className="w-full" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-1" /> Capture Photo
                    </Button>
                  )}
                  {userPhoto && faceDetected && currentStyle && (
                    <BookingDialog
                      styleName={currentStyle.name}
                      trigger={
                        <Button variant="hero" className="w-full">
                          Book This Style <ChevronRight className="w-4 h-4" />
                        </Button>
                      }
                    />
                  )}
                  <Button
                    variant="outline"
                    className="w-full bg-background/80 backdrop-blur-sm"
                    size="sm"
                    onClick={() => { clearAll(); startCamera(); }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Rescan Face
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Style selection grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Choose a Style
            </h3>
            <p className="text-sm text-muted-foreground font-body mb-6">
              {filteredStyles.length} styles in {activeCategory === "All" ? "all categories" : activeCategory}
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredStyles.map((style, index) => (
                <div
                  key={`${style.name}-${index}`}
                  onClick={() => {
                    setSelectedStyle(index);
                    if (faceDetected) setShowOverlay(true);
                  }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                    selectedStyle === index
                      ? "ring-2 ring-primary shadow-soft scale-[1.02]"
                      : "ring-1 ring-border hover:ring-primary/50"
                  }`}
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-display font-semibold text-cream text-sm">{style.name}</h4>
                    <span className="text-xs text-cream/70 font-body">{style.category}</span>
                  </div>
                  {selectedStyle === index && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
