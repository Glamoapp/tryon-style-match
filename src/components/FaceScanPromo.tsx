import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Sparkles, ArrowRight } from "lucide-react";
import { styles } from "@/data/tryOnStyles";

const FaceScanPromo = () => {
  const demoStyles = styles.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [showStyles, setShowStyles] = useState(false);

  // Simulate the scan → reveal → auto-cycle flow
  useEffect(() => {
    const scanTimer = setTimeout(() => {
      setIsScanning(false);
      setShowStyles(true);
    }, 2800);
    return () => clearTimeout(scanTimer);
  }, []);

  // Auto-cycle through styles once scanning is done
  useEffect(() => {
    if (!showStyles) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoStyles.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [showStyles, demoStyles.length]);

  const currentStyle = demoStyles[activeIndex];

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/6 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ScanFace className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                AI Powered
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-cream leading-tight mb-4">
              Try On Hair
              <br />
              <span className="text-gradient-rose">Before You Book</span>
            </h2>
            <p className="text-cream/60 font-body mb-8 max-w-md leading-relaxed">
              Scan your face and instantly preview different hairstyles — braids, weaves, 
              wigs, and more. See exactly how you'll look before booking a service or 
              buying extensions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/tryon">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Try On Hair Extensions
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-cream/50 font-body">
                {styles.length} styles across 6 categories — free to try
              </span>
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-[280px] sm:w-[300px] mx-auto">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border-[6px] border-foreground/20 bg-charcoal shadow-elevated overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/20 rounded-b-2xl z-30" />

                {/* Screen content */}
                <div className="relative aspect-[9/19] overflow-hidden bg-charcoal">
                  {/* Current style image as full background */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentStyle.name}
                      src={currentStyle.image}
                      alt={currentStyle.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>

                  {/* Scanning overlay */}
                  <AnimatePresence>
                    {isScanning && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-charcoal/40" />
                        {/* Scan brackets */}
                        <div className="relative w-32 h-44">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                          {/* Scan line */}
                          <motion.div
                            className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                            animate={{ top: ["5%", "90%", "5%"] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                        {/* Scanning text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-charcoal/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <motion.div
                              className="w-2 h-2 rounded-full bg-primary"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-body text-cream/90">Scanning face...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top status bar */}
                  {showStyles && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-8 left-3 right-3 flex items-center justify-between z-20"
                    >
                      <div className="flex items-center gap-1.5 bg-emerald-500/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <ScanFace className="w-3 h-3 text-cream" />
                        <span className="text-[9px] font-semibold text-cream font-body">Face Detected</span>
                      </div>
                      <div className="flex items-center gap-1 bg-charcoal/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-semibold text-cream font-body truncate max-w-[80px]">
                          {currentStyle.name}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Gradient overlay at bottom for readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent z-10" />

                  {/* Bottom style selector thumbnails */}
                  {showStyles && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-3 left-2 right-2 z-20"
                    >
                      <p className="text-[9px] text-cream/50 font-body mb-1.5 px-1">Choose a style</p>
                      <div className="flex gap-1.5 overflow-x-hidden">
                        {demoStyles.map((style, index) => (
                          <motion.div
                            key={style.name}
                            className={`relative flex-shrink-0 w-10 h-12 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                              activeIndex === index
                                ? "ring-[2px] ring-primary scale-105"
                                : "ring-1 ring-cream/20 opacity-60"
                            }`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveIndex(index)}
                          >
                            <img
                              src={style.image}
                              alt={style.name}
                              className="w-full h-full object-cover"
                            />
                            {activeIndex === index && (
                              <motion.div
                                layoutId="phone-selector"
                                className="absolute inset-0 border-2 border-primary rounded-lg"
                              />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Reflection / glow under phone */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/15 blur-2xl rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FaceScanPromo;
