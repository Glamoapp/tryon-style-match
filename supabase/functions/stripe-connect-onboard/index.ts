import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const { provider_id, email, return_url } = await req.json();

    if (!provider_id || !email) throw new Error("Missing provider_id or email");

    // Check if account already exists (by metadata)
    const existingAccounts = await stripe.accounts.list({ limit: 100 });
    let account = existingAccounts.data.find((a) => a.metadata?.provider_id === provider_id);

    if (!account) {
      account = await stripe.accounts.create({
        type: "express",
        email,
        metadata: { provider_id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: return_url || "http://localhost:3000/provider/dashboard",
      return_url: return_url || "http://localhost:3000/provider/dashboard",
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
