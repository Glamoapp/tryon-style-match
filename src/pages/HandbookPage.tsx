import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Download, BookOpen, Clock, Shirt, Shield, MessageSquare, Heart, Star, Sparkles, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HANDBOOK_PDF_URL = "https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/handbook/NEXTLOOK-Stylist-Handbook.pdf";

const sections = [
  {
    icon: BookOpen,
    title: "Welcome to NEXTLOOK",
    content: `Welcome to the NEXTLOOK family. You've been chosen because you represent excellence in the beauty industry. As a NEXTLOOK stylist, you are an ambassador of our brand — delivering luxury, precision, and care directly to our clients' doors.\n\nOur mission is simple: bring salon-quality beauty services to every woman, wherever she is. Your talent makes that possible.`,
  },
  {
    icon: Star,
    title: "Our Standards of Excellence",
    content: `At NEXTLOOK, we hold ourselves to the highest standard. Every interaction is an opportunity to create a memorable experience.\n\n• **Arrive 10 minutes early** to every appointment — punctuality is non-negotiable\n• **Confirm appointments** 24 hours in advance via the app\n• **Maintain a 4.5+ star rating** to remain on the platform\n• **Respond to messages** within 2 hours during business hours\n• **Complete all bookings** through the NEXTLOOK platform`,
  },
  {
    icon: Shirt,
    title: "Professional Dress Code",
    content: `Your appearance reflects our brand. NEXTLOOK stylists follow a strict **All-Black Dress Code**:\n\n• **Top:** Solid black blouse, button-down, or branded NEXTLOOK polo\n• **Bottom:** Black pants, skirt, or professional joggers (no jeans)\n• **Shoes:** Closed-toe black shoes (clean, no sneakers)\n• **Accessories:** Minimal jewelry, neat nails, fresh appearance\n• **Hair:** Styled and well-maintained — you are the walking advertisement\n\nNo logos from competing brands. Branded NEXTLOOK aprons are available upon request.`,
  },
  {
    icon: MessageSquare,
    title: "The LAST Communication Method",
    content: `Every client interaction should follow the **LAST** method:\n\n**L — Listen:** Give your full attention. Let the client express what they want without interruption.\n\n**A — Acknowledge:** Validate their feelings and preferences. "I completely understand what you're looking for."\n\n**S — Solve:** Offer solutions and professional recommendations. Use your expertise to guide them.\n\n**T — Thank:** Always end with gratitude. "Thank you for choosing NEXTLOOK. You look absolutely beautiful."\n\n### What to Say vs. What NOT to Say\n\n✅ "I'd love to help you achieve that look!"\n❌ "That style won't work for your hair type."\n\n✅ "Let me show you some options that would complement your features."\n❌ "I don't do that kind of style."`,
  },
  {
    icon: Clock,
    title: "Scheduling & Cancellation Policies",
    content: `Respecting time is respecting our clients.\n\n**Arrival:** Be at the client's location **10 minutes before** the scheduled time. Use this time to set up your station.\n\n**Late Policy:**\n• 5–10 minutes late: Warning issued\n• 10–20 minutes late: Client may cancel with full refund; stylist forfeits earnings\n• 20+ minutes late: Automatic cancellation + account review\n• 3 late arrivals in 30 days: Account suspension\n\n**Cancellation by Stylist:**\n• Cancel 24+ hours ahead: No penalty\n• Cancel within 24 hours: Strike on record\n• Cancel within 2 hours or no-show: $50 penalty + suspension review\n\n**Cancellation by Client:**\n• 24+ hours: Full refund\n• 12–24 hours: 50% refund\n• Under 12 hours: No refund (stylist receives 50% of service fee)`,
  },
  {
    icon: Shield,
    title: "Zero Tolerance: No Soliciting Policy",
    content: `**This is grounds for immediate termination.**\n\nNEXTLOOK invests heavily in connecting you with clients. Attempting to take clients off-platform violates your agreement and harms the community.\n\n**Prohibited Actions:**\n• Giving personal phone numbers for future bookings\n• Sharing social media for off-platform scheduling\n• Offering discounts to clients who book directly\n• Accepting cash payments outside the app\n• Leaving business cards at client locations\n\n**Consequences:**\n• First offense: Immediate account suspension + investigation\n• Confirmed violation: Permanent ban + forfeiture of pending earnings\n\nAll communication and payments must flow through NEXTLOOK.`,
  },
  {
    icon: Heart,
    title: "Hygiene & Safety Standards",
    content: `Client safety is paramount. Follow these non-negotiable hygiene practices:\n\n**Before Each Appointment:**\n• Sanitize all tools with hospital-grade disinfectant\n• Wash hands thoroughly and use hand sanitizer\n• Ensure all products are sealed and within expiration dates\n• Lay down a clean cape and fresh towel\n\n**During the Appointment:**\n• Use single-use items where possible (gloves, applicators)\n• Never share tools between clients without sanitizing\n• Keep your workspace organized and clean\n\n**After the Appointment:**\n• Clean and sanitize all tools immediately\n• Properly dispose of single-use items\n• Wipe down your station and pack up professionally\n• Leave the client's space cleaner than you found it`,
  },
  {
    icon: Users,
    title: "Client Interaction Guidelines",
    content: `**Consultation:** Spend the first 5–10 minutes understanding the client's vision. Show portfolio photos, discuss options, and set realistic expectations.\n\n**During Service:**\n• Keep conversation professional and positive\n• Avoid personal topics unless the client initiates\n• Never discuss other clients or share their information\n• Keep phone usage to a minimum (app only)\n• Ask for permission before taking photos for your portfolio\n\n**Tips & Gifting:**\n• Tips are yours to keep — NEXTLOOK does not take a cut\n• Never ask for tips or suggest a tip amount\n• Small gestures of care (aftercare tips, product samples) build loyalty\n\n**Social Media:**\n• Always get written consent before posting client photos\n• Tag @NEXTLOOK in all work-related posts\n• Never reveal client names or locations without consent`,
  },
  {
    icon: Sparkles,
    title: "Growth & Recognition",
    content: `NEXTLOOK rewards excellence. Here's how to advance:\n\n**Featured Stylist Status:**\n• Maintain a 4.8+ rating for 3 consecutive months\n• Complete 50+ bookings\n• Zero policy violations\n• Benefits: Priority placement, featured on homepage, higher visibility\n\n**Earnings & Payouts:**\n• You keep **80%** of every booking (NEXTLOOK retains 20%)\n• Payouts are processed weekly via Stripe Connect\n• Bonus opportunities during peak seasons and promotional events\n• Referral bonus: Earn $50 for every stylist you refer who completes 10 bookings\n\n**Continuing Education:**\n• Free access to NEXTLOOK masterclasses and workshops\n• Product partnership discounts\n• Networking events with fellow stylists`,
  },
  {
    icon: AlertTriangle,
    title: "Grounds for Suspension or Removal",
    content: `The following actions will result in immediate review and potential removal:\n\n• Soliciting clients off-platform\n• Consistently low ratings (below 4.0)\n• No-shows or frequent late cancellations\n• Unprofessional behavior or appearance\n• Harassment or discrimination of any kind\n• Using unsanitary practices\n• Misrepresenting qualifications or services\n• Violating client confidentiality\n• Consuming alcohol or substances before/during appointments\n\nNEXTLOOK reserves the right to suspend or permanently remove any stylist who fails to uphold these standards.`,
  },
];

const HandbookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Stylist Handbook | NEXTLOOK" description="Professional standards, dress code, and service guidelines for NEXTLOOK beauty professionals." path="/handbook" />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Stylist Handbook
          </h1>
          <p className="text-primary-foreground/70 max-w-lg mx-auto font-body text-lg mb-6">
            Your complete guide to delivering excellence as a NEXTLOOK stylist.
          </p>
          <a href={HANDBOOK_PDF_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <Download className="w-4 h-4" />
              Download PDF Version
            </Button>
          </a>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest font-body">
                      Section {index + 1}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-foreground mt-1">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="ml-14 prose prose-sm max-w-none text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                  {section.content.split("\n").map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={i} />;
                    // Bold markers
                    const parts = trimmed.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });
                    if (trimmed.startsWith("### ")) {
                      return <h3 key={i} className="font-display font-bold text-foreground text-lg mt-4 mb-2">{trimmed.slice(4)}</h3>;
                    }
                    if (trimmed.startsWith("•") || trimmed.startsWith("✅") || trimmed.startsWith("❌")) {
                      return <p key={i} className="pl-2 my-1">{parts}</p>;
                    }
                    return <p key={i} className="my-2">{parts}</p>;
                  })}
                </div>
                {index < sections.length - 1 && (
                  <div className="border-b border-border/50 mt-10" />
                )}
              </div>
            ))}
          </div>

          {/* Commitment Section */}
          <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <h3 className="font-display text-xl font-bold text-foreground mb-3">Your Commitment</h3>
            <p className="text-muted-foreground font-body max-w-lg mx-auto mb-6">
              By accepting bookings on NEXTLOOK, you agree to uphold every standard outlined in this handbook. Together, we're building something extraordinary.
            </p>
            <p className="text-primary font-display font-semibold italic">
              "Excellence is not a skill. It is an attitude." — Ralph Marston
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HandbookPage;
