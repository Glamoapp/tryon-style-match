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

    const stylePrompt = `TASK: Add ONLY a new hairstyle to this exact person and lightly smooth the skin. This is a HAIR-ONLY edit, NOT a face swap.

ABSOLUTE IDENTITY PRESERVATION — HIGHEST PRIORITY:
1. The output MUST be the SAME PERSON from the input photo. Preserve their exact facial identity: same face shape, same jawline, same cheekbones, same nose shape and size, same lips, same eye shape and color, same eyebrows, same ethnicity, same age, same gender, same expression. The result must be instantly recognizable as the same individual.
2. DO NOT generate a different person. DO NOT swap, replace, restructure, or "beautify" the face into someone else. If the face looks like a different person, you have failed.
3. Skin tone must match the original EXACTLY — do not lighten, darken, or shift the skin color.

SKIN SMOOTHING (subtle and natural only):
4. Apply a LIGHT, natural retouch on the facial skin: gently reduce blemishes, small spots, redness, and harsh shadows. Keep natural skin texture and pores visible. Do NOT over-smooth into a plastic, waxy, or airbrushed look. Think "good lighting + light retouch," not heavy filter.

PRESERVE EVERYTHING ELSE:
5. Keep the clothing, neck, shoulders, lighting direction, pose, camera angle, and background pixel-identical to the original photo.

HAIR PLACEMENT & ANATOMY (the only structural change allowed) — CRITICAL:
6. Replace ONLY the hair region on top of and around the head with the new hairstyle below.
7. The hair MUST sit on the actual scalp following the real shape, size, angle, and tilt of the person's head in the photo. Do NOT float the hair above the head, do NOT shift it sideways, and do NOT make the head look bigger or smaller to fit the hair.
8. The HAIRLINE must start at the person's natural hairline on the forehead — not lower (covering eyebrows), not higher (floating above the scalp). Match the curvature of their forehead and temples exactly.
9. The TOP/CROWN of the hair must follow the natural dome of the skull. The SIDES must wrap correctly around the temples and ears. The BACK must follow the back of the head with realistic depth.
10. The BOTTOM of the hair (where it ends) must hang naturally with gravity based on the head pose — falling onto/around the shoulders, not floating in mid-air, not clipping through the neck, shoulders, or clothing.
11. Keep the forehead, cheeks, jawline, and ears (if visible) clearly visible. Do NOT cover the face with bangs unless the style explicitly requires it, and even then keep the eyes and main facial features visible.
12. Blend the new hair seamlessly at the hairline with realistic shadows, depth, and lighting that match the original photo's light direction. No floating strands, no flat 2D sticker look, no misalignment with the head.
13. The result must look like REAL hair physically growing from this person's scalp — not a wig pasted on top.

NEW HAIRSTYLE TO APPLY:
- Style: "${styleName || "natural"}"
- Color: ${color || "natural black"}
- Length: ${length || "medium"}
- Texture: ${texture || "straight"}

OUTPUT: A photo of the SAME PERSON (identical, recognizable face) with lightly smoothed skin, wearing the new hairstyle. It should look like the same person took a salon photo on a good-lighting day.`;

    // Try the highest-quality model first for best identity preservation,
    // then fall back to the faster flash model on failure / rate limit.
    const models = [
      "google/gemini-3-pro-image-preview",
      "google/gemini-3.1-flash-image-preview",
    ];

    let lastStatus = 500;
    for (const model of models) {
      console.log(`Trying model: ${model}`);
      const result = await callImageModel(LOVABLE_API_KEY, stylePrompt, selfieBase64, model);
      lastStatus = result.status;

      // Payment required - stop immediately, no point retrying other models
      if (result.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits needed. Please top up your workspace.", fallback: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (result.image) {
        return new Response(JSON.stringify({ image: result.image, message: result.text || "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // On 429 or any other error, try next model
      console.log(`Model ${model} failed (status ${result.status}), trying next...`);
    }

    // All models failed - return 200 with fallback signal so client SDK can read the body
    const isRateLimit = lastStatus === 429;
    return new Response(
      JSON.stringify({
        error: isRateLimit
          ? "The AI service is busy right now. Please wait a moment and try again."
          : "Could not generate the hairstyle image. Please try again with a clearer photo or different style.",
        fallback: true,
        rateLimited: isRateLimit,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("try-on-hair error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
