-- Fix search path security issue properly
DROP TRIGGER IF EXISTS on_challenge_winner_awarded ON friend_challenges;
DROP FUNCTION IF EXISTS award_challenge_points() CASCADE;

CREATE OR REPLACE FUNCTION award_challenge_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
    -- Award points to winner
    UPDATE user_ranks
    SET total_points = total_points + NEW.points_reward
    WHERE user_id = NEW.winner_id;
    
    -- Create notification for winner
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      NEW.winner_id,
      'challenge_won',
      'You won a challenge!',
      'You earned ' || NEW.points_reward || ' points from "' || NEW.title || '"',
      'challenge',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_challenge_winner_awarded
  AFTER UPDATE ON friend_challenges
  FOR EACH ROW
  EXECUTE FUNCTION award_challenge_points();