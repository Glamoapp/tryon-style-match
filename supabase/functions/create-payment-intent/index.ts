import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

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

    const { products, services, customerEmail, customerName, paymentMethod, bookingIds, shippingAddress, customerPhone } = await req.json();

    if (!customerEmail) throw new Error("Email is required");

    const hasProducts = products && products.length > 0;
    const hasServices = services && services.length > 0;

    if (!hasProducts && !hasServices) throw new Error("No items in cart");

    // Calculate total amount in cents
    let totalAmount = 0;

    if (hasProducts) {
      for (const product of products) {
        totalAmount += Math.round(parseFloat(product.price) * 100) * (product.quantity || 1);
      }
    }

    if (hasServices) {
      for (const service of services) {
        totalAmount += Math.round(service.price * 100);
      }
    }

    if (totalAmount < 50) throw new Error("Amount must be at least $0.50");

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        name: customerName || undefined,
        email: customerEmail,
      });
      customerId = customer.id;
    }

    // Use automatic_payment_methods so Stripe shows ALL methods enabled in
    // the Stripe Dashboard (Card, Apple Pay, Google Pay, Cash App, Affirm, Klarna, etc.)
    // This is the recommended approach — it auto-adapts to amount/currency/country eligibility.

    // Build description for the payment
    const descriptions: string[] = [];
    if (hasProducts) {
      descriptions.push(`${products.length} product(s)`);
    }
    if (hasServices) {
      for (const service of services) {
        descriptions.push(`${service.serviceName} with ${service.providerName}`);
      }
    }

    const intentParams: any = {
      amount: totalAmount,
      currency: "usd",
      customer: customerId,
      // automatic_payment_methods lets Stripe show every method enabled in the
      // Dashboard (Card, Apple Pay, Google Pay, Cash App, Affirm, Klarna, etc.)
      // It auto-filters by amount, currency, and customer country.
      automatic_payment_methods: { enabled: true },
      description: descriptions.join(", "),
      metadata: {
        hasProducts: hasProducts ? "true" : "false",
        hasServices: hasServices ? "true" : "false",
        serviceCount: services ? String(services.length) : "0",
        productCount: products ? String(products.length) : "0",
        customerEmail,
        // Store booking IDs so we can link payment back to bookings
        bookingIds: bookingIds ? JSON.stringify(bookingIds) : "",
      },
    };

    // Charge upfront — no manual capture
    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
