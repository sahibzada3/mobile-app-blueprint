import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scene, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const languagePrompts: Record<string, string> = {
      en: 'Generate 3 poetic, inspiring quotes in English',
      es: 'Generate 3 poetic, inspiring quotes in Spanish',
      fr: 'Generate 3 poetic, inspiring quotes in French',
      de: 'Generate 3 poetic, inspiring quotes in German',
      it: 'Generate 3 poetic, inspiring quotes in Italian',
      pt: 'Generate 3 poetic, inspiring quotes in Portuguese',
      ar: 'Generate 3 poetic, inspiring quotes in Arabic',
      ur: 'Generate 3 poetic, inspiring quotes in Urdu',
      hi: 'Generate 3 poetic, inspiring quotes in Hindi',
      zh: 'Generate 3 poetic, inspiring quotes in Chinese',
      ja: 'Generate 3 poetic, inspiring quotes in Japanese',
    };

    const sceneDescriptions: Record<string, string> = {
      'golden-hour': 'golden sunset or sunrise with warm amber light painting the landscape',
      'forest': 'mystical forest with dappled light through ancient trees and moss',
      'urban': 'urban cityscape with geometric architecture and street life energy',
      'water': 'serene water scenes with reflections, waves, or tranquil surfaces',
      'silhouette': 'dramatic silhouettes against bright skies creating bold contrasts',
      'fog-mist': 'ethereal fog and mist creating mystery and soft dream-like atmosphere',
      'night': 'nocturnal beauty with starlit skies, moonlight, or city lights glowing',
      'beach-desert': 'vast sandy landscapes with endless horizons and natural textures',
      'rain': 'rainy ambiance with glistening reflections, droplets, and moody atmosphere',
      'sky-clouds': 'celestial drama with clouds, storms, or magnificent sky formations',
      'indoor-golden': 'intimate indoor warmth with golden light and cozy ambiance',
      'old-architecture': 'timeless architecture with history, elegance, and aged beauty',
      'midday-sun': 'bright daylight with strong sun, sharp shadows, and vibrant clarity',
    };

    const languagePrompt = languagePrompts[language] || languagePrompts.en;
    const sceneDescription = sceneDescriptions[scene] || 'beautiful nature photography';

    const systemPrompt = `You are a master of poetic photography overlays. ${languagePrompt} that capture the essence of ${sceneDescription}. 

Generate 3 diverse pieces:

1. **Poetry Verse** - A short poetic verse (2-4 lines) from a famous poet, formatted with line breaks for poetic display. Include poet's name.
   Example: "The woods are lovely, dark and deep,\nBut I have promises to keep"

2. **Famous Quote** - An inspiring quote from a notable person specifically relevant to this scene/mood (nature, time, light, emotion). Include person's name.

3. **Original Poetry** - Your own poetic creation (2-3 lines) with line breaks, capturing the scene's emotion and atmosphere.

CRITICAL Requirements:
- Use actual line breaks (\n) in poetry for multi-line display
- Keep each piece under 25 words
- Make content HIGHLY SPECIFIC to the scene described
- Poetry should have poetic line breaks, not just sentences
- For ${scene} scenes, use imagery/metaphors/quotes that relate directly to that specific atmosphere
- Use evocative, sensory language that matches the visual scene
- In the specified language throughout

Format as JSON array:
[
  {"text": "Line one of poetry\nLine two of poetry", "author": "Poet Name"},
  {"text": "Famous quote text", "author": "Person Name"},  
  {"text": "Original poetic line one\nOriginal line two", "author": null}
]

Make them profound, scene-specific, and beautifully formatted for photography overlay.`;


    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate quotes for: ${sceneDescription}` }
        ],
      }),
    });

    if (!response.ok) {
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
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Extract JSON from the response - handle control characters
    let quotes: Array<{text: string, author: string | null}> = [];
    try {
      // Clean the content first - remove markdown code blocks and extra whitespace
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      const markdownMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch) {
        cleanContent = markdownMatch[1].trim();
      }
      
      // Try to find JSON array
      const arrayMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanContent = arrayMatch[0];
      }
      
      // Parse the JSON
      quotes = JSON.parse(cleanContent);
      
      // Validate the structure
      if (!Array.isArray(quotes)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      
      // Fallback: try to extract text manually if JSON parsing fails
      const fallbackQuotes: string[] = [];
      const lines = content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.includes('"text"') || line.includes("'text'")) {
          // Try to extract text between quotes
          const textMatch = line.match(/["']text["']\s*:\s*["'](.*?)["']/);
          if (textMatch) fallbackQuotes.push(textMatch[1]);
        }
      }
      
      if (fallbackQuotes.length > 0) {
        quotes = fallbackQuotes.map(text => ({ text, author: null }));
      } else {
        // Last resort fallback
        quotes = [
          { text: "Beauty surrounds us", author: null },
          { text: "Nature speaks in whispers", author: null },
          { text: "Light and shadow dance", author: null }
        ];
      }
    }

    // Format quotes with attribution
    const formattedQuotes = quotes.slice(0, 3).map(q => {
      if (typeof q === 'string') {
        return q;
      }
      return q.author ? `${q.text}\n— ${q.author}` : q.text;
    });

    return new Response(
      JSON.stringify({ quotes: formattedQuotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating quotes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate quotes' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
