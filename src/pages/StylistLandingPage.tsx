import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Check,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import PhoneWalkthrough from "@/components/PhoneWalkthrough";
import GoldenCrownBadge from "@/components/GoldenCrownBadge";

const benefits = [
  {
    icon: DollarSign,
    title: "Keep 80% of every booking",
    desc: "Transparent split. No hidden fees. Fast weekly payouts straight to your bank.",
  },
  {
    icon: Users,
    title: "Clients delivered to you",
    desc: "We handle the marketing. You just show up and style — real, paying clients in your area.",
  },
  {
    icon: Calendar,
    title: "Own your calendar",
    desc: "Set your hours, prices, and service radius. Work when you want, where you want.",
  },
  {
    icon: TrendingUp,
    title: "Grow your brand",
    desc: "Portfolio, reviews, and profile that clients can share. Your name, front and center.",
  },
  {
    icon: ShieldCheck,
    title: "Paid before you arrive",
    desc: "Every booking is prepaid. No chasing money. No no-shows without pay.",
  },
  {
    icon: Sparkles,
    title: "Free tools included",
    desc: "In-app messaging, booking tracker, review system, and cashout dashboard.",
  },
];

const StylistLandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Become a NEXTLOOK Stylist — Get Booked, Get Paid"
        description="Join NEXTLOOK as a verified stylist. Keep 80% of every booking, get real clients delivered, and earn the Golden Crown badge with a $50/month subscription."
        path="/stylist"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">
                Now accepting stylists
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Turn your talent into a <span className="text-gradient-rose">booked-out business</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto"
            >
              Join NEXTLOOK — the luxury beauty marketplace where top stylists get discovered, booked, and paid.
              Sign up in 60 seconds. Get verified. Wear the Golden Crown.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button variant="hero" size="lg" asChild className="text-base">
                <Link to="/provider/signup">
                  Sign up as a stylist <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/provider/login">I already have an account</Link>
              </Button>
            </motion.div>

            <p className="mt-4 text-xs text-muted-foreground font-body">
              Free to join · No contracts · Get your first booking this week
            </p>

            {/* 60-day no commission banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 mx-auto max-w-2xl rounded-2xl border border-[#C5A55A]/50 bg-gradient-to-r from-[#C5A55A]/10 via-primary/10 to-[#C5A55A]/10 p-5 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#F4E29A] to-[#C5A55A] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3D1A6E]" />
              </div>
              <div>
                <div className="font-display font-bold text-foreground text-base md:text-lg">
                  First 60 days — 0% commission
                </div>
                <div className="text-sm text-muted-foreground font-body">
                  New stylists keep <span className="font-semibold text-foreground">100%</span> of every booking for the first 60 days. No fees. No split. Just pure earnings.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest font-body">
              Why NEXTLOOK
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Built for stylists who take their craft seriously
            </h2>
            <p className="mt-3 text-muted-foreground font-body">
              Everything you need to grow — none of the noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-border/60 bg-card shadow-card"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phone walkthrough */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <PhoneWalkthrough />
          </div>
        </div>
      </section>

      {/* Golden Crown subscription */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto rounded-3xl border border-[#C5A55A]/40 bg-gradient-to-br from-charcoal via-[#1f1428] to-charcoal p-8 md:p-14 relative overflow-hidden">
            {/* Sparkle accents */}
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-[#C5A55A]/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="flex justify-center">
                <GoldenCrownBadge size={200} />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A55A]/15 border border-[#C5A55A]/40 mb-4">
                  <Crown className="w-3.5 h-3.5 text-[#F4E29A]" />
                  <span className="text-[11px] font-body font-semibold text-[#F4E29A] uppercase tracking-widest">
                    Verified Stylist
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-4xl font-bold text-cream leading-tight">
                  Get the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4E29A] to-[#C5A55A]">Golden Crown</span> badge
                </h2>

                <p className="mt-4 text-cream/70 font-body">
                  After you sign up, subscribe for <span className="font-bold text-cream">$50/month</span> to become a
                  verified NEXTLOOK stylist. Wear the Golden Crown badge on your profile — clients see it instantly and
                  book verified stylists first.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Golden Crown badge on your profile & search results",
                    "Priority placement in discovery",
                    "Featured in weekly client newsletters",
                    "Verified checkmark — clients trust you first",
                    "Cancel anytime, no contracts",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-cream/85 font-body text-sm">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#C5A55A]/25 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#F4E29A]" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <div className="text-4xl font-display font-bold text-cream">
                      $50<span className="text-lg text-cream/60 font-body">/month</span>
                    </div>
                    <div className="text-xs text-cream/50 font-body">Activated after signup — optional</div>
                  </div>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/provider/signup">
                      Sign up & get verified <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground max-w-2xl mx-auto leading-tight">
            Your next client is already looking for you.
          </h2>
          <p className="mt-4 text-muted-foreground font-body max-w-lg mx-auto">
            Sign up in 60 seconds and get discovered by clients in your area today.
          </p>
          <Button variant="hero" size="lg" asChild className="mt-8">
            <Link to="/provider/signup">
              Become a NEXTLOOK Stylist <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StylistLandingPage;
