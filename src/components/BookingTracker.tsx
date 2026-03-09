import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle, CheckCircle2, Circle } from "lucide-react";
import stylist1 from "@/assets/stylist-1.jpg";

const trackingSteps = [
  { label: "Booking Confirmed", time: "2:00 PM", done: true },
  { label: "Stylist En Route", time: "2:15 PM", done: true },
  { label: "Arriving Soon", time: "2:35 PM", done: false },
  { label: "Service in Progress", time: "", done: false },
  { label: "Completed", time: "", done: false },
];

const BookingTracker = () => {
  const [showTracker, setShowTracker] = useState(false);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Real-Time</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            Track Your <span className="text-gradient-rose">Stylist</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-body">
            Once booked, track your stylist in real-time as they make their way to you.
          </p>
          {!showTracker && (
            <Button variant="hero" className="mt-6" onClick={() => setShowTracker(true)}>
              See Demo Tracker
            </Button>
          )}
        </motion.div>

        <AnimatePresence>
          {showTracker && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-card rounded-3xl shadow-elevated border border-border/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-hero p-6">
                  <div className="flex items-center gap-4">
                    <img src={stylist1} alt="Stylist" className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/50" />
                    <div>
                      <h3 className="font-display font-bold text-cream text-lg">Keisha Williams</h3>
                      <p className="text-cream/60 text-sm font-body">Braids Specialist</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-cream" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-cream" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-cream/70 font-body">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> 1.2 mi away
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> ETA: 20 min
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="h-48 bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary animate-pulse-glow flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground font-body">Live map tracking</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6">
                  <h4 className="font-display font-semibold text-foreground mb-4">Booking Progress</h4>
                  <div className="space-y-4">
                    {trackingSteps.map((step, index) => (
                      <div key={step.label} className="flex items-center gap-3">
                        {step.done ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className={`text-sm font-body ${step.done ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                        {step.time && (
                          <span className="text-xs text-muted-foreground font-body">{step.time}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BookingTracker;
