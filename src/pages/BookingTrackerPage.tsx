import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle, CheckCircle2, Circle, ArrowLeft, User, Mail, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import stylist1 from "@/assets/stylist-1.jpg";

interface BookingData {
  id: string;
  date: string;
  time: string;
  stylistName: string;
  styleName: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

const paymentLabels: Record<string, string> = {
  cashapp: "Cash App",
  applepay: "Apple Pay",
  card: "Debit / Credit Card",
};

const BookingTrackerPage = () => {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("currentBooking");
    if (data) {
      setBooking(JSON.parse(data));
    }
  }, []);

  // Simulate progress
  useEffect(() => {
    if (!booking) return;
    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [booking]);

  const trackingSteps = [
    { label: "Booking Confirmed", icon: CheckCircle2 },
    { label: "Stylist En Route", icon: MapPin },
    { label: "Arriving Soon", icon: Clock },
    { label: "Service in Progress", icon: Circle },
    { label: "Completed", icon: CheckCircle2 },
  ];

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-6 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">No Active Booking</h1>
          <p className="text-muted-foreground font-body mb-6">You don't have an active booking to track.</p>
          <Link to="/">
            <Button variant="hero">Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Booking <span className="text-gradient-rose">Confirmed!</span>
            </h1>
            <p className="text-muted-foreground font-body mb-8">
              Booking ID: <span className="font-semibold text-foreground">{booking.id}</span>
            </p>
          </motion.div>

          {/* Stylist Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-3xl shadow-elevated border border-border/50 overflow-hidden mb-6"
          >
            <div className="bg-gradient-hero p-6">
              <div className="flex items-center gap-4">
                <img src={stylist1} alt="Stylist" className="w-14 h-14 rounded-full object-cover ring-2 ring-gold/50" />
                <div>
                  <h3 className="font-display font-bold text-cream text-lg">{booking.stylistName}</h3>
                  <p className="text-cream/60 text-sm font-body">{booking.styleName}</p>
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
            </div>

            {/* Live Map placeholder */}
            <div className="h-48 bg-muted relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary animate-pulse flex items-center justify-center mx-auto mb-2">
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
                    {index <= currentStep ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-body flex-1 ${index <= currentStep ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-6 space-y-3"
          >
            <h4 className="font-display font-semibold text-foreground mb-2">Booking Details</h4>
            <div className="grid gap-3 text-sm font-body">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.date} at {booking.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold text-foreground ml-auto">{booking.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Address:</span>
                <span className="font-semibold text-foreground ml-auto text-right max-w-[200px]">{booking.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-semibold text-foreground ml-auto">{paymentLabels[booking.paymentMethod] || booking.paymentMethod}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingTrackerPage;
