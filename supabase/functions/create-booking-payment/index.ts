import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { bookingId, customerName, email, phone, address, styleName, stylistName, date, time, price } = await req.json();

    if (!email) throw new Error("Email is required");

    // price is in cents, default to 5000 ($50) if not provided
    const amountInCents = price || 5000;

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        name: customerName,
        email,
        phone,
        address: { line1: address },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://tryon-style-match.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: styleName || "Hair Service",
              description: `${stylistName || "Stylist"} — ${date} at ${time}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card", "cashapp"],
      success_url: `${origin}/booking-tracker?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#stylists`,
      metadata: {
        bookingId,
        styleName,
        stylistName,
        date,
        time,
        customerName,
        phone,
        address,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
