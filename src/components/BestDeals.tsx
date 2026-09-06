import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tag, ChevronRight, ShoppingBag, Scissors, Star } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";
import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";
import barberImg from "@/assets/service-barber.jpg";
import bodyWaveImg from "@/assets/style-body-wave.jpg";
import frontalImg from "@/assets/style-frontal.jpg";
import deepWaveImg from "@/assets/style-deep-wave.jpg";

// Fallback static hair deals (products, not provider services)
const hairDeals = [
  { id: "hd-1", title: "Body Wave Bundle", image: bodyWaveImg, originalPrice: 199, discountPrice: 149, badge: "BEST SELLER" },
  { id: "hd-2", title: "13x4 Frontal Wig", image: frontalImg, originalPrice: 299, discountPrice: 199, badge: "HOT DEAL" },
  { id: "hd-3", title: "Deep Wave Bundle", image: deepWaveImg, originalPrice: 179, discountPrice: 129, badge: "NEW" },
];

// Fallback images by keyword
const fallbackImages: Record<string, string> = {
  weave: weaveImg, "sew-in": weaveImg, sewin: weaveImg,
  braid: braidsImg, knotless: braidsImg, cornrow: braidsImg,
  "k-tip": ktipsImg, ktip: ktipsImg, extension: ktipsImg, "i-tip": ktipsImg,
  wig: wigsImg, frontal: wigsImg, closure: wigsImg, "lace front": wigsImg,
  makeup: makeupImg, glam: makeupImg, beat: makeupImg,
  barber: barberImg, fade: barberImg, lineup: barberImg, taper: barberImg, haircut: barberImg,
};

const getFallbackImage = (serviceName: string) => {
  const lower = serviceName.toLowerCase();
  for (const [key, img] of Object.entries(fallbackImages)) {
    if (lower.includes(key)) return img;
  }
  return weaveImg;
};

interface DealCardProps {
  deal: { id: string; title: string; image: string; originalPrice: number; discountPrice: number; badge: string; providerName?: string; providerId?: string; rating?: number };
  index: number;
  linkTo: string;
  ctaLabel: string;
  typeIcon: React.ReactNode;
}

const DealCard = ({ deal, index, linkTo, ctaLabel, typeIcon }: DealCardProps) => (
  <motion.div
    key={deal.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className=""
  >
    <Link to={linkTo} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5">
            <span className="text-[10px] font-bold font-body">{deal.badge}</span>
          </div>
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full p-1.5">
            {typeIcon}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-display font-bold text-foreground text-sm truncate">{deal.title}</h3>
          {deal.providerName && (
            <p className="text-[10px] text-muted-foreground font-body flex items-center gap-1 mt-0.5">
              by {deal.providerName}
              {deal.rating ? (
                <span className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-gold text-gold" /> {deal.rating}
                </span>
              ) : null}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base font-bold text-primary font-body">${deal.discountPrice}</span>
            <span className="text-xs text-muted-foreground line-through font-body">${deal.originalPrice}</span>
          </div>
          <Button variant="hero" size="sm" className="w-full mt-3 text-xs h-8">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Link>
  </motion.div>
);

const BestDeals = () => {
  const { providers, loading } = useProviders();

  // Build real service deals from providers who have set discount prices
  const serviceDeals = providers
    .flatMap((p) =>
      p.services
        .filter((s) => (s as any).discount_price && (s as any).discount_price < s.price)
        .map((s) => {
          const discountPrice = (s as any).discount_price as number;
          const pct = Math.round(((s.price - discountPrice) / s.price) * 100);
          const photo = s.photos[0];
          return {
            id: s.id,
            title: s.service_name,
            image: photo || getFallbackImage(s.service_name),
            originalPrice: s.price,
            discountPrice,
            badge: (s as any).discount_badge || `${pct}% OFF`,
            providerName: p.full_name,
            providerId: p.id,
            rating: p.rating,
          };
        })
    )
    .slice(0, 8);

  return (
    <section className="py-12 bg-gradient-warm space-y-14">
      <div className="container mx-auto px-6">
        {/* ── Best Deals in Services ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="w-4 h-4 text-primary" />
              <span className="text-sm md:text-base font-logo font-bold text-primary uppercase tracking-[0.08em]">
                Services
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-logo font-bold text-foreground uppercase tracking-[0.03em]">
              Best Deals in Services
            </h2>
          </div>
          <Link to="/stylists">
            <Button variant="ghost" size="sm" className="text-primary font-body">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {serviceDeals.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
            {serviceDeals.map((deal, index) => (
              <div key={deal.id} className="snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)]">
                <DealCard
                  deal={deal}
                  index={index}
                  linkTo={`/stylist/${deal.providerId}`}
                  ctaLabel="Book Now"
                  typeIcon={<Tag className="w-3 h-3 text-primary" />}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground font-body py-6 text-sm">
            {loading ? "Loading deals..." : "No active service deals right now. Check back soon!"}
          </p>
        )}
      </div>

    </section>
  );
};

export default BestDeals;
