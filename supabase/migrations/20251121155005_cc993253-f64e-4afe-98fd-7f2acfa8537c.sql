-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  requirements TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_description TEXT,
  image_url TEXT,
  max_submissions INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create challenge_submissions table
CREATE TABLE public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  UNIQUE(challenge_id, user_id, photo_id)
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (false); -- Will be updated when admin system is implemented

CREATE POLICY "Only admins can update challenges"
  ON public.challenges FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete challenges"
  ON public.challenges FOR DELETE
  USING (false);

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage badges"
  ON public.badges FOR ALL
  USING (false);

-- RLS Policies for challenge_submissions
CREATE POLICY "Submissions are viewable by everyone"
  ON public.challenge_submissions FOR SELECT
  USING (true);

CREATE POLICY "Users can submit their own entries"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.challenge_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON public.challenge_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Only system can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (false); -- Badges awarded via backend functions only

-- Create indexes for performance
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX idx_challenge_submissions_user ON public.challenge_submissions(user_id);
CREATE INDEX idx_challenge_submissions_score ON public.challenge_submissions(score DESC);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON public.user_badges(badge_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial badges
INSERT INTO public.badges (name, description, icon, rarity, category) VALUES
  ('First Steps', 'Complete your first challenge', 'Award', 'common', 'achievement'),
  ('Golden Hour Master', 'Win a golden hour photography challenge', 'Sun', 'rare', 'lighting'),
  ('Composition Expert', 'Win 3 composition challenges', 'Palette', 'epic', 'composition'),
  ('Nature Photographer', 'Complete 10 nature-themed challenges', 'Mountain', 'rare', 'category'),
  ('Challenge Champion', 'Win 5 challenges in a row', 'Trophy', 'legendary', 'achievement'),
  ('Early Bird', 'Submit within the first hour of a challenge', 'Clock', 'common', 'speed'),
  ('Consistent Creator', 'Submit to 10 consecutive challenges', 'Target', 'epic', 'consistency'),
  ('Community Favorite', 'Get 100+ upvotes on a challenge submission', 'Heart', 'rare', 'social'),
  ('Technical Master', 'Win an advanced difficulty challenge', 'Zap', 'epic', 'skill'),
  ('Weather Warrior', 'Complete all weather-themed challenges', 'Cloud', 'legendary', 'category');