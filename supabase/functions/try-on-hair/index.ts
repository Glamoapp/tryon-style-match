import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callImageModel(apiKey: string, prompt: string, imageUrl: string, model: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI gateway error (${model}):`, response.status, errorText);
    return { status: response.status, error: errorText, image: null };
  }

  const data = await response.json();
  const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  const resultText = data.choices?.[0]?.message?.content || "";
  const refusal = data.choices?.[0]?.message?.refusal;

  if (!resultImage) {
    console.error(`No image from ${model}. Refusal: ${refusal || "none"}. Content: ${resultText?.substring(0, 500)}`);
  }

  return { status: 200, image: resultImage, text: resultText, error: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { selfieBase64, styleName, color, length, texture } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!selfieBase64) throw new Error("No selfie image provided");

    const stylePrompt = `TASK: Add ONLY a new hairstyle to this exact person. This is a HAIR-ONLY edit, NOT a face swap.

CRITICAL RULES — DO NOT VIOLATE:
1. The person's face MUST remain 100% identical and fully visible — same exact face, same skin tone, same skin texture, same eyes, same nose, same lips, same eyebrows, same facial structure, same expression, same age, same ethnicity. DO NOT regenerate, smooth, beautify, or alter the face in ANY way.
2. Keep the clothing, neck, shoulders, lighting, pose, and background pixel-identical to the original photo.
3. ONLY modify the hair region on top of and around the head. Replace the existing hair with the new hairstyle described below.
4. The forehead, cheeks, jawline, ears (if visible), and entire face must stay clearly visible — do NOT cover the face with hair bangs unless the style explicitly requires it, and even then keep the eyes and main facial features visible.
5. The new hair must blend naturally at the hairline with realistic shadows and lighting that match the original photo.

NEW HAIRSTYLE TO APPLY:
- Style: "${styleName || "natural"}"
- Color: ${color || "natural black"}
- Length: ${length || "medium"}
- Texture: ${texture || "straight"}

OUTPUT: A photo of the SAME PERSON (identical face) wearing the new hairstyle, looking like a real salon photo.`;

    // Try primary model, fall back to flash model on failure
    const models = [
      "google/gemini-3.1-flash-image-preview",
      "google/gemini-3-pro-image-preview",
    ];

    for (const model of models) {
      console.log(`Trying model: ${model}`);
      const result = await callImageModel(LOVABLE_API_KEY, stylePrompt, selfieBase64, model);

      if (result.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (result.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please top up your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (result.image) {
        return new Response(JSON.stringify({ image: result.image, message: result.text || "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Model ${model} did not return an image, trying next...`);
    }

    // All models failed
    return new Response(JSON.stringify({ error: "Could not generate the hairstyle image. Please try again with a clearer photo or different style." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("try-on-hair error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
