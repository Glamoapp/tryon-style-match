import { motion } from "framer-motion";
import { Camera, Users, Calendar, Navigation } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Try On Styles",
    description: "Upload your photo and use our AI to see how braids, weaves, cuts & makeup look on you.",
  },
  {
    icon: Users,
    title: "Get Matched",
    description: "We'll match you with top-rated stylists in your area who specialize in your chosen style.",
  },
  {
    icon: Calendar,
    title: "Book & Pay",
    description: "Choose your time, confirm the price, and book securely. No surprises.",
  },
  {
    icon: Navigation,
    title: "Track & Enjoy",
    description: "Track your stylist in real-time as they come to you. Sit back and get glammed up!",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Simple Process</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-rose flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground font-body">{index + 1}</span>
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
