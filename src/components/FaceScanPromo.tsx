import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { styles } from "@/data/tryOnStyles";
import tryOnFace from "@/assets/tryon-phone-face.jpg";

const FaceScanPromo = () => {
  const demoStyles = styles.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  // Auto-cycle through styles
  useEffect(() => {
    if (!autoCycle) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoStyles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [autoCycle, demoStyles.length]);

  const currentStyle = demoStyles[activeIndex];

  const handleSelectStyle = (index: number) => {
    setActiveIndex(index);
    setAutoCycle(false);
    // Resume auto-cycle after 6s of inactivity
    setTimeout(() => setAutoCycle(true), 6000);
  };

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
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                Hair Preview
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-cream leading-tight mb-4">
              Try On Hair
              <br />
              <span className="text-gradient-rose">Before You Buy</span>
            </h2>
            <p className="text-cream/60 font-body mb-8 max-w-md leading-relaxed">
              Browse different hairstyles on our model — braids, weaves, wigs,
              extensions, and more. See how each style looks before booking a
              service or purchasing hair.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/tryon">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Try On Hair Styles
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/extensions">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  <ShoppingBag className="w-5 h-5 mr-1" />
                  Shop Hair
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-cream/50 font-body">
                {styles.length} styles across 6 categories — free to preview
              </span>
            </div>
          </motion.div>

          {/* Right: Phone Mockup with model & hair switching */}
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
                  {/* Woman with cycling hair styles */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentStyle.name}
                      src={currentStyle.image}
                      alt={currentStyle.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>

                  {/* Top: Current style name badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 left-3 right-3 flex items-center justify-between z-20"
                  >
                    <div className="flex items-center gap-1.5 bg-primary/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Sparkles className="w-3 h-3 text-cream" />
                      <span className="text-[9px] font-semibold text-cream font-body">Hair Preview</span>
                    </div>
                    <div className="flex items-center gap-1 bg-charcoal/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="text-[9px] font-semibold text-cream font-body truncate max-w-[90px]">
                        {currentStyle.name}
                      </span>
                    </div>
                  </motion.div>

                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent z-10" />

                  {/* Bottom: Hair style selector thumbnails */}
                  <div className="absolute bottom-3 left-2 right-2 z-20">
                    <p className="text-[9px] text-cream/50 font-body mb-1.5 px-1">Tap to change hair</p>
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
                          onClick={() => handleSelectStyle(index)}
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
                  </div>
                </div>
              </div>

              {/* Glow under phone */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/15 blur-2xl rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FaceScanPromo;
