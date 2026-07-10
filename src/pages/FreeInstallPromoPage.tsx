import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Scissors, Crown, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const included = [
  "Premium hair extensions of your choice",
  "Complimentary sew-in OR wig installation",
  "Vetted NEXTLOOK stylist at your door",
  "No hidden fees — install is on us",
];

const eligibleServices = [
  {
    icon: Scissors,
    title: "Sew-In Installation",
    description:
      "Full sew-in with your purchased bundles. Braid-down, leave-out or closure — done in your home by a top-rated stylist.",
  },
  {
    icon: Crown,
    title: "Wig Installation",
    description:
      "Custom lace melt, glueless install, or secure adhesive application on any wig unit purchased through NEXTLOOK.",
  },
];

const steps = [
  { n: "01", t: "Shop extensions or wigs", d: "Pick your bundles, closure, or unit from the NEXTLOOK Extensions shop." },
  { n: "02", t: "Add install at checkout", d: "Select sew-in or wig install — it's automatically added at $0." },
  { n: "03", t: "Book your stylist", d: "Choose a nearby NEXTLOOK pro and a time that works. They come to you." },
  { n: "04", t: "Get glammed at home", d: "Sit back. Your stylist installs your hair in your space, on your schedule." },
];

const FreeInstallPromoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Install with Hair Extensions | NEXTLOOK"
        description="Buy premium hair extensions or a wig on NEXTLOOK and get sew-in or wig installation done for free by a vetted at-home stylist."
        path="/promo/free-install"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3D1A6E]/95 via-[#3D1A6E] to-[#2a1250] text-ivory">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #C5A55A 0%, transparent 40%), radial-gradient(circle at 80% 80%, #C5A55A 0%, transparent 45%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-[#C5A55A] text-[#2a1250] hover:bg-[#C5A55A] mb-6 tracking-widest uppercase text-xs px-4 py-1.5">
              Limited Promotion
            </Badge>
            <h1 className="font-italiana text-5xl md:text-7xl leading-tight text-ivory mb-6">
              Buy the Hair. <br />
              <span className="text-[#C5A55A]">Install is on Us.</span>
            </h1>
            <p className="font-lora text-lg md:text-xl text-ivory/85 max-w-2xl mx-auto mb-10">
              Purchase any premium hair extensions or wig from NEXTLOOK and we'll send a vetted stylist to install
              it — sew-in or wig — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#C5A55A] hover:bg-[#b3944c] text-[#2a1250] font-medium tracking-wide px-8"
              >
                <Link to="/extensions">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Extensions
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ivory/40 text-ivory hover:bg-ivory/10 hover:text-ivory px-8"
              >
                <Link to="/stylists">Browse Stylists</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 px-6 bg-ivory">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C5A55A] mb-3">What's Included</p>
            <h2 className="font-italiana text-4xl md:text-5xl text-[#3D1A6E]">
              Everything You Need — Nothing You Don't
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {included.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 bg-white border border-[#3D1A6E]/10 rounded-lg px-5 py-4"
              >
                <div className="mt-0.5 h-6 w-6 rounded-full bg-[#3D1A6E] flex items-center justify-center flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-[#C5A55A]" strokeWidth={3} />
                </div>
                <span className="font-work-sans text-[#3D1A6E]/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible services */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C5A55A] mb-3">Free Services</p>
            <h2 className="font-italiana text-4xl md:text-5xl text-[#3D1A6E]">Two Ways to Get Installed</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {eligibleServices.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-[#3D1A6E]/10 bg-gradient-to-br from-ivory to-white p-8 hover:border-[#C5A55A]/50 transition-colors"
                >
                  <div className="h-14 w-14 rounded-full bg-[#3D1A6E] flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6 text-[#C5A55A]" />
                  </div>
                  <h3 className="font-italiana text-2xl text-[#3D1A6E] mb-3">{s.title}</h3>
                  <p className="font-lora text-[#3D1A6E]/70 leading-relaxed">{s.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-[#C5A55A] font-medium text-sm tracking-wide uppercase">
                    <Sparkles className="h-4 w-4" />
                    Included Free
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-ivory">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C5A55A] mb-3">How It Works</p>
            <h2 className="font-italiana text-4xl md:text-5xl text-[#3D1A6E]">Four Simple Steps</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-xl p-6 border border-[#3D1A6E]/10">
                <div className="font-italiana text-3xl text-[#C5A55A] mb-3">{s.n}</div>
                <h4 className="font-work-sans font-medium text-[#3D1A6E] mb-2">{s.t}</h4>
                <p className="font-lora text-sm text-[#3D1A6E]/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fine print + CTA */}
      <section className="py-20 px-6 bg-[#3D1A6E] text-ivory">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-italiana text-4xl md:text-5xl mb-6">Ready for Your NEXTLOOK?</h2>
          <p className="font-lora text-ivory/80 mb-8">
            Shop the extensions shop, add sew-in or wig install at checkout, and let a vetted stylist bring the
            salon to you — at no extra cost.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#C5A55A] hover:bg-[#b3944c] text-[#2a1250] font-medium tracking-wide px-8"
          >
            <Link to="/extensions">
              Shop Hair Extensions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="mt-10 text-xs text-ivory/50 font-work-sans max-w-lg mx-auto leading-relaxed">
            Free install applies to sew-in and wig installation only, one service per qualifying purchase.
            Service must be booked with a NEXTLOOK stylist. Additional customizations (coloring, cutting, styling
            beyond install) may incur separate fees. Offer subject to stylist availability in your area.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FreeInstallPromoPage;
