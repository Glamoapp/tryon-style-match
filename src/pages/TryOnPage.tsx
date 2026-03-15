import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ArrowLeft, ShoppingBag, Users, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { styles, categories, type StyleCategory } from "@/data/tryOnStyles";

const TryOnPage = () => {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [activeCategory, setActiveCategory] = useState<StyleCategory>("Braids");

  const filteredStyles = styles.filter((s) => s.category === activeCategory);
  const currentStyle = filteredStyles[selectedStyle] || filteredStyles[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Try On <span className="text-gradient-rose">Hair Styles</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg font-body">
              Browse different hair styles on our model, or use AI to try them on your own face.
            </p>
            <Link to="/tryon/live">
              <Button variant="hero" className="mt-4">
                <Camera className="w-4 h-4 mr-2" /> Try On Your Face with AI
              </Button>
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
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
                {/* Model image with smooth hair transition */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentStyle.name}
                    src={currentStyle.image}
                    alt={currentStyle.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {/* Current style badge */}
                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 z-10">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white font-body">{currentStyle?.name}</span>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1.5 z-10">
                  <span className="text-xs font-semibold text-cream font-body">{currentStyle?.category}</span>
                </div>

                {/* Bottom gradient + action buttons */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent pt-16 pb-5 px-4 z-10">
                  {/* Horizontal thumbnail row */}
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
                            src={style.image}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <BookingDialog
                      styleName={currentStyle.name}
                      trigger={
                        <Button variant="hero" className="flex-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Book This Style
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      }
                    />
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
                        src={style.image}
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
