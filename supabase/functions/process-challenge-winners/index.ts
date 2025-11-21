import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BadgeAward {
  userId: string;
  badgeId: string;
  challengeId: string;
  rank: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting challenge winner processing...')

    // Find challenges that have ended but badges haven't been awarded
    const now = new Date().toISOString()
    const { data: endedChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .lt('end_date', now)
      .eq('badges_awarded', false)
      .eq('status', 'active')

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError)
      throw challengesError
    }

    console.log(`Found ${endedChallenges?.length || 0} challenges to process`)

    if (!endedChallenges || endedChallenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No challenges to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    let totalBadgesAwarded = 0

    // Process each challenge
    for (const challenge of endedChallenges) {
      console.log(`Processing challenge: ${challenge.title} (${challenge.id})`)

      // Get top 3 submissions for this challenge
      const { data: topSubmissions, error: submissionsError } = await supabase
        .from('challenge_submissions')
        .select('*, profile:profiles(username)')
        .eq('challenge_id', challenge.id)
        .order('score', { ascending: false })
        .order('submitted_at', { ascending: true })
        .limit(3)

      if (submissionsError) {
        console.error(`Error fetching submissions for challenge ${challenge.id}:`, submissionsError)
        continue
      }

      if (!topSubmissions || topSubmissions.length === 0) {
        console.log(`No submissions found for challenge ${challenge.id}`)
        // Mark as processed even with no submissions
        await supabase
          .from('challenges')
          .update({ badges_awarded: true, status: 'completed' })
          .eq('id', challenge.id)
        continue
      }

      console.log(`Found ${topSubmissions.length} top submissions`)

      // Get appropriate badges for each rank
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .in('category', ['achievement', 'competition'])
        .order('rarity', { ascending: false })
        .limit(3)

      if (badgesError || !badges || badges.length === 0) {
        console.error('Error fetching badges:', badgesError)
        continue
      }

      // Award badges and create notifications
      const badgeAwards: BadgeAward[] = []
      const notifications: any[] = []

      for (let i = 0; i < topSubmissions.length; i++) {
        const submission = topSubmissions[i]
        const rank = i + 1
        const badge = badges[i] || badges[0] // Use first badge if not enough badges

        // Mark submission as winner if rank 1
        if (rank === 1) {
          await supabase
            .from('challenge_submissions')
            .update({ is_winner: true })
            .eq('id', submission.id)
        }

        // Award badge - using service role to bypass RLS
        const { error: badgeError } = await supabase
          .from('user_badges')
          .insert({
            user_id: submission.user_id,
            badge_id: badge.id,
            challenge_id: challenge.id,
          })

        if (!badgeError) {
          badgeAwards.push({
            userId: submission.user_id,
            badgeId: badge.id,
            challengeId: challenge.id,
            rank,
          })
          totalBadgesAwarded++

          // Create notification
          const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'
          notifications.push({
            user_id: submission.user_id,
            title: `${rankText} Place in Challenge!`,
            message: `Congratulations! You placed ${rankText} in "${challenge.title}" and earned the "${badge.name}" badge!`,
            type: 'achievement',
            related_id: challenge.id,
            related_type: 'challenge',
          })

          console.log(`Awarded ${badge.name} badge to user ${submission.user_id} for rank ${rank}`)
        } else {
          console.error(`Error awarding badge to user ${submission.user_id}:`, badgeError)
        }
      }

      // Insert all notifications
      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications)

        if (notificationError) {
          console.error('Error creating notifications:', notificationError)
        } else {
          console.log(`Created ${notifications.length} notifications`)
        }
      }

      // Mark challenge as processed
      const { error: updateError } = await supabase
        .from('challenges')
        .update({ badges_awarded: true, status: 'completed' })
        .eq('id', challenge.id)

      if (updateError) {
        console.error(`Error updating challenge ${challenge.id}:`, updateError)
      } else {
        console.log(`Challenge ${challenge.id} marked as completed`)
      }
    }

    const response = {
      message: 'Challenge winners processed successfully',
      challenges_processed: endedChallenges.length,
      badges_awarded: totalBadgesAwarded,
    }

    console.log('Processing complete:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error processing challenge winners:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
