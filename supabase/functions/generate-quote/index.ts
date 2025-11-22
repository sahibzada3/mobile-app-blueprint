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
      hi: 'Generate 3 poetic, inspiring quotes in Hindi',
      zh: 'Generate 3 poetic, inspiring quotes in Chinese',
      ja: 'Generate 3 poetic, inspiring quotes in Japanese',
    };

    const sceneDescriptions: Record<string, string> = {
      'golden-hour': 'warm golden sunset or sunrise scenes',
      'forest': 'deep green forest or woodland scenes',
      'urban': 'city streets, buildings, and urban architecture',
      'water': 'oceans, lakes, rivers, or water scenes',
      'silhouette': 'dramatic silhouettes against bright backgrounds',
      'fog-mist': 'mysterious foggy or misty atmospheres',
      'night': 'nighttime scenes with stars or city lights',
      'beach-desert': 'sandy beaches or desert landscapes',
      'rain': 'rainy weather with reflections and droplets',
      'sky-clouds': 'dramatic sky with clouds and weather',
      'indoor-golden': 'cozy indoor scenes with warm lighting',
      'old-architecture': 'historic buildings and vintage architecture',
      'midday-sun': 'bright daylight scenes with strong sun',
    };

    const languagePrompt = languagePrompts[language] || languagePrompts.en;
    const sceneDescription = sceneDescriptions[scene] || 'beautiful nature photography';

    const systemPrompt = `You are a creative content generator for nature photography overlays. ${languagePrompt} that perfectly match ${sceneDescription}. 

Generate 3 diverse items mixing these types:
1. **Poetry lines** - Beautiful verses from classic or contemporary poets (with poet name)
2. **Famous quotes** - Inspirational quotes from notable people about nature, life, or the scene (with person's name)
3. **Original poetic quotes** - Your own evocative phrases

Each should be:
- Short enough for photo overlay (15-20 words maximum)
- Deeply connected to the scene and mood
- In the specified language
- Attributed when from a real person/poet

Format as JSON array of objects:
[
  {"text": "The quote or poetry line", "author": "Author Name (or null for original)"},
  ...
]

Mix at least one famous quote/poetry WITH attribution and one or two originals. Make them profound and memorable.`;


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
    
    // Extract JSON from the response
    let quotes: Array<{text: string, author: string | null}> = [];
    try {
      // Try to parse as direct JSON
      quotes = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        quotes = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: try to find array in the text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          quotes = JSON.parse(arrayMatch[0]);
        }
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
