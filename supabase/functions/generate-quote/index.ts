import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scene, language } = await req.json();
    
    if (!scene || !language) {
      return new Response(
        JSON.stringify({ error: 'Scene and language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ar': 'Arabic',
      'ur': 'Urdu',
      'ps': 'Pashto',
      'hi': 'Hindi',
      'zh': 'Chinese',
      'ja': 'Japanese',
    };

    const languageName = languageNames[language] || 'English';
    const prompt = `Generate 5 beautiful, poetic quotes suitable for a nature photography app. The photo scene is: ${scene}. 
    
Generate quotes in ${languageName}. The quotes should be:
- Short and impactful (1-2 lines each)
- Poetic and evocative
- Related to nature, photography, or the scene
- Culturally appropriate for ${languageName} speakers
- Perfect for overlaying on a photograph

Return ONLY a JSON object with this exact structure:
{
  "quotes": ["quote1", "quote2", "quote3", "quote4", "quote5"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a poetic quote generator for a nature photography app. Always return valid JSON with the exact structure requested.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI API error');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    if (!result.quotes || !Array.isArray(result.quotes)) {
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ quotes: result.quotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quote function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
