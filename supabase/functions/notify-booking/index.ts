import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get booking details
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(`
        id, booking_date, booking_time, total_price, status,
        customer:profiles!bookings_customer_id_fkey(full_name, email, phone),
        provider:profiles!bookings_provider_id_fkey(full_name),
        service:provider_services!bookings_service_id_fkey(service_name)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingErr || !booking) {
      console.error("Booking fetch error:", bookingErr);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = (booking as any).customer;
    const provider = (booking as any).provider;
    const service = (booking as any).service;

    const message = `📋 New Booking!\n\nCustomer: ${customer?.full_name || "Unknown"}\nStylist: ${provider?.full_name || "Unknown"}\nService: ${service?.service_name || "Unknown"}\nDate: ${booking.booking_date}\nTime: ${booking.booking_time}\nPrice: $${booking.total_price}\n\n— NextLook Beauty`;

    // Send SMS via Twilio
    const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE_NUMBER");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");

    if (LOVABLE_API_KEY && TWILIO_API_KEY && ADMIN_PHONE) {
      try {
        // Get Twilio phone numbers to find the "From" number
        const numbersRes = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
          },
        });
        const numbersData = await numbersRes.json();
        const fromNumber = numbersData?.incoming_phone_numbers?.[0]?.phone_number;

        if (fromNumber) {
          const smsRes = await fetch(`${GATEWAY_URL}/Messages.json`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TWILIO_API_KEY,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: ADMIN_PHONE.startsWith("+") ? ADMIN_PHONE : `+1${ADMIN_PHONE}`,
              From: fromNumber,
              Body: message,
            }),
          });

          const smsData = await smsRes.json();
          if (!smsRes.ok) {
            console.error("SMS failed:", smsData);
          } else {
            console.log("SMS sent:", smsData.sid);
          }
        } else {
          console.error("No Twilio phone number found");
        }
      } catch (smsErr) {
        console.error("SMS error:", smsErr);
      }
    } else {
      console.warn("Missing SMS config - LOVABLE_API_KEY, TWILIO_API_KEY, or ADMIN_PHONE_NUMBER");
    }

    // Send admin email notification via transactional email system
    try {
      const { error: emailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-booking-alert",
          recipientEmail: "nextlookbeauty@gmail.com",
          idempotencyKey: `admin-booking-alert-${booking.id}`,
          templateData: {
            customerName: customer?.full_name,
            customerEmail: customer?.email,
            customerPhone: customer?.phone,
            customerAddress: booking.customer_address,
            stylistName: provider?.full_name,
            serviceName: service?.service_name,
            bookingDate: booking.booking_date,
            bookingTime: booking.booking_time,
            totalPrice: String(booking.total_price ?? ""),
            bookingId: booking.id,
          },
        },
      });
      if (emailErr) console.error("Admin email invoke error:", emailErr);
      else console.log("Admin booking email queued");
    } catch (emailErr) {
      console.error("Admin email error:", emailErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Notify booking error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
