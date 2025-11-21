-- Create spotlight chains table
CREATE TABLE public.spotlight_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_participants INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chain participants table
CREATE TABLE public.chain_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.spotlight_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chain_id, user_id)
);

-- Create chain contributions table
CREATE TABLE public.chain_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.spotlight_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chain_id, photo_id)
);

-- Enable RLS
ALTER TABLE public.spotlight_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spotlight_chains
CREATE POLICY "Chains are viewable by everyone"
  ON public.spotlight_chains FOR SELECT
  USING (true);

CREATE POLICY "Users can create chains"
  ON public.spotlight_chains FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their chains"
  ON public.spotlight_chains FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their chains"
  ON public.spotlight_chains FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for chain_participants
CREATE POLICY "Participants are viewable by everyone"
  ON public.chain_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join chains"
  ON public.chain_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chains"
  ON public.chain_participants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chain_contributions
CREATE POLICY "Contributions are viewable by everyone"
  ON public.chain_contributions FOR SELECT
  USING (true);

CREATE POLICY "Participants can add contributions"
  ON public.chain_contributions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chain_participants
      WHERE chain_id = chain_contributions.chain_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their contributions"
  ON public.chain_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_spotlight_chains_updated_at
  BEFORE UPDATE ON public.spotlight_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chains
ALTER PUBLICATION supabase_realtime ADD TABLE public.spotlight_chains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chain_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chain_contributions;