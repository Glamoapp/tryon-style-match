import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.json();
    const { name, email, phone, address } = body || {};

    if (!email || !name || !phone || !address?.line1 || !address?.city || !address?.state || !address?.postal_code) {
      return new Response(
        JSON.stringify({ error: "Missing required customer or shipping information." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://nextlookbeauty.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 200000, // $2,000.00
            product_data: {
              name: "NextLook Smart Mirror — 43\" Pre-order",
              description: "AI-powered 43\" smart beauty mirror. Ships in ~20 days.",
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      metadata: {
        product: "nextlook_smart_mirror",
        customer_name: name,
        customer_phone: phone,
        ship_line1: address.line1,
        ship_line2: address.line2 || "",
        ship_city: address.city,
        ship_state: address.state,
        ship_postal_code: address.postal_code,
        ship_country: address.country || "US",
      },
      success_url: `${origin}/mirror/preorder?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/mirror/preorder?status=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Mirror preorder error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
