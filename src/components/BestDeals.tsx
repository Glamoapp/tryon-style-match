import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tag, ChevronRight, Percent, ShoppingBag } from "lucide-react";
import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";
import frontalImg from "@/assets/style-frontal.jpg";
import bodyWaveImg from "@/assets/style-body-wave.jpg";
import deepWaveImg from "@/assets/style-deep-wave.jpg";

const deals = [
  {
    id: "deal-1",
    title: "Full Sew-In Weave",
    image: weaveImg,
    originalPrice: 180,
    discountPrice: 120,
    type: "service" as const,
    badge: "33% OFF",
  },
  {
    id: "deal-2",
    title: "Body Wave Bundle",
    image: bodyWaveImg,
    originalPrice: 199,
    discountPrice: 149,
    type: "product" as const,
    badge: "BEST SELLER",
  },
  {
    id: "deal-3",
    title: "Knotless Braids",
    image: braidsImg,
    originalPrice: 150,
    discountPrice: 85,
    type: "service" as const,
    badge: "43% OFF",
  },
  {
    id: "deal-4",
    title: "13x4 Frontal Wig",
    image: frontalImg,
    originalPrice: 299,
    discountPrice: 199,
    type: "product" as const,
    badge: "HOT DEAL",
  },
  {
    id: "deal-5",
    title: "K-Tip Extensions",
    image: ktipsImg,
    originalPrice: 200,
    discountPrice: 150,
    type: "service" as const,
    badge: "25% OFF",
  },
  {
    id: "deal-6",
    title: "Deep Wave Bundle",
    image: deepWaveImg,
    originalPrice: 179,
    discountPrice: 129,
    type: "product" as const,
    badge: "NEW",
  },
  {
    id: "deal-7",
    title: "Wig Install + Style",
    image: wigsImg,
    originalPrice: 160,
    discountPrice: 95,
    type: "service" as const,
    badge: "40% OFF",
  },
  {
    id: "deal-8",
    title: "Glam Makeup",
    image: makeupImg,
    originalPrice: 120,
    discountPrice: 65,
    type: "service" as const,
    badge: "POPULAR",
  },
];

const BestDeals = () => {
  return (
    <section className="py-12 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">
                Limited Time
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Best Deals
            </h2>
          </div>
          <Link to="/extensions">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="min-w-[200px] md:min-w-0"
            >
              <Link
                to={deal.type === "product" ? "/extensions" : "/stylists"}
                className="block group"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    {/* Badge */}
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5">
                      <span className="text-[10px] font-bold font-body">{deal.badge}</span>
                    </div>
                    {/* Type indicator */}
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full p-1.5">
                      {deal.type === "product" ? (
                        <ShoppingBag className="w-3 h-3 text-accent" />
                      ) : (
                        <Tag className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-foreground text-sm truncate">
                      {deal.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-bold text-primary font-body">
                        ${deal.discountPrice}
                      </span>
                      <span className="text-xs text-muted-foreground line-through font-body">
                        ${deal.originalPrice}
                      </span>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full mt-3 text-xs h-8"
                    >
                      {deal.type === "product" ? "Buy Now" : "Book Now"}
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestDeals;
