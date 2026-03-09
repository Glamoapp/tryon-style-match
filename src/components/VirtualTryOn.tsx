import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Camera, Upload, Sparkles, ChevronRight } from "lucide-react";
import braidsImg from "@/assets/service-braids.jpg";
import haircutImg from "@/assets/service-haircut.jpg";
import locsImg from "@/assets/service-locs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";

const styles = [
  { name: "Box Braids", category: "Braids", image: braidsImg },
  { name: "Pixie Cut", category: "Haircut", image: haircutImg },
  { name: "Faux Locs", category: "Locs", image: locsImg },
  { name: "Glam Makeup", category: "Makeup", image: makeupImg },
];

const VirtualTryOn = () => {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  return (
    <section id="tryon" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">AI Powered</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Virtual <span className="text-gradient-gold">Try-On</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-body">
            Upload your photo and see how different styles look on you before you book.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Upload / Preview area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {!uploaded ? (
              <div
                onClick={() => setUploaded(true)}
                className="aspect-[3/4] rounded-3xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors shadow-card"
              >
                <div className="w-20 h-20 rounded-full bg-rose-light flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Upload Your Photo</h3>
                <p className="text-muted-foreground text-sm font-body mb-6 text-center px-8">
                  Take a selfie or upload a front-facing photo for the best results
                </p>
                <div className="flex gap-3">
                  <Button variant="hero" size="sm">
                    <Camera className="w-4 h-4 mr-1" /> Take Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-elevated">
                <img
                  src={styles[selectedStyle].image}
                  alt="Virtual try-on preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-sm font-semibold text-cream font-body">
                    {styles[selectedStyle].name}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <Button variant="hero" className="w-full" onClick={() => setUploaded(false)}>
                    Book This Style <ChevronRight className="w-4 h-4" />
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
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">Choose a Style</h3>
            {styles.map((style, index) => (
              <div
                key={style.name}
                onClick={() => { setSelectedStyle(index); setUploaded(true); }}
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
                  <h4 className="font-display font-semibold text-foreground">{style.name}</h4>
                  <span className="text-sm text-muted-foreground font-body">{style.category}</span>
                </div>
                <ChevronRight className={`w-5 h-5 transition-colors ${
                  selectedStyle === index ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
