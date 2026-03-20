import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";

const TermsPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "privacy" ? "privacy" : "terms";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-8 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-3">
            Legal
          </h1>
          <p className="text-primary-foreground/70 font-body text-lg">
            Terms of Service & Privacy Policy
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="prose prose-sm max-w-none text-muted-foreground font-body space-y-6">
              <p className="text-xs text-muted-foreground">Last updated: March 20, 2026</p>

              <h2 className="font-display text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing or using the NEXTLOOK platform ("Service"), including our website and mobile applications, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>

              <h2 className="font-display text-xl font-bold text-foreground">2. Description of Service</h2>
              <p>NEXTLOOK is a marketplace platform that connects customers with independent beauty service providers ("Stylists"). We facilitate bookings, payments, and communication between customers and stylists. NEXTLOOK is not a beauty salon and does not directly provide beauty services.</p>

              <h2 className="font-display text-xl font-bold text-foreground">3. User Accounts</h2>
              <p>You must create an account to use certain features. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You agree to provide accurate, current, and complete information and to update it as necessary.</p>

              <h2 className="font-display text-xl font-bold text-foreground">4. Booking & Payments</h2>
              <p>All bookings and payments must be processed through the NEXTLOOK platform. Prices are set by individual stylists and displayed before booking confirmation. Payment is collected at the time of booking. Stylists receive their earnings minus the NEXTLOOK service fee (20%) via Stripe Connect.</p>
              <p><strong className="text-foreground">Off-platform transactions are strictly prohibited.</strong> Any attempt to solicit or complete bookings outside the platform may result in immediate account termination for both parties.</p>

              <h2 className="font-display text-xl font-bold text-foreground">5. Cancellation & Refunds</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cancellations made <strong className="text-foreground">24+ hours</strong> before the appointment: Full refund</li>
                <li>Cancellations made <strong className="text-foreground">12–24 hours</strong> before: 50% refund</li>
                <li>Cancellations made <strong className="text-foreground">under 12 hours</strong> or no-shows: No refund</li>
                <li>Stylist cancellations: Automatic full refund to customer</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">6. Stylist Obligations</h2>
              <p>Stylists are independent contractors, not employees of NEXTLOOK. Stylists agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Maintain all required licenses and certifications</li>
                <li>Adhere to the NEXTLOOK Stylist Handbook standards</li>
                <li>Arrive on time and provide professional services</li>
                <li>Maintain hygiene and safety standards</li>
                <li>Not solicit clients off-platform</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">7. Customer Obligations</h2>
              <p>Customers agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate booking information and a safe, clean workspace</li>
                <li>Be available at the scheduled time</li>
                <li>Treat stylists with respect and professionalism</li>
                <li>Report any issues through the platform</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">8. Intellectual Property</h2>
              <p>All content on the NEXTLOOK platform — including logos, text, graphics, and software — is owned by NEXTLOOK or its licensors. You may not copy, modify, distribute, or create derivative works without prior written consent.</p>

              <h2 className="font-display text-xl font-bold text-foreground">9. Limitation of Liability</h2>
              <p>NEXTLOOK acts as a marketplace facilitator. We are not liable for the quality, safety, or legality of services provided by stylists. To the maximum extent permitted by law, NEXTLOOK shall not be liable for any indirect, incidental, special, or consequential damages.</p>

              <h2 className="font-display text-xl font-bold text-foreground">10. Dispute Resolution</h2>
              <p>Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive any right to participate in class action lawsuits.</p>

              <h2 className="font-display text-xl font-bold text-foreground">11. Termination</h2>
              <p>NEXTLOOK may suspend or terminate your account at any time for violation of these Terms, including but not limited to off-platform solicitation, harassment, fraud, or consistently low service ratings.</p>

              <h2 className="font-display text-xl font-bold text-foreground">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance.</p>

              <h2 className="font-display text-xl font-bold text-foreground">13. Contact</h2>
              <p>For questions about these Terms, contact us at <a href="mailto:support@nextlookbeauty.com" className="text-primary hover:underline">support@nextlookbeauty.com</a>.</p>
            </TabsContent>

            <TabsContent value="privacy" className="prose prose-sm max-w-none text-muted-foreground font-body space-y-6">
              <p className="text-xs text-muted-foreground">Last updated: March 20, 2026</p>

              <h2 className="font-display text-xl font-bold text-foreground">1. Information We Collect</h2>
              <p>We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Account Information:</strong> Name, email, phone number, city, profile photo</li>
                <li><strong className="text-foreground">Booking Data:</strong> Service requests, dates, times, addresses, payment details</li>
                <li><strong className="text-foreground">Communications:</strong> Messages sent through the platform</li>
                <li><strong className="text-foreground">Location Data:</strong> With your consent, for stylist matching and tracking</li>
                <li><strong className="text-foreground">Device Data:</strong> Browser type, IP address, device identifiers</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To facilitate bookings between customers and stylists</li>
                <li>To process payments securely via Stripe</li>
                <li>To send booking confirmations, reminders, and updates</li>
                <li>To improve our services and personalize your experience</li>
                <li>To enforce our Terms of Service and ensure safety</li>
                <li>To send promotional communications (with your consent)</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">3. Information Sharing</h2>
              <p>We do not sell your personal information. We share data only with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Stylists/Customers:</strong> Relevant booking details to facilitate services</li>
                <li><strong className="text-foreground">Payment Processors:</strong> Stripe, for secure payment processing</li>
                <li><strong className="text-foreground">Service Providers:</strong> Analytics, hosting, and communication tools</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect rights</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">4. Data Security</h2>
              <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>

              <h2 className="font-display text-xl font-bold text-foreground">5. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request data portability</li>
              </ul>

              <h2 className="font-display text-xl font-bold text-foreground">6. Cookies & Tracking</h2>
              <p>We use essential cookies for platform functionality and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.</p>

              <h2 className="font-display text-xl font-bold text-foreground">7. Data Retention</h2>
              <p>We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance for up to 3 years.</p>

              <h2 className="font-display text-xl font-bold text-foreground">8. Children's Privacy</h2>
              <p>NEXTLOOK is not intended for users under 18. We do not knowingly collect information from minors. If you believe a minor has provided us personal information, please contact us immediately.</p>

              <h2 className="font-display text-xl font-bold text-foreground">9. Changes to This Policy</h2>
              <p>We may update this policy periodically. We'll notify you of material changes via email or an in-app notification.</p>

              <h2 className="font-display text-xl font-bold text-foreground">10. Contact</h2>
              <p>For privacy inquiries, contact us at <a href="mailto:privacy@nextlookbeauty.com" className="text-primary hover:underline">privacy@nextlookbeauty.com</a>.</p>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
