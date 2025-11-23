import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { spotId, spotName, description, sceneTypes } = await req.json();

    if (!spotId || !spotName) {
      throw new Error('Missing required fields: spotId and spotName');
    }

    console.log(`Generating image for spot: ${spotName}`);

    // Create image prompt based on spot details
    const sceneContext = sceneTypes?.join(', ') || 'landscape';
    const prompt = `Professional photography of ${spotName} in Pakistan. ${description}. Scene type: ${sceneContext}. Ultra high resolution, beautiful lighting, cinematic composition, 16:9 aspect ratio`;

    // Generate image using Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI generation failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const base64Image = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Image) {
      throw new Error('No image generated from AI');
    }

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = base64Image.split(',')[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileName = `spots/${spotId}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Update spot with image URL
    const { error: updateError } = await supabase
      .from('photography_spots')
      .update({ image_url: publicUrl })
      .eq('id', spotId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`Successfully generated and saved image for ${spotName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl,
        message: `Image generated for ${spotName}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
