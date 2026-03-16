import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { styles } from "@/data/tryOnStyles";
import tryOnImage from "@/assets/tryon-phone-face.jpg";

const FaceScanPromo = () => {
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
              Scan your face, try different hairstyles virtually, and find the
              perfect look — braids, weaves, wigs, extensions, and more. Then
              book a stylist or purchase the hair directly.
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

          {/* Right: Phone Mockup with demo video */}
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
                  {/* Demo video */}
                  <video
                    src={demoVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />

                  {/* Top badge */}
                  <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-20">
                    <div className="flex items-center gap-1.5 bg-primary/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Sparkles className="w-3 h-3 text-cream" />
                      <span className="text-[9px] font-semibold text-cream font-body">Hair Preview Demo</span>
                    </div>
                  </div>

                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent z-10" />

                  {/* Bottom label */}
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <p className="text-[9px] text-cream/70 font-body text-center">
                      Scan · Try · Choose · Book
                    </p>
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
