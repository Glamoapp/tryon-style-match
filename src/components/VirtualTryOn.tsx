import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ScanFace } from "lucide-react";
import { styles } from "@/data/tryOnStyles";

const VirtualTryOn = () => {
  const previewStyles = styles.slice(0, 6);

  return (
    <section id="tryon" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
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
            Take a photo and see how different hairstyles look on you before booking. No template faces — just your real photo with styles overlaid.
          </p>
        </motion.div>

        {/* Preview grid of styles */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto mb-10">
          {previewStyles.map((style, index) => (
            <motion.div
              key={style.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] group"
            >
              <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h4 className="font-display font-semibold text-white text-xs">{style.name}</h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-card mb-6">
            <ScanFace className="w-5 h-5 text-primary" />
            <span className="text-sm font-body text-foreground font-medium">
              {styles.length} styles across 6 categories
            </span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <Link to="/tryon">
              <Button variant="hero" size="lg" className="text-base px-10 py-6">
                Open Try-On Studio <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTryOn;
