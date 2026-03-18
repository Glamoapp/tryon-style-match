import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  authenticateRequest,
  corsHeaders,
  createStripeClient,
  getConnectPlatformError,
  json,
} from "../_shared/stripe-connect.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider_id, email, return_url } = await req.json();

    if (!provider_id || !email) {
      return json({ error: "Missing provider_id or email" }, 400);
    }

    const userId = await authenticateRequest(req);
    if (userId !== provider_id) {
      return json({ error: "Forbidden" }, 403);
    }

    const stripe = createStripeClient();
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

    const fallbackUrl = return_url || req.headers.get("origin") || "http://localhost:3000/provider/dashboard";
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: fallbackUrl,
      return_url: fallbackUrl,
      type: "account_onboarding",
    });

    return json({ url: accountLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const platformError = getConnectPlatformError(message);

    if (platformError) {
      return json({
        ...platformError,
        blocked: true,
      });
    }

    const status = message === "Unauthorized" ? 401 : 500;
    return json({ error: message }, status);
  }
});
