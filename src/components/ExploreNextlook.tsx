import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import bookImg from "@/assets/explore-book.jpg";
import stylistImg from "@/assets/explore-stylist.jpg";
import productsImg from "@/assets/explore-products.jpg";
import salonImg from "@/assets/explore-salon.jpg";
import mirrorImg from "@/assets/explore-mirror.jpg";

const cards = [
  {
    title: "BOOK",
    accent: "SERVICES",
    sub: "Hair, Makeup, Nails & More",
    href: "/discover",
    tone: "purple" as const,
    image: bookImg,
  },
  {
    title: "FIND",
    accent: "STYLISTS",
    sub: "Top Rated Beauty Professionals",
    href: "/stylists",
    tone: "gold" as const,
    image: stylistImg,
  },
  {
    title: "SHOP",
    accent: "PRODUCTS",
    sub: "Premium Hair & Beauty Products",
    href: "/extensions",
    tone: "purple" as const,
    image: productsImg,
  },
  {
    title: "VISIT",
    accent: "SALONS",
    sub: "Luxury Salons Near You",
    href: "/discover",
    tone: "gold" as const,
    image: salonImg,
  },
  {
    title: "AI SMART",
    accent: "MIRROR",
    sub: "Try Your Look Virtually",
    href: "/tryon",
    tone: "purple" as const,
    image: mirrorImg,
  },
];

const ExploreNextlook = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-foreground">
            EXPLORE NEXTLOOK
          </h2>
          <div className="flex justify-center mt-2">
            <Crown className="w-4 h-4 text-[hsl(38_70%_50%)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c, i) => {
            const isPurple = c.tone === "purple";
            return (
              <motion.div
                key={c.title + c.accent}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={c.href}
                  className="group block rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className="flex gap-3 p-4 pb-3 items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold leading-tight text-foreground text-base">
                        <span>{c.title}</span>
                        <br />
                        <span className={isPurple ? "text-[hsl(270_70%_40%)]" : "text-[hsl(38_70%_45%)]"}>
                          {c.accent}
                        </span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-body mt-2 leading-snug">
                        {c.sub}
                      </p>
                    </div>
                    <img
                      src={c.image}
                      alt={`${c.title} ${c.accent}`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-20 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  </div>
                  <div className="mx-4 mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-[hsl(38_70%_55%)] to-[hsl(270_70%_45%)] opacity-70 group-hover:w-16 transition-all" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreNextlook;
