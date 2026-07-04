import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Camera, ShoppingBag, Users, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";
import logo from "@/assets/logo.png";
import brandLogo from "@/assets/logo-nextlook.png";

const TryOnPage = () => {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [activeCategory, setActiveCategory] = useState<StyleCategory>("Wig Frontal & Closure");
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("tryon-intro-seen") !== "1";
  });

  const dismissIntro = () => {
    sessionStorage.setItem("tryon-intro-seen", "1");
    setShowIntro(false);
  };

  const filteredStyles = styles.filter((s) => s.category === activeCategory);
  const currentStyle = filteredStyles[selectedStyle] || filteredStyles[0];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "hsl(270 65% 18%)",
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, hsl(280 70% 40% / 0.55), transparent 55%), radial-gradient(ellipse at 80% 90%, hsl(260 80% 25% / 0.7), transparent 60%), linear-gradient(135deg, hsl(270 70% 12%) 0%, hsl(275 65% 25%) 40%, hsl(268 60% 15%) 100%)",
      }}
    >
      <SEO title="AI Virtual Try-On — Hair & Makeup | NEXTLOOK" description="See yourself in any hairstyle or makeup look instantly with AI-powered virtual try-on. Try before you book." path="/tryon" />

      {/* Intro splash — brand logo zoomed, click to get started */}
      <AnimatePresence>
        {showIntro && (
          <motion.button
            key="intro"
            type="button"
            onClick={dismissIntro}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer"
            aria-label="Get started"
          >
            <motion.img
              src={brandLogo}
              alt="NEXTLOOK"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-[78vw] max-w-[520px] h-auto object-contain drop-shadow-[0_0_60px_rgba(197,165,90,0.35)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 font-body text-sm sm:text-base tracking-[0.35em] uppercase text-[hsl(38_70%_65%)]"
            >
              Click to get started
            </motion.p>
          </motion.button>
        )}
      </AnimatePresence>

      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero section with centered logo */}
          <div className="flex flex-col items-center text-center mb-12">
            <a href="/" className="self-start inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>

            <motion.img
              src={logo}
              alt="NextLook Beauty"
              className="w-28 h-28 rounded-3xl shadow-elevated mb-6 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />

            <motion.h1
              className="text-4xl md:text-5xl font-display font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Try On <span className="text-gradient-rose">Hair Styles</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-3 max-w-md font-body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              See how different styles look on you with AI, or browse our full catalog.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Link to="/tryon/live">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  <Camera className="w-5 h-5 mr-2" /> Try On Your Face with AI
                </Button>
              </Link>
              <Link to="/stylists">
                <Button variant="gold" size="lg" className="text-base px-8 py-6">
                  <Users className="w-5 h-5 mr-2" /> Select a Stylist
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
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

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Model preview with hair switching */}
            <div className="sticky top-24">
              <div className="aspect-[3/4] max-h-[700px] rounded-3xl overflow-hidden relative shadow-elevated bg-charcoal">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentStyle.name}
                    src={currentStyle.preview}
                    alt={currentStyle.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 z-10">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white font-body">{currentStyle?.name}</span>
                </div>

                <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1.5 z-10">
                  <span className="text-xs font-semibold text-cream font-body">{currentStyle?.category}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent pt-16 pb-5 px-4 z-10">
                  <div className="mb-4">
                    <p className="text-xs text-cream/50 font-body mb-2">Tap to switch hair</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {filteredStyles.map((style, index) => (
                        <motion.div
                          key={`${style.name}-thumb`}
                          className={`relative flex-shrink-0 w-12 h-14 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                            selectedStyle === index
                              ? "ring-2 ring-primary scale-105"
                              : "ring-1 ring-cream/30 opacity-60 hover:opacity-80"
                          }`}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedStyle(index)}
                        >
                          <img
                            src={style.preview}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/stylists?specialty=${encodeURIComponent(currentStyle.category)}`} className="flex-1">
                      <Button variant="hero" className="w-full">
                        <Users className="w-4 h-4 mr-1" />
                        Select a Stylist
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/extensions" className="flex-1">
                      <Button variant="gold" className="w-full">
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Buy Hair
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Style selection grid */}
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Choose a Style
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-6">
                {filteredStyles.length} styles in {activeCategory} — tap any to preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredStyles.map((style, index) => (
                  <div
                    key={`${style.name}-${index}`}
                    onClick={() => setSelectedStyle(index)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                      selectedStyle === index
                        ? "ring-2 ring-primary shadow-soft scale-[1.02]"
                        : "ring-1 ring-border hover:ring-primary/50"
                    }`}
                  >
                    <div className="aspect-[3/4]">
                      <img
                        src={style.preview}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-display font-semibold text-white text-sm">{style.name}</h4>
                      <span className="text-xs text-white/70 font-body">{style.category}</span>
                    </div>
                    {selectedStyle === index && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TryOnPage;
