-- Drop the old public challenges table and create friend-based challenge system
DROP TABLE IF EXISTS challenge_submissions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- Create new friend challenges table
CREATE TABLE friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_prompt TEXT NOT NULL, -- What to photograph (e.g., "best golden hour photo")
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'judging', 'completed')),
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  points_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  judging_completed_at TIMESTAMPTZ,
  end_date TIMESTAMPTZ NOT NULL
);

-- Create challenge participants table (friends invited to challenge)
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES friend_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create challenge submissions table
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES friend_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  ai_score INTEGER, -- AI-generated score out of 100
  ai_feedback TEXT, -- AI feedback on the photo
  rank INTEGER, -- Final rank (1st, 2nd, 3rd, etc.)
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_challenges
CREATE POLICY "Users can view challenges they're part of"
  ON friend_challenges FOR SELECT
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM challenge_participants 
      WHERE challenge_id = friend_challenges.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create challenges"
  ON friend_challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges"
  ON friend_challenges FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their challenges"
  ON friend_challenges FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for challenge_participants
CREATE POLICY "Participants viewable by challenge members"
  ON challenge_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friend_challenges 
      WHERE id = challenge_participants.challenge_id 
      AND (creator_id = auth.uid() OR id IN (
        SELECT challenge_id FROM challenge_participants WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Creators can add participants"
  ON challenge_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friend_challenges 
      WHERE id = challenge_participants.challenge_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave challenges"
  ON challenge_participants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for challenge_submissions
CREATE POLICY "Submissions viewable by challenge members"
  ON challenge_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friend_challenges fc
      WHERE fc.id = challenge_submissions.challenge_id 
      AND (fc.creator_id = auth.uid() OR fc.id IN (
        SELECT challenge_id FROM challenge_participants WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Participants can submit"
  ON challenge_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM challenge_participants 
      WHERE challenge_id = challenge_submissions.challenge_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their submissions"
  ON challenge_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to award points to winner
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_challenge_winner_awarded
  AFTER UPDATE ON friend_challenges
  FOR EACH ROW
  EXECUTE FUNCTION award_challenge_points();

-- Add indexes for performance
CREATE INDEX idx_friend_challenges_creator ON friend_challenges(creator_id);
CREATE INDEX idx_friend_challenges_status ON friend_challenges(status);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX idx_challenge_submissions_user ON challenge_submissions(user_id);