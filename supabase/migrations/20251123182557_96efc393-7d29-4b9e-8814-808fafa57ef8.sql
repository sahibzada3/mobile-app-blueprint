-- Update badges table to allow proper rarity values and add 7 classic badges
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_rarity_check;
ALTER TABLE badges ADD CONSTRAINT badges_rarity_check CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));

-- Add minimum participants constraint to friend_challenges
ALTER TABLE friend_challenges ADD COLUMN min_participants INTEGER NOT NULL DEFAULT 10;

-- Update the award_challenge_points function to award points to top 3
DROP TRIGGER IF EXISTS on_challenge_winner_awarded ON friend_challenges;
DROP FUNCTION IF EXISTS award_challenge_points() CASCADE;

CREATE OR REPLACE FUNCTION award_challenge_points()
RETURNS TRIGGER AS $$
DECLARE
  submission_record RECORD;
  points_for_rank INTEGER;
BEGIN
  -- Only proceed if challenge just moved to completed status
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Award points to top 3 submissions
    FOR submission_record IN 
      SELECT user_id, rank 
      FROM challenge_submissions 
      WHERE challenge_id = NEW.id 
      AND rank IN (1, 2, 3)
      ORDER BY rank
    LOOP
      -- Calculate points based on rank
      IF submission_record.rank = 1 THEN
        points_for_rank := NEW.points_reward; -- Full points for 1st place
      ELSIF submission_record.rank = 2 THEN
        points_for_rank := ROUND(NEW.points_reward * 0.6); -- 60% for 2nd place
      ELSIF submission_record.rank = 3 THEN
        points_for_rank := ROUND(NEW.points_reward * 0.3); -- 30% for 3rd place
      END IF;
      
      -- Award points
      UPDATE user_ranks
      SET total_points = total_points + points_for_rank
      WHERE user_id = submission_record.user_id;
      
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
      VALUES (
        submission_record.user_id,
        CASE submission_record.rank
          WHEN 1 THEN 'challenge_won'
          ELSE 'challenge_placed'
        END,
        CASE submission_record.rank
          WHEN 1 THEN 'You won the challenge! 🏆'
          WHEN 2 THEN 'You placed 2nd! 🥈'
          WHEN 3 THEN 'You placed 3rd! 🥉'
        END,
        'You earned ' || points_for_rank || ' points from "' || NEW.title || '"',
        'challenge',
        NEW.id
      );
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_challenge_winner_awarded
  AFTER UPDATE ON friend_challenges
  FOR EACH ROW
  EXECUTE FUNCTION award_challenge_points();