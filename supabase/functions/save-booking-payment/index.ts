import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Called from the success page to save the PaymentIntent ID back to the booking
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { sessionId } = await req.json();

    if (!sessionId) throw new Error("Session ID is required");

    // Retrieve the checkout session to get the payment intent
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.payment_intent) {
      throw new Error("No payment intent found in session");
    }

    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;

    // Get booking ID from session metadata
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Save payment_intent_id directly to the booking
      const { error } = await supabase
        .from("bookings")
        .update({ payment_intent_id: paymentIntentId })
        .eq("id", bookingId);

      if (error) {
        console.error("Failed to update booking with payment intent:", error);
        throw new Error("Failed to save payment info");
      }

      console.log("Saved payment_intent_id", paymentIntentId, "to booking", bookingId);
    } else {
      // For unified checkout with services, try to find recent pending bookings for this customer
      const customerEmail = session.customer_details?.email || session.metadata?.customerEmail;
      if (customerEmail) {
        // Look up user by email
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .limit(1);

        if (profiles && profiles.length > 0) {
          // Update the most recent pending booking for this user
          const { data: recentBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("customer_id", profiles[0].id)
            .is("payment_intent_id", null)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1);

          if (recentBookings && recentBookings.length > 0) {
            await supabase
              .from("bookings")
              .update({ payment_intent_id: paymentIntentId })
              .eq("id", recentBookings[0].id);

            console.log("Saved payment_intent_id to recent booking", recentBookings[0].id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, paymentIntentId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error saving booking payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
