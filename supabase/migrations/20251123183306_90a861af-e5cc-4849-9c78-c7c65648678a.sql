-- Update challenge constraints to 3-10 participants
ALTER TABLE friend_challenges DROP COLUMN IF EXISTS min_participants;
ALTER TABLE friend_challenges ADD COLUMN min_participants INTEGER NOT NULL DEFAULT 3;
ALTER TABLE friend_challenges ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 10;

-- Add auto_judge_scheduled flag
ALTER TABLE friend_challenges ADD COLUMN auto_judge_scheduled BOOLEAN DEFAULT false;

-- Create function to auto-judge ended challenges
CREATE OR REPLACE FUNCTION auto_judge_ended_challenges()
RETURNS void AS $$
DECLARE
  challenge_record RECORD;
  submission_count INTEGER;
BEGIN
  -- Find challenges that have ended, not yet judged, and have enough submissions
  FOR challenge_record IN 
    SELECT * FROM friend_challenges 
    WHERE status = 'active' 
    AND end_date < NOW() 
    AND auto_judge_scheduled = false
  LOOP
    -- Count submissions for this challenge
    SELECT COUNT(*) INTO submission_count
    FROM challenge_submissions
    WHERE challenge_id = challenge_record.id;
    
    -- Only mark for auto-judging if we have minimum participants
    IF submission_count >= challenge_record.min_participants THEN
      UPDATE friend_challenges
      SET auto_judge_scheduled = true
      WHERE id = challenge_record.id;
      
      -- Notify creator that challenge is ready to judge
      INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
      VALUES (
        challenge_record.creator_id,
        'challenge_ready',
        'Challenge Ready to Judge! 🏆',
        'Your challenge "' || challenge_record.title || '" has ended with ' || submission_count || ' submissions. Time to judge!',
        'challenge',
        challenge_record.id
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;