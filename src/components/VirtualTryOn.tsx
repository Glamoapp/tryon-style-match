import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Sparkles, ChevronRight, X, ScanFace, RefreshCw } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";

const styles = [
  { name: "Weave Sew-In", category: "Weave", image: weaveImg },
  { name: "Box Braids", category: "Braids", image: braidsImg },
  { name: "K-Tip Extensions", category: "K-Tips", image: ktipsImg },
  { name: "Lace Front Wig", category: "Wigs", image: wigsImg },
  { name: "Glam Makeup", category: "Makeup", image: makeupImg },
];

const VirtualTryOn = () => {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Simulate face scanning
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
        // Simulate face scan on uploaded photo
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

  const hasVisual = isCameraActive || userPhoto;

  return (
    <section id="tryon" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
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

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Upload Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-elevated bg-charcoal">
                {/* Live camera feed */}
                {isCameraActive && (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                  />
                )}

                {/* Captured / uploaded photo */}
                {userPhoto && (
                  <img
                    src={userPhoto}
                    alt="Your photo"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Face scanning overlay */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-charcoal/30" />
                      {/* Scanning frame */}
                      <div className="relative w-48 h-60 md:w-56 md:h-72">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                        {/* Scanning line */}
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

                {/* Face detected & style overlay */}
                <AnimatePresence>
                  {faceDetected && showOverlay && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0"
                    >
                      {/* Style overlay image with blend */}
                      <div className="absolute inset-0">
                        <img
                          src={styles[selectedStyle].image}
                          alt={styles[selectedStyle].name}
                          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                      </div>

                      {/* Face detected badge */}
                      <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <ScanFace className="w-4 h-4 text-cream" />
                        <span className="text-sm font-semibold text-cream font-body">
                          Face Detected
                        </span>
                      </div>

                      {/* Style name */}
                      <div className="absolute top-4 right-12 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink" />
                        <span className="text-sm font-semibold text-cream font-body">
                          {styles[selectedStyle].name}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close button */}
                <button
                  onClick={clearAll}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal/80 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4 text-cream" />
                </button>

                {/* Bottom controls */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2 z-10">
                  {isCameraActive && (
                    <Button variant="hero" className="w-full" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-1" /> Capture Photo
                    </Button>
                  )}
                  {userPhoto && faceDetected && (
                    <Button variant="hero" className="w-full">
                      Book This Style <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full bg-background/80 backdrop-blur-sm"
                    size="sm"
                    onClick={() => {
                      clearAll();
                      startCamera();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Rescan Face
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Style selection */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">
              Choose a Style
            </h3>
            {styles.map((style, index) => (
              <div
                key={style.name}
                onClick={() => {
                  setSelectedStyle(index);
                  if (faceDetected) setShowOverlay(true);
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedStyle === index
                    ? "bg-primary/10 border-2 border-primary shadow-soft"
                    : "bg-card border-2 border-transparent hover:border-border shadow-card"
                }`}
              >
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-foreground">
                    {style.name}
                  </h4>
                  <span className="text-sm text-muted-foreground font-body">
                    {style.category}
                  </span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-colors ${
                    selectedStyle === index
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
