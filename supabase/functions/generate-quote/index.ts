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
    const prompt = `Generate 5 beautiful texts suitable for a nature photography app. The photo scene is: ${scene}. 
    
Generate in ${languageName}. Create exactly:
- 3 poetry couplets (2-line verses) from REAL famous poets known for nature/romantic poetry
- 2 famous quotes from REAL well-known authors, philosophers, or poets

CRITICAL REQUIREMENTS:
- ALL 5 items MUST have a real author/poet name - NO "Unknown", NO null, NO anonymous
- For poetry: Use famous poets like Rumi, Hafiz, Wordsworth, Keats, Tagore, Ghalib, Rahman Baba, Khushal Khan Khattak, etc.
- For quotes: Use real authors like Thoreau, Emerson, Muir, Einstein, etc.
- Poetry must be in couplet form (2 lines that flow together naturally with "\\n" between them)
- Culturally appropriate for ${languageName} speakers
- If ${languageName} is Pashto, use famous Pashto poets like Rahman Baba, Khushal Khan Khattak, Hamza Shinwari
- If ${languageName} is Urdu, use famous Urdu poets like Ghalib, Iqbal, Faiz, Mir Taqi Mir

Return ONLY a JSON object with this exact structure:
{
  "quotes": [
    {"text": "First line of poetry\\nSecond line completing the verse", "author": "Famous Poet Name"},
    {"text": "First line of poetry\\nSecond line completing the verse", "author": "Famous Poet Name"},
    {"text": "First line of poetry\\nSecond line completing the verse", "author": "Famous Poet Name"},
    {"text": "famous quote about nature or life", "author": "Famous Author Name"},
    {"text": "famous quote about nature or life", "author": "Famous Author Name"}
  ]
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
          { role: 'system', content: 'You are a poetic quote generator for a nature photography app. Always return valid JSON with the exact structure requested. NEVER use "Unknown" or null for author names - always use real famous poet/author names.' },
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

    // Ensure all quotes have both text and author - use a default poet if missing
    const defaultPoets = ['Rumi', 'Hafiz', 'Tagore', 'Wordsworth', 'Keats'];
    const formattedQuotes = result.quotes.map((q: any, index: number) => {
      if (typeof q === 'string') {
        return { text: q, author: defaultPoets[index % defaultPoets.length] };
      }
      const author = q.author && q.author !== 'Unknown' && q.author !== 'unknown' && q.author !== null 
        ? q.author 
        : defaultPoets[index % defaultPoets.length];
      return { text: q.text || q, author };
    });

    return new Response(
      JSON.stringify({ quotes: formattedQuotes }),
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
