import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_agent, page_url } = await req.json();

    // Get visitor IP from headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("cf-connecting-ip") ||
               "unknown";

    // Geo lookup using free IP API
    let geo = { city: "Unknown", region: "Unknown", country: "Unknown", lat: 0, lon: 0 };
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,lat,lon`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.city) {
          geo = {
            city: geoData.city,
            region: geoData.regionName,
            country: geoData.country,
            lat: geoData.lat,
            lon: geoData.lon,
          };
        }
      }
    } catch (e) {
      console.error("Geo lookup failed:", e);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Insert visitor log
    const { error } = await supabase.from("visitor_logs").insert({
      ip_address: ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      latitude: geo.lat,
      longitude: geo.lon,
      user_agent: user_agent || null,
      page_url: page_url || null,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, location: `${geo.city}, ${geo.region}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Track visitor error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
