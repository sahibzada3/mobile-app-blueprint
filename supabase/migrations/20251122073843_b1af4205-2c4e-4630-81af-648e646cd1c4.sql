-- Create slices (stories) table
CREATE TABLE IF NOT EXISTS public.slices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  music_track TEXT,
  visibility TEXT NOT NULL DEFAULT 'friends',
  chain_required BOOLEAN DEFAULT false,
  required_chain_id UUID REFERENCES spotlight_chains(id),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create slice views tracking
CREATE TABLE IF NOT EXISTS public.slice_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_id UUID NOT NULL REFERENCES slices(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slice_id, viewer_id)
);

-- Create user ranks table
CREATE TABLE IF NOT EXISTS public.user_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  rank_name TEXT NOT NULL DEFAULT 'Beginner',
  rank_level INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  photos_count INTEGER DEFAULT 0,
  challenges_won INTEGER DEFAULT 0,
  chains_created INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slice_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ranks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slices
CREATE POLICY "Users can create their own slices"
  ON slices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public slices"
  ON slices FOR SELECT
  USING (
    visibility = 'public' OR
    user_id = auth.uid() OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_id = slices.user_id AND friend_id = auth.uid() AND status = 'accepted')
         OR (friend_id = slices.user_id AND user_id = auth.uid() AND status = 'accepted')
    ))
  );

CREATE POLICY "Users can update their own slices"
  ON slices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slices"
  ON slices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for slice_views
CREATE POLICY "Users can create their own views"
  ON slice_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can view their viewing history"
  ON slice_views FOR SELECT
  USING (auth.uid() = viewer_id);

-- RLS Policies for user_ranks
CREATE POLICY "Everyone can view ranks"
  ON user_ranks FOR SELECT
  USING (true);

CREATE POLICY "System can manage ranks"
  ON user_ranks FOR ALL
  USING (false);

-- Function to update rank
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
DECLARE
  new_rank_name TEXT;
  new_rank_level INTEGER;
BEGIN
  -- Calculate rank based on total points
  IF NEW.total_points >= 10000 THEN
    new_rank_name := 'Master';
    new_rank_level := 5;
  ELSIF NEW.total_points >= 5000 THEN
    new_rank_name := 'Expert';
    new_rank_level := 4;
  ELSIF NEW.total_points >= 2000 THEN
    new_rank_name := 'Advanced';
    new_rank_level := 3;
  ELSIF NEW.total_points >= 500 THEN
    new_rank_name := 'Intermediate';
    new_rank_level := 2;
  ELSE
    new_rank_name := 'Beginner';
    new_rank_level := 1;
  END IF;
  
  NEW.rank_name := new_rank_name;
  NEW.rank_level := new_rank_level;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update rank
CREATE TRIGGER update_rank_on_points
  BEFORE INSERT OR UPDATE OF total_points ON user_ranks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rank();

-- Create indexes
CREATE INDEX idx_slices_user_id ON slices(user_id);
CREATE INDEX idx_slices_expires_at ON slices(expires_at);
CREATE INDEX idx_slice_views_slice_id ON slice_views(slice_id);
CREATE INDEX idx_user_ranks_user_id ON user_ranks(user_id);