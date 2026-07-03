import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_agent, page_url } = await req.json().catch(() => ({}));

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Kick off tracking in the background so the client isn't blocked
    // by slow geo lookups or DB writes.
    const task = (async () => {
      let geo = { city: "Unknown", region: "Unknown", country: "Unknown", lat: 0, lon: 0 };
      try {
        const geoRes = await fetchWithTimeout(
          `https://ipapi.co/${ip}/json/`,
          2000,
        );
        if (geoRes.ok) {
          const g = await geoRes.json();
          if (g?.city) {
            geo = {
              city: g.city,
              region: g.region,
              country: g.country_name,
              lat: g.latitude ?? 0,
              lon: g.longitude ?? 0,
            };
          }
        }
      } catch (e) {
        console.error("Geo lookup failed:", (e as Error).message);
      }

      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
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
        if (error) console.error("Insert error:", error.message);
      } catch (e) {
        console.error("Insert threw:", (e as Error).message);
      }
    })();

    // @ts-ignore EdgeRuntime is available in Supabase edge runtime
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(task);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Track visitor error:", err);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
