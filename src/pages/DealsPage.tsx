import { Link } from "react-router-dom";
import { Copy, ShoppingBag, Scissors, Percent } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import ReferFriendsCard from "@/components/promotions/ReferFriendsCard";
import { HOLIDAY_SALE_END, HOLIDAY_SALE_START } from "@/lib/promotions";

const deals = [
  {
    icon: ShoppingBag,
    eyebrow: "Black Friday & Cyber Monday",
    title: "Buy 2 extensions, get the 3rd free",
    detail: "Add 3 hair extensions to your cart — the lowest-priced one is free.",
    codes: ["BLACKFRIDAY", "CYBERMONDAY"],
    cta: { label: "Shop hair", to: "/extensions" },
  },
  {
    icon: Scissors,
    eyebrow: "Holiday weekend",
    title: "4 bundles, free sew-in",
    detail: "Order 4 or more bundles and add a sew-in installation — the install is free.",
    codes: ["FREESEWIN"],
    cta: { label: "Shop bundles", to: "/extensions" },
  },
  {
    icon: Percent,
    eyebrow: "Holiday weekend",
    title: "Second service 50% off",
    detail: "Book any two services in one order — the lower-priced one is half off.",
    codes: ["SECOND50"],
    cta: { label: "Book a stylist", to: "/home" },
  },
];

const dateRange = (() => {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
  const lastDay = new Date(HOLIDAY_SALE_END.getTime() - 1);
  return `${fmt(HOLIDAY_SALE_START)} – ${fmt(lastDay)}`;
})();

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success(`${code} copied — paste it at checkout`);
  } catch {
    toast.error("Couldn't copy the code");
  }
};

const DealsPage = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Black Friday & Cyber Monday Deals | NEXTLOOK"
      description="Buy 2 hair extensions get the 3rd free, free sew-in with 4 bundles, 50% off your second service, and a free service when you refer 5 friends."
      path="/deals"
    />
    <Navbar />

    <section className="pt-28 pb-12 px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">{dateRange}</p>
      <h1 className="font-logo uppercase text-5xl md:text-7xl tracking-wide text-foreground">
        Black Friday <span className="text-gold">&amp;</span> Cyber Monday
      </h1>
      <p className="font-body text-muted-foreground max-w-xl mx-auto mt-4">
        Our biggest deals of the year. Enter a code at checkout — one offer per order.
      </p>
    </section>

    <section className="px-6 pb-12">
      <div className="max-w-6xl mx-auto grid gap-5 md:grid-cols-3">
        {deals.map((d) => {
          const Icon = d.icon;
          return (
            <div key={d.title} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-body text-[11px] uppercase tracking-widest text-gold mb-1">{d.eyebrow}</p>
              <h2 className="font-logo uppercase tracking-wide text-3xl text-foreground mb-2">{d.title}</h2>
              <p className="font-body text-sm text-muted-foreground mb-5 flex-1">{d.detail}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {d.codes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => copyCode(c)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-1.5 font-mono text-sm font-semibold text-primary"
                    aria-label={`Copy code ${c}`}
                  >
                    {c} <Copy className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
              <Button asChild variant="hero" size="sm" className="self-start">
                <Link to={d.cta.to}>{d.cta.label}</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>

    <section className="px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <ReferFriendsCard />
      </div>
      <p className="max-w-3xl mx-auto mt-6 text-center text-xs font-body text-muted-foreground">
        Holiday codes work {dateRange} (Eastern time). One offer per order. Free sew-in requires a sew-in service booked
        with a NEXTLOOK stylist. Referral rewards are earned when 5 friends sign up with your link and pay for a booking.
      </p>
    </section>

    <Footer />
  </div>
);

export default DealsPage;
