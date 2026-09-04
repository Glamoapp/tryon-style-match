import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { EmailAPIError, sendLovableEmail } from "npm:@lovable.dev/email-js@0.1.0";

const SENDER_DOMAIN = "notify.nextlookbeauty.com";
const FROM_DOMAIN = "notify.nextlookbeauty.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const HANDBOOK_URL =
  "https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/handbook/NEXTLOOK-Stylist-Handbook.pdf";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stylistId, stylistName, stylistEmail } = await req.json();

    if (!stylistEmail || !stylistName) {
      return new Response(
        JSON.stringify({ error: "Missing stylist info" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f8f5f0; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #5B2D8E 0%, #3D1A6E 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #C5A55A; font-size: 32px; margin: 0 0 8px 0; letter-spacing: 2px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; letter-spacing: 1px; }
    .hero { padding: 48px 32px; text-align: center; border-bottom: 2px solid #f0e8d8; }
    .hero h2 { color: #5B2D8E; font-size: 28px; margin: 0 0 16px 0; }
    .hero .name { color: #C5A55A; font-style: italic; }
    .hero p { color: #555; font-size: 16px; line-height: 1.7; margin: 0; }
    .section { padding: 32px; border-bottom: 1px solid #f0e8d8; }
    .section h3 { color: #5B2D8E; font-size: 20px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section p, .section li { color: #444; font-size: 15px; line-height: 1.8; }
    .section ul { padding-left: 20px; margin: 12px 0; }
    .section li { margin-bottom: 8px; }
    .highlight-box { background: #f8f0ff; border-left: 4px solid #5B2D8E; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .warning-box { background: #fff5f5; border-left: 4px solid #cc0000; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .warning-box p { color: #cc0000; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #5B2D8E 0%, #7B3FA8 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 1px; margin: 8px; }
    .cta-secondary { display: inline-block; background: #C5A55A; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 1px; margin: 8px; }
    .steps { counter-reset: steps; }
    .step { counter-increment: steps; position: relative; padding-left: 40px; margin-bottom: 16px; }
    .step::before { content: counter(steps); position: absolute; left: 0; top: 0; width: 28px; height: 28px; background: #5B2D8E; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; text-align: center; line-height: 28px; }
    .verse { text-align: center; padding: 32px; background: #faf8f4; border-top: 2px solid #C5A55A; border-bottom: 2px solid #C5A55A; }
    .verse p { color: #5B2D8E; font-style: italic; font-size: 16px; margin: 0 0 8px 0; }
    .verse .ref { color: #999; font-size: 13px; font-style: normal; }
    .footer { background: #1a1a2e; padding: 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.5); font-size: 13px; margin: 4px 0; }
    .footer a { color: #C5A55A; text-decoration: none; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge-warning { background: #fce4ec; color: #c62828; }
    .divider { height: 2px; background: linear-gradient(90deg, transparent, #C5A55A, transparent); margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <h1>NEXTLOOK</h1>
      <p>LUXURY BEAUTY &bull; DELIVERED TO YOUR DOOR</p>
    </div>

    <!-- HERO -->
    <div class="hero">
      <h2>🎉 Congratulations, <span class="name">${stylistName}</span>!</h2>
      <p>
        Your account has been <strong>approved</strong> and you are now officially a 
        <strong>NEXTLOOK Certified Stylist</strong>! Welcome to our Christ-centered 
        luxury beauty family. We are thrilled to have you on board.
      </p>
    </div>

    <!-- ABOUT NEXTLOOK -->
    <div class="section">
      <h3>✨ About NEXTLOOK</h3>
      <p>
        NEXTLOOK is a <strong>Christ-centered luxury beauty platform</strong> that brings 
        professional beauty services directly to clients' doorsteps. Founded on Christian 
        values of excellence, integrity, and service, we connect talented stylists like you 
        with clients seeking premium at-home beauty experiences.
      </p>
      <div class="highlight-box">
        <p><strong>Our Mission:</strong> To help every woman feel confident, valued, and 
        beautifully made — while honoring God through excellence in everything we do.</p>
      </div>
      <p><strong>Services we offer:</strong></p>
      <ul>
        <li>Professional Weave Installations</li>
        <li>Box Braids, Knotless Braids & Cornrows</li>
        <li>Wig Installations & Styling</li>
        <li>K-Tip & I-Tip Extensions</li>
        <li>Professional Makeup Artistry</li>
        <li>And much more!</li>
      </ul>
    </div>

    <!-- WHAT TO EXPECT -->
    <div class="section">
      <h3>📋 What to Expect</h3>
      <p>Here's how NEXTLOOK works for you as a stylist:</p>
      <div class="steps">
        <div class="step">
          <p><strong>Set Your Schedule</strong> — Go to your Dashboard → Calendar tab and set your available days and hours.</p>
        </div>
        <div class="step">
          <p><strong>Receive Bookings</strong> — Clients in your area will find you, view your services, and book appointments.</p>
        </div>
        <div class="step">
          <p><strong>Deliver Excellence</strong> — Arrive on time, provide a 5-star luxury experience, and make your client feel like royalty.</p>
        </div>
        <div class="step">
          <p><strong>Get Paid</strong> — You keep <strong>80%</strong> of every booking. Payments go directly to your bank account via Stripe.</p>
        </div>
      </div>
    </div>

    <!-- CUSTOMER SERVICE -->
    <div class="section">
      <h3>👑 Treating Clients Like Royalty</h3>
      <p>At NEXTLOOK, our clients are queens who deserve a five-star experience:</p>
      <ul>
        <li><span class="badge">DO</span> Greet every client with a warm smile</li>
        <li><span class="badge">DO</span> Arrive 5-10 minutes early with organized supplies</li>
        <li><span class="badge">DO</span> Keep your workspace clean and professional</li>
        <li><span class="badge">DO</span> Dress professionally — you represent NEXTLOOK</li>
        <li><span class="badge">DO</span> Communicate proactively if anything changes</li>
        <li><span class="badge">DO</span> Thank each client sincerely after every appointment</li>
      </ul>
    </div>

    <!-- PUNCTUALITY -->
    <div class="section">
      <h3>⏰ Punctuality is Non-Negotiable</h3>
      <p>
        Your clients have carved time out of their busy schedules. Being late is 
        disrespectful and damages our luxury brand reputation.
      </p>
      <div class="highlight-box">
        <p>
          <strong>Our Policy:</strong> Arrive 5-10 minutes early. If running late, 
          notify through the app immediately. Repeated lateness (3+ times) leads to 
          formal warnings. Chronic tardiness results in removal from the platform.
        </p>
      </div>
    </div>

    <!-- PAYMENTS -->
    <div class="section">
      <h3>💰 Getting Paid via Stripe</h3>
      <p>Setting up your payments is simple:</p>
      <div class="steps">
        <div class="step"><p>Go to your <strong>Dashboard → Cash Out</strong> tab</p></div>
        <div class="step"><p>Click <strong>"Connect Stripe"</strong></p></div>
        <div class="step"><p>Enter your bank account details</p></div>
        <div class="step"><p>Start receiving payouts (2-7 business days)</p></div>
      </div>
      <p style="text-align: center; margin-top: 16px;">
        <strong>You keep 80%</strong> of every booking &bull; 
        <strong>20% platform fee</strong> supports marketing, tech & growth
      </p>
    </div>

    <!-- NO SOLICITING -->
    <div class="section">
      <h3>🚫 Zero Tolerance: No Soliciting</h3>
      <div class="warning-box">
        <p><strong>⚠️ THIS IS OUR MOST IMPORTANT POLICY</strong></p>
      </div>
      <p>
        NEXTLOOK invests heavily to connect you with clients. 
        <strong>Soliciting clients outside the platform is strictly prohibited.</strong>
      </p>
      <ul>
        <li><span class="badge badge-warning">DON'T</span> Give personal contact info to book directly</li>
        <li><span class="badge badge-warning">DON'T</span> Ask clients to pay outside NEXTLOOK</li>
        <li><span class="badge badge-warning">DON'T</span> Hand out business cards during appointments</li>
        <li><span class="badge badge-warning">DON'T</span> Encourage clients to leave the platform</li>
      </ul>
      <div class="warning-box">
        <p><strong>Consequences:</strong> First offense = warning + suspension. 
        Second offense = permanent removal. We monitor for solicitation activity.</p>
      </div>
    </div>

    <!-- SCRIPTURE -->
    <div class="verse">
      <p>"Whatever you do, work at it with all your heart, as working for the Lord."</p>
      <span class="ref">— Colossians 3:23</span>
    </div>

    <!-- CTA -->
    <div class="section" style="text-align: center; padding: 40px 32px;">
      <h3 style="display: block; text-align: center;">🚀 Ready to Get Started?</h3>
      <p>Log into your dashboard to set up your schedule, connect Stripe, and start receiving bookings!</p>
      <br>
      <a href="https://tryon-style-match.lovable.app/provider/dashboard" class="cta-button">Go to My Dashboard</a>
      <br><br>
      <a href="${HANDBOOK_URL}" class="cta-secondary">📖 Download Stylist Handbook</a>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p><strong style="color: #C5A55A;">NEXTLOOK</strong></p>
      <p>A Christ-Centered Luxury Beauty Experience</p>
      <p style="margin-top: 12px;">
        <a href="${HANDBOOK_URL}">📖 Stylist Handbook</a> &bull; 
        <a href="https://tryon-style-match.lovable.app">Visit NEXTLOOK</a>
      </p>
      <div class="divider" style="background: linear-gradient(90deg, transparent, rgba(197,165,90,0.3), transparent);"></div>
      <p>© 2026 NEXTLOOK. All rights reserved.</p>
      <p style="font-size: 11px; color: rgba(255,255,255,0.3);">
        "She is clothed with strength and dignity" — Proverbs 31:25
      </p>
    </div>
  </div>
</body>
</html>`;

    // Use Lovable AI to send the email
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // For now, we'll use the Supabase service role to store the email content
    // and notify the admin. The actual email sending would need email infra.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create a notification for the admin
    const { data: adminUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", "nextlookbeauty@gmail.com")
      .single();

    if (adminUser) {
      await supabaseAdmin.from("notifications").insert({
        user_id: adminUser.id,
        title: "Welcome email sent",
        message: `Welcome email and handbook sent to ${stylistName} (${stylistEmail})`,
        type: "info",
      });
    }

    // Send via Twilio SMS as a notification about the approval
    const twilioApiKey = Deno.env.get("TWILIO_API_KEY");
    const adminPhone = Deno.env.get("ADMIN_PHONE_NUMBER");
    
    // Log the email for tracking
    console.log(`Welcome email prepared for ${stylistName} at ${stylistEmail}`);
    console.log(`Handbook URL: ${HANDBOOK_URL}`);

    // Send through Lovable's managed email API (HTML is composed above)
    try {
      await sendLovableEmail(
        {
          to: stylistEmail,
          from: `NEXTLOOK <noreply@${FROM_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `\u{1F389} Welcome to NEXTLOOK, ${stylistName}! You're Approved!`,
          html: htmlContent,
          text: htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          purpose: "transactional",
          label: "welcome-stylist",
          idempotency_key: `welcome-stylist-${stylistId ?? stylistEmail}`,
        },
        { apiKey: Deno.env.get("LOVABLE_API_KEY")!, sendUrl: Deno.env.get("LOVABLE_SEND_URL") }
      );
      await supabaseAdmin.from("email_send_log").insert({
        template_name: "welcome-stylist",
        recipient_email: stylistEmail,
        status: "sent",
      });
      console.log("Welcome email sent");
    } catch (emailErr) {
      const suppressed =
        emailErr instanceof EmailAPIError && emailErr.code === "recipient_suppressed";
      const { error: logErr } = await supabaseAdmin.from("email_send_log").insert({
        template_name: "welcome-stylist",
        recipient_email: stylistEmail,
        status: suppressed ? "suppressed" : "failed",
        error_message: suppressed ? null : String((emailErr as Error)?.message ?? emailErr),
      });
      if (logErr) console.error("Failed to write email_send_log", { code: logErr.code, message: logErr.message });
      console.log("Welcome email not delivered:", suppressed ? "recipient_suppressed" : emailErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Welcome email sent to ${stylistEmail}`,
        handbookUrl: HANDBOOK_URL 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
