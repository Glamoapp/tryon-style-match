import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import heroBeauty from "@/assets/hero-beauty-mirror.jpg";
import stylistImg from "@/assets/stylist-1.jpg";
import hairImg from "@/assets/hair-body-wave.png";
import mirrorImg from "@/assets/mirror-genesis-standless.jpg";
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
}

const TILES: Tile[] = [
  {
    eyebrow: "NEXTLOOK Stylists",
    title: "Book a Stylist",
    subtitle: "Luxury hair, braids, and makeup — at home or in salon.",
    primary: { label: "Book now", to: "/discover" },
    secondary: { label: "Learn more", to: "/stylists" },
    image: stylistImg,
    imageAlt: "NEXTLOOK stylist styling a client's hair",
    dark: true,
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
    title: "The Smart Mirror",
    subtitle: "Try on looks, book stylists, and glow — right from your wall.",
    primary: { label: "Pre-order", to: "/mirror/preorder" },
    secondary: { label: "Learn more", to: "/mirror" },
    image: mirrorImg,
    imageAlt: "NEXTLOOK Genesis smart mirror",
    dark: true,
  },
  {
    eyebrow: "NEXTLOOK Accessories",
    title: "Accessories",
    subtitle: "Pins, tools, and finishing touches for every look.",
    primary: { label: "Shop accessories", to: "/extensions" },
    image: accessoriesImg,
    imageAlt: "NEXTLOOK beauty accessories",
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
    className={`flex flex-col items-center overflow-hidden rounded-2xl px-6 pt-12 text-center ${
      tile.dark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
    } ${tile.wide ? "md:col-span-2" : ""}`}
  >
    {tile.eyebrow && (
      <p
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          tile.dark ? "text-amber-400" : "text-amber-600"
        }`}
      >
        {tile.eyebrow}
      </p>
    )}
    <h2 className="mt-2 font-display text-3xl md:text-4xl">{tile.title}</h2>
    <p
      className={`mt-2 max-w-sm text-sm md:text-base ${
        tile.dark ? "text-zinc-300" : "text-zinc-600"
      }`}
    >
      {tile.subtitle}
    </p>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <Link
        to={tile.primary.to}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
          tile.dark
            ? "bg-white text-zinc-900 hover:bg-zinc-200"
            : "bg-zinc-900 text-white hover:bg-zinc-700"
        }`}
      >
        {tile.primary.label}
      </Link>
      {tile.secondary && (
        <Link
          to={tile.secondary.to}
          className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
            tile.dark
              ? "border-white/60 text-white hover:bg-white/10"
              : "border-zinc-900/40 text-zinc-900 hover:bg-zinc-900/5"
          }`}
        >
          {tile.secondary.label}
        </Link>
      )}
    </div>

    {tile.card ? (
      <div className="mt-10 mb-[-40px] w-full max-w-sm">
        <div className="aspect-[8/5] w-full rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-purple-950 p-5 text-left shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg tracking-wide text-white">NEXTLOOK</span>
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-6 h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-amber-500" />
          <p className="mt-6 font-mono text-sm tracking-[0.25em] text-zinc-300">
            •••• •••• •••• 2026
          </p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-xs uppercase tracking-widest text-zinc-400">Rewards Member</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              GlowUp
            </span>
          </div>
        </div>
      </div>
    ) : (
      tile.image && (
        <div className="mt-10 w-full flex-1">
          <img
            src={tile.image}
            alt={tile.imageAlt}
            className="mx-auto h-full max-h-80 w-full object-cover object-top"
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          Beauty On Demand
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl" aria-hidden="true">
          <span className="invisible">NEXTLOOK</span>
        </h1>
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
            alt="A NEXTLOOK client with a finished luxury beauty look"
            className="h-[420px] w-full rounded-t-3xl object-cover object-top md:h-[520px]"
          />
        </div>
      </section>

      {/* Tile grid */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-10 md:grid-cols-2">
        {TILES.map((tile) => (
          <TileCard key={tile.title} tile={tile} />
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default ShopPage;
