import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Camera, Upload, Sparkles, ChevronRight, X } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setUserPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <section id="tryon" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

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
            Take a selfie or upload your photo to see how different styles look on you before you book.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Upload / Preview area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {!userPhoto ? (
              <div className="aspect-[3/4] rounded-3xl border-2 border-dashed border-primary/30 bg-card flex flex-col items-center justify-center shadow-card">
                <div className="w-20 h-20 rounded-full bg-rose-light flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Upload Your Photo</h3>
                <p className="text-muted-foreground text-sm font-body mb-6 text-center px-8">
                  Take a selfie or upload a front-facing photo for the best results
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-1" /> Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-elevated">
                <img
                  src={userPhoto}
                  alt="Your uploaded photo"
                  className="w-full h-full object-cover"
                />
                {/* Style overlay indicator */}
                <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-sm font-semibold text-cream font-body">
                    {styles[selectedStyle].name}
                  </span>
                </div>
                <button
                  onClick={clearPhoto}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-cream" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <Button variant="hero" className="w-full">
                    Book This Style <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-background/80 backdrop-blur-sm"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
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
                onClick={() => setSelectedStyle(index)}
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
