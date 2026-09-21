// FaceScanPromo - static image version
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingBag } from "lucide-react";
import { styles } from "@/data/tryOnStyles";
import MirrorExperience from "@/components/MirrorExperience";

const FaceScanPromo = () => {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        backgroundColor: "hsl(270 65% 18%)",
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, hsl(280 70% 40% / 0.55), transparent 55%), radial-gradient(ellipse at 80% 90%, hsl(260 80% 25% / 0.7), transparent 60%), linear-gradient(135deg, hsl(270 70% 12%) 0%, hsl(275 65% 25%) 40%, hsl(268 60% 15%) 100%)",
      }}
    >
      {/* Metallic sheen */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 30%, hsl(285 80% 75% / 0.35) 48%, hsl(0 0% 100% / 0.15) 52%, transparent 70%)",
        }}
      />

      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/6 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(380px,1.2fr)] lg:items-center">
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
                  Virtual Try-On
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
            className="flex justify-center lg:justify-end"
          >
            <div className="relative mx-auto w-full max-w-[360px] lg:mr-0 lg:max-w-[440px]">
              {/* Responsive smart-mirror frame */}
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-foreground/20 bg-charcoal shadow-elevated sm:rounded-[2.5rem]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/20 rounded-b-2xl z-30" />

                {/* Screen content */}
                <div className="relative aspect-[9/16] overflow-hidden bg-charcoal">
                  {/* Smart Mirror step-by-step experience */}
                  <MirrorExperience />
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
