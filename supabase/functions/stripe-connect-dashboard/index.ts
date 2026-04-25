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
    const { provider_id } = await req.json();

    if (!provider_id) {
      return json({ error: "Missing provider_id" }, 400);
    }

    const userId = await authenticateRequest(req);
    if (userId !== provider_id) {
      return json({ error: "Forbidden" }, 403);
    }

    const stripe = createStripeClient();
    const accounts = await stripe.accounts.list({ limit: 100 });
    const account = accounts.data.find((a: any) => a.metadata?.provider_id === provider_id);

    if (!account) {
      return json({ error: "No Stripe account found" }, 404);
    }

    const loginLink = await stripe.accounts.createLoginLink(account.id);
    return json({ url: loginLink.url });
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
