import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { bookingId, completionCode } = await req.json();

    if (!bookingId || !completionCode) {
      throw new Error("Booking ID and completion code are required");
    }

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, completion_code, payment_intent_id, status, total_price, provider_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Verify completion code
    if (booking.completion_code !== completionCode) {
      return new Response(JSON.stringify({ error: "Invalid completion code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!booking.payment_intent_id) {
      throw new Error("No payment authorization found for this booking");
    }

    if (booking.status === "completed") {
      return new Response(JSON.stringify({ error: "Booking is already completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Capture the authorized payment — this pulls money from the customer
    const paymentIntent = await stripe.paymentIntents.capture(booking.payment_intent_id);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment capture failed with status: ${paymentIntent.status}`);
    }

    // Update booking status to "payment_captured"
    await supabase
      .from("bookings")
      .update({ status: "payment_captured", updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    console.log("Payment captured for booking:", bookingId);

    return new Response(JSON.stringify({ success: true, status: "payment_captured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
