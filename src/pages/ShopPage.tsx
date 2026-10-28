import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import rewardsImg from "@/assets/rewards-white-metal.jpg";
import heroBeauty from "@/assets/hero-beauty-mirror-white.jpg";
import stylistImg from "@/assets/shop-stylist-cutout.png";
import hairImg from "@/assets/hair-body-wave.png";
import mirrorImg from "@/assets/mirror-hero-reflect.png";
import accessoriesImg from "@/assets/blowdryer-pin.png";

interface Tile {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
  image?: string;
  imageAlt?: string;
  dark?: boolean;
  card?: boolean;
  wide?: boolean;
  heroImage?: boolean;
  cutoutImage?: boolean;
}

const TILES: Tile[] = [
  {
    eyebrow: "NEXTLOOK Stylists",
    title: "Book a Stylist",
    subtitle: "Luxury hair, braids, and makeup — at home or in salon.",
    primary: { label: "Book now", to: "/discover" },
    secondary: { label: "Learn more", to: "/stylists" },
    image: stylistImg,
    imageAlt: "Woman with long black waves looking over her shoulder",
    cutoutImage: true,
  },
  {
    eyebrow: "NEXTLOOK Hair",
    title: "Shop Hair",
    subtitle: "Raw bundles, wigs, frontals, and extensions — delivered fast.",
    primary: { label: "Shop hair", to: "/extensions" },
    secondary: { label: "Try it on", to: "/tryon" },
    image: hairImg,
    imageAlt: "Raw body wave hair bundles",
  },
  {
    eyebrow: "NEXTLOOK Genesis",
    title: "Welcome",
    subtitle: "Try on looks, book stylists, and glow — right from your wall.",
    primary: { label: "Pre-order", to: "/mirror/preorder" },
    secondary: { label: "Learn more", to: "/mirror" },
    image: mirrorImg,
    imageAlt: "NEXTLOOK Genesis smart mirror",
    wide: true,
    heroImage: true,
  },
  {
    eyebrow: "NEXTLOOK Accessories",
    title: "Accessories",
    subtitle: "Pins, tools, and finishing touches for every look.",
    primary: { label: "Shop accessories", to: "/extensions" },
    image: accessoriesImg,
    imageAlt: "NEXTLOOK beauty accessories",
    wide: true,
  },
  {
    eyebrow: "NEXTLOOK Rewards",
    title: "The Rewards Card",
    subtitle: "Earn points on every booking and purchase. Glow up, get rewarded.",
    primary: { label: "Learn more", to: "/glowup-monday" },
    secondary: { label: "Join now", to: "/auth" },
    card: true,
    wide: true,
  },
];

const TileCard = ({ tile }: { tile: Tile }) => (
  <div
    className={`flex flex-col items-center overflow-hidden bg-shop-surface px-6 pt-12 text-center text-shop-ink ${tile.wide ? "md:col-span-2" : ""}`}
  >
    {tile.eyebrow && (
      <p
        className="text-xs font-semibold uppercase text-gold"
      >
        {tile.eyebrow}
      </p>
    )}
    <h2 className="mt-2 font-display text-3xl md:text-4xl">{tile.title}</h2>
    <p
      className="mt-2 max-w-lg text-sm text-shop-muted md:text-base"
    >
      {tile.subtitle}
    </p>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <Button asChild className="rounded-full bg-mirror-action px-5 text-mirror-action-foreground hover:bg-mirror-action-hover">
        <Link to={tile.primary.to}>{tile.primary.label}</Link>
      </Button>
      {tile.secondary && (
        <Button asChild variant="outline" className="rounded-full border-shop-ink/40 bg-transparent px-5 text-shop-ink hover:bg-background hover:text-shop-ink">
          <Link to={tile.secondary.to}>{tile.secondary.label}</Link>
        </Button>
      )}
    </div>

    {tile.card ? (
      <div className="my-10 w-full max-w-xl">
        <img src={rewardsImg} alt="Realistic metallic white NEXTLOOK rewards membership card with a gold chip and no star logo" width={1200} height={800} loading="lazy" className="h-auto w-full rounded-lg" />
      </div>
    ) : (
      tile.image && (
        <div className={`mt-6 w-full flex-1 ${tile.heroImage ? "pb-16" : ""}`}>
          <img
            src={tile.image}
            alt={tile.imageAlt}
            width={tile.heroImage ? 832 : undefined}
            height={tile.heroImage ? 896 : undefined}
            className={
              tile.heroImage
                ? "mx-auto h-[560px] w-auto max-w-full md:h-[960px]"
                : tile.cutoutImage
                  ? "mx-auto h-[440px] w-full object-contain object-bottom"
                  : `mx-auto w-full ${tile.wide ? "h-[360px] object-contain md:h-[500px]" : "h-full max-h-[440px] object-cover object-top"}`
            }
            loading="lazy"
          />
        </div>
      )
    )}
  </div>
);

const ShopPage = () => {
  useEffect(() => {
    document.title = "NEXTLOOK — Book Stylists, Shop Hair, Mirrors & More";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        path="/shop"
        title="NEXTLOOK — Book Stylists, Shop Hair, Mirrors & More"
        description="One place for beauty on demand: book a stylist, shop raw hair and extensions, pre-order the NEXTLOOK Genesis smart mirror, and join the NEXTLOOK Rewards Card."
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-zinc-950 pb-0 pt-28 text-center text-white">
        <p className="invisible text-xs font-semibold uppercase tracking-[0.3em] text-amber-400" aria-hidden="true">
          Beauty On Demand
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl">NEXTLOOK</h1>
        <p className="mx-auto mt-3 max-w-xl px-6 text-base text-zinc-300 md:text-lg">
          Book a stylist. Shop luxury hair. Meet your new smart mirror. All in one place.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/discover"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Book a stylist
          </Link>
          <Link
            to="/extensions"
            className="rounded-full border border-white/60 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Shop hair
          </Link>
        </div>
        <div className="mx-auto mt-12 max-w-5xl px-4">
          <img
            src={heroBeauty}
            alt="A woman beside a smart mirror in an elegant white room displaying music, time, date, and Psalm 46:10"
            className="h-[420px] w-full rounded-t-3xl object-cover object-top md:h-[520px]"
          />
        </div>
        <div className="pb-10" />
      </section>

      {/* Tile grid */}
      <section className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-4 px-4 py-10 md:grid-cols-2 md:px-6">
        {[...TILES.filter((tile) => !tile.wide), ...TILES.filter((tile) => tile.wide && !tile.card), ...TILES.filter((tile) => tile.card)].map((tile) => (
          <TileCard key={tile.title} tile={tile} />
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default ShopPage;
