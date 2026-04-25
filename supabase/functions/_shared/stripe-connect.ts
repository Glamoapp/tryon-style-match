import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const createStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

  return new Stripe(stripeKey, { apiVersion: "2023-10-16" });
};

export const authenticateRequest = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user?.id) {
    throw new Error("Unauthorized");
  }

  return data.user.id as string;
};

export const getConnectPlatformError = (message: string) => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("complete your platform profile") ||
    normalized.includes("connected accounts") ||
    normalized.includes("managing losses") ||
    normalized.includes("questionnaire")
  ) {
    return {
      code: "platform_profile_incomplete",
      message,
    };
  }

  return null;
};
