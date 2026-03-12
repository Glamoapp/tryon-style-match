import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

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
    const { booking_id, stylist_name, latitude, longitude, heading, speed, status } = await req.json();

    if (!booking_id || latitude === undefined || longitude === undefined) {
      throw new Error("booking_id, latitude, and longitude are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert: update if booking_id exists, insert if not
    const { data: existing } = await supabase
      .from("stylist_locations")
      .select("id")
      .eq("booking_id", booking_id)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from("stylist_locations")
        .update({
          latitude,
          longitude,
          heading: heading ?? 0,
          speed: speed ?? 0,
          status: status ?? "en_route",
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", booking_id);
    } else {
      result = await supabase
        .from("stylist_locations")
        .insert({
          booking_id,
          stylist_name: stylist_name ?? "Stylist",
          latitude,
          longitude,
          heading: heading ?? 0,
          speed: speed ?? 0,
          status: status ?? "en_route",
        });
    }

    if (result.error) throw result.error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
