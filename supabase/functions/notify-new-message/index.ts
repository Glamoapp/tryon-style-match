import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const SITE_URL = "https://nextlookbeauty.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message_id } = await req.json();
    if (!message_id || typeof message_id !== "string") {
      return new Response(JSON.stringify({ error: "message_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: message, error: msgErr } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at")
      .eq("id", message_id)
      .single();

    if (msgErr || !message) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", [message.sender_id, message.receiver_id]);

    const sender = profiles?.find((p) => p.id === message.sender_id);
    const receiver = profiles?.find((p) => p.id === message.receiver_id);

    if (!receiver) {
      return new Response(JSON.stringify({ error: "Recipient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't spam: skip if we already alerted this recipient in the last 15 minutes
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("messages")
      .select("id")
      .eq("sender_id", message.sender_id)
      .eq("receiver_id", message.receiver_id)
      .lt("created_at", message.created_at)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return new Response(JSON.stringify({ ok: true, skipped: "recently_notified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = sender?.full_name || "Someone";
    const preview = (message.content || "").slice(0, 140);

    // In-app notification
    await supabase.from("notifications").insert({
      user_id: receiver.id,
      title: `New message from ${senderName}`,
      message: preview,
      type: "message",
    });

    // Email
    if (receiver.email) {
      try {
        await sendTemplateEmail("new-message-alert", receiver.email, {
          idempotencyKey: `new-message-${message.id}`,
          templateData: {
            recipientName: receiver.full_name,
            senderName,
            messagePreview: preview,
            inboxUrl: `${SITE_URL}/messages`,
          },
        });
      } catch (e) {
        console.error("Message email error:", e);
      }
    }

    // SMS via Twilio
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (receiver.phone && LOVABLE_API_KEY && TWILIO_API_KEY) {
      try {
        const numbersRes = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
          },
        });
        const numbersData = await numbersRes.json();
        const fromNumber = numbersData?.incoming_phone_numbers?.[0]?.phone_number;

        if (fromNumber) {
          const digits = String(receiver.phone).replace(/[^\d+]/g, "");
          const to = digits.startsWith("+") ? digits : `+1${digits.replace(/^1/, "")}`;
          const smsRes = await fetch(`${GATEWAY_URL}/Messages.json`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TWILIO_API_KEY,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: to,
              From: fromNumber,
              Body: `💬 New message from ${senderName} on NextLook:\n"${preview}"\n\nReply here: ${SITE_URL}/messages`,
            }),
          });
          if (!smsRes.ok) console.error("Message SMS failed:", await smsRes.text());
        } else {
          console.error("No Twilio phone number available");
        }
      } catch (e) {
        console.error("Message SMS error:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-new-message error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
