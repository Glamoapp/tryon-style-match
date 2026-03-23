import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateCompletionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      name, email, phone, address,
      bookingDate, bookingTime,
      providerId, serviceId,
      servicePrice,
    } = await req.json();

    if (!email || !name || !providerId || !serviceId || !bookingDate || !bookingTime) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check for existing booking at this slot
    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("provider_id", providerId)
      .eq("booking_date", bookingDate)
      .eq("booking_time", bookingTime)
      .not("status", "in", '("rejected","cancelled")')
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: "slot_taken" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to find existing user by email
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let userId: string | null = null;
    const existingUser = users?.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Auto-create account with a random password
      const randomPassword = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: signupError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          phone,
          role: "customer",
        },
      });

      if (signupError || !newUser?.user) {
        console.error("Failed to create user:", signupError);
        return new Response(JSON.stringify({ error: "Failed to create account" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = newUser.user.id;
    }

    // Update profile with latest contact info
    await supabaseAdmin.from("profiles").update({
      full_name: name,
      phone,
    }).eq("id", userId);

    // Create booking
    const completionCode = generateCompletionCode();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        customer_id: userId,
        provider_id: providerId,
        service_id: serviceId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        total_price: servicePrice ?? 0,
        customer_address: address,
        completion_code: completionCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("Failed to create booking:", bookingError);
      if ((bookingError as any)?.code === "23505") {
        return new Response(JSON.stringify({ error: "slot_taken" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget: notify provider
    supabaseAdmin.functions.invoke("notify-booking", {
      body: { booking_id: booking.id },
    }).catch((err) => console.error("Booking notification failed:", err));

    return new Response(JSON.stringify({ bookingId: booking.id, userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Guest booking error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
