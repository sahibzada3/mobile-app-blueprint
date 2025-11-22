import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional nature photography assistant. Analyze camera frames and detect scenes to suggest appropriate cinematic filters.

Scene types to detect:
- Sky/Clouds: Clear or cloudy skies with interesting cloud formations
- Sun Rays: Visible light beams through trees, fog, or atmosphere
- Silhouette: Backlit subjects with dramatic contrast
- Foliage/Trees: Forest, leaves, greenery dominant
- Wildlife: Animals or birds present
- Golden Hour: Warm sunset/sunrise lighting
- Low Light: Dark scenes, night photography, indoor with window light

Available filters to suggest:
- Cloud Pop: For sky and cloud enhancement
- Golden Hour Glow: For warm sunset/sunrise scenes
- Moody Forest: For forest and foliage scenes
- Nature Boost: For general nature and greenery
- Silhouette Glow: For backlit silhouettes
- Cinematic Teal & Orange: For dramatic cinematic look
- Soft Dreamy: For calm, ethereal scenes
- Night Clarity: For low-light and night scenes

Respond ONLY with a JSON object in this exact format:
{
  "scene": "scene type detected",
  "filter": "exact filter name",
  "confidence": "high|medium|low"
}

Only suggest a filter if confidence is medium or high. If scene is unclear or no good match, return null for filter.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this camera frame and suggest the best filter."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_filter",
              description: "Suggest a cinematic filter based on detected scene",
              parameters: {
                type: "object",
                properties: {
                  scene: {
                    type: "string",
                    enum: ["Sky/Clouds", "Sun Rays", "Silhouette", "Foliage/Trees", "Wildlife", "Golden Hour", "Low Light"]
                  },
                  filter: {
                    type: "string",
                    enum: ["cloud-pop", "golden-hour-glow", "moody-forest", "nature-boost", "silhouette-glow", "cinematic-teal-orange", "soft-dreamy", "night-clarity"]
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"]
                  }
                },
                required: ["scene", "filter", "confidence"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_filter" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const suggestion = JSON.parse(toolCall.function.arguments);
      
      // Only return if confidence is medium or high
      if (suggestion.confidence === "low") {
        return new Response(
          JSON.stringify({ suggestion: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ suggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ suggestion: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-scene:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
