import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { challengeId } = await req.json();
    
    if (!challengeId) {
      return new Response(
        JSON.stringify({ error: 'Challenge ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('friend_challenges')
      .select('*, challenge_submissions(*, photos(image_url, caption))')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found');
    }

    const submissions = challenge.challenge_submissions || [];
    
    if (submissions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No submissions to judge' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to judge each submission
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const judgedSubmissions = await Promise.all(
      submissions.map(async (submission: any) => {
        const photo = submission.photos;
        const prompt = `You are a professional photography judge evaluating a photo for this challenge: "${challenge.challenge_prompt}".

Photo caption: ${photo.caption || 'No caption'}

Rate this photo on a scale of 1-100 based on:
- How well it matches the challenge prompt
- Technical quality (composition, lighting, focus)
- Creativity and artistic merit

Provide:
1. A score (1-100)
2. Brief constructive feedback (2-3 sentences)

Respond in JSON format: {"score": number, "feedback": "text"}`;

        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            console.error('AI API error:', await response.text());
            return { ...submission, ai_score: 50, ai_feedback: 'Unable to judge at this time' };
          }

          const data = await response.json();
          const result = JSON.parse(data.choices[0].message.content);
          
          return {
            ...submission,
            ai_score: Math.min(100, Math.max(1, result.score)),
            ai_feedback: result.feedback
          };
        } catch (error) {
          console.error('Error judging submission:', error);
          return { ...submission, ai_score: 50, ai_feedback: 'Unable to judge at this time' };
        }
      })
    );

    // Sort by score and assign ranks
    judgedSubmissions.sort((a, b) => b.ai_score - a.ai_score);
    
    // Update all submissions with AI scores and ranks
    for (let i = 0; i < judgedSubmissions.length; i++) {
      const submission = judgedSubmissions[i];
      await supabaseClient
        .from('challenge_submissions')
        .update({
          ai_score: submission.ai_score,
          ai_feedback: submission.ai_feedback,
          rank: i + 1
        })
        .eq('id', submission.id);
    }

    // Update challenge status and set winner
    const winner = judgedSubmissions[0];
    await supabaseClient
      .from('friend_challenges')
      .update({
        status: 'completed',
        winner_id: winner.user_id,
        judging_completed_at: new Date().toISOString()
      })
      .eq('id', challengeId);

    return new Response(
      JSON.stringify({
        success: true,
        winner: winner.user_id,
        submissions: judgedSubmissions.map(s => ({
          user_id: s.user_id,
          rank: judgedSubmissions.indexOf(s) + 1,
          score: s.ai_score,
          feedback: s.ai_feedback
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});