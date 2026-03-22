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

    const { bookingId } = await req.json();

    if (!bookingId) throw new Error("Booking ID is required");

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, payment_intent_id, status, total_price, provider_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");

    if (booking.status !== "payment_captured") {
      return new Response(
        JSON.stringify({ error: "Payment must be captured before completing payout" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!booking.payment_intent_id) {
      throw new Error("No payment found for this booking");
    }

    // Look up provider's Stripe Connect account
    let connectedAccountId: string | null = null;
    if (booking.provider_id) {
      try {
        const accounts = await stripe.accounts.list({ limit: 100 });
        const providerAccount = accounts.data.find(
          (a: any) => a.metadata?.provider_id === booking.provider_id
        );
        if (providerAccount && providerAccount.charges_enabled) {
          connectedAccountId = providerAccount.id;
        }
      } catch (e) {
        console.log("Could not look up provider Stripe account:", e);
      }
    }

    // Calculate 80/20 split — 80% goes to stylist
    const totalAmountCents = Math.round(Number(booking.total_price) * 100);
    const stylistPayout = Math.round(totalAmountCents * 0.80);

    if (connectedAccountId) {
      // Transfer 80% to the stylist's connected account
      await stripe.transfers.create({
        amount: stylistPayout,
        currency: "usd",
        destination: connectedAccountId,
        source_transaction: booking.payment_intent_id,
        metadata: {
          booking_id: bookingId,
          provider_id: booking.provider_id,
        },
      });
      console.log("Transferred", stylistPayout, "cents to", connectedAccountId);
    } else {
      console.log("No connected account found for provider — payout skipped, funds retained on platform");
    }

    // Mark booking as completed
    await supabase
      .from("bookings")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    // Notify the customer
    const { data: customerBooking } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("id", bookingId)
      .single();

    if (customerBooking) {
      await supabase.from("notifications").insert({
        user_id: customerBooking.customer_id,
        title: "Service Completed ✨",
        message: "Your styling service has been completed! Thank you for choosing NextLook Beauty.",
        type: "booking_completed",
        related_booking_id: bookingId,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout: connectedAccountId ? stylistPayout / 100 : 0,
        payoutTo: connectedAccountId || "none",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error completing payout:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
