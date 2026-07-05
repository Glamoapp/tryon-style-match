import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock, DollarSign, Users, Award, TrendingUp, Check, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const perks = [
  { icon: DollarSign, title: "0% commission for 90 days", desc: "Keep 100% of every booking for your first three months. Zero platform fees." },
  { icon: Crown, title: "Founding Stylist badge", desc: "First 100 stylists get a permanent badge and priority placement in search & discovery." },
  { icon: Clock, title: "60-second signup", desc: "Just your name, phone and city. Finish your profile whenever you're ready." },
  { icon: Users, title: "$25 per referral", desc: "Refer another stylist — get paid $25 as soon as they complete a booking." },
  { icon: TrendingUp, title: "Clients delivered to you", desc: "We market. You style. NEXTLOOK sends real, paying clients straight to your calendar." },
  { icon: Award, title: "Keep your brand", desc: "Your profile, your prices, your portfolio. We just handle the booking & payment." },
];

const steps = [
  "Sign up in under a minute",
  "We text you when your first client books",
  "Show up, style, get paid",
];

const JoinStylistPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Join NEXTLOOK — 0% Commission for 90 Days | Beauty Stylist Signup"
        description="Become a founding NEXTLOOK stylist. Keep 100% of your bookings for 90 days, earn $25 per referral, and get a permanent Founding Stylist badge."
        path="/join-stylist"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">Founding Stylist Program — Now Open</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Turn your chair into a <span className="text-gradient-rose">booked-out business</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto"
            >
              Join the first 100 stylists on NEXTLOOK. Keep 100% of your bookings for the next 90 days.
              No hidden fees. No contracts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button variant="hero" size="lg" asChild className="text-base">
                <Link to="/join-stylist/signup">
                  Claim my founding spot <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/provider/login">I already have an account</Link>
              </Button>
            </motion.div>

            <p className="mt-4 text-xs text-muted-foreground font-body">
              Takes about 60 seconds. No credit card. No commission for 90 days.
            </p>
          </div>
        </div>
      </section>

      {/* Perks grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Why stylists are switching</h2>
            <p className="mt-3 text-muted-foreground font-body">Everything you need to grow — nothing you don't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-border/60 bg-card shadow-card"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <perk.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{perk.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Start earning in 3 steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <div key={step} className="p-6 rounded-2xl bg-card border border-border/60 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground mx-auto mb-3 flex items-center justify-center font-display text-xl font-bold">
                    {i + 1}
                  </div>
                  <p className="font-body font-medium text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto p-8 md:p-10 rounded-3xl border border-primary/30 bg-primary/5">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">Our Founding Stylist promise</h3>
                <p className="mt-2 text-muted-foreground font-body">
                  If you don't get your first booking in the first 30 days, we'll boost your profile to the top of
                  discovery for free until you do. That's it. No fine print.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Only 100 founding spots.</h2>
          <p className="mt-3 text-muted-foreground font-body max-w-lg mx-auto">
            Once they're gone, so is the badge and the 90-day $0-commission window.
          </p>
          <Button variant="hero" size="lg" asChild className="mt-6">
            <Link to="/join-stylist/signup">
              Claim my spot <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JoinStylistPage;
