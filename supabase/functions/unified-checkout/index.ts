import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

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
      apiVersion: "2023-10-16",
    });

    const { products, services, customerEmail, customerName } = await req.json();

    if (!customerEmail) throw new Error("Email is required");

    const lineItems: any[] = [];
    const hasProducts = products && products.length > 0;
    const hasServices = services && services.length > 0;

    // Add product line items
    if (hasProducts) {
      for (const product of products) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
            },
            unit_amount: Math.round(parseFloat(product.price) * 100),
          },
          quantity: product.quantity,
        });
      }
    }

    // Add service line items
    if (hasServices) {
      for (const service of services) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${service.serviceName} — Service Booking`,
              description: `${service.providerName} • ${service.date} at ${service.time}`,
            },
            unit_amount: Math.round(service.price * 100),
          },
          quantity: 1,
        });
      }
    }

    if (lineItems.length === 0) throw new Error("No items in cart");

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        name: customerName || undefined,
        email: customerEmail,
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://tryon-style-match.lovable.app";

    const sessionParams: any = {
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/booking-tracker?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/extensions`,
      metadata: {
        hasProducts: hasProducts ? "true" : "false",
        hasServices: hasServices ? "true" : "false",
        serviceCount: services ? String(services.length) : "0",
        productCount: products ? String(products.length) : "0",
      },
    };

    // If cart includes services, use manual capture to hold funds
    // Funds are only captured when the completion code is verified
    if (hasServices) {
      sessionParams.payment_intent_data = {
        capture_method: "manual",
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating unified checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
