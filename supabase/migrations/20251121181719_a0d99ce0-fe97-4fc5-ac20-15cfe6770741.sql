-- Add message reactions for direct messages
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Add message reactions for chain messages
CREATE TABLE IF NOT EXISTS public.chain_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chain_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Add edited_at column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Add edited_at column to chain_messages table
ALTER TABLE public.chain_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chain_message_reactions
ALTER TABLE public.chain_message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view message reactions"
  ON public.message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for chain_message_reactions
CREATE POLICY "Chain participants can view reactions"
  ON public.chain_message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chain_messages cm
      JOIN public.chain_participants cp ON cm.chain_id = cp.chain_id
      WHERE cm.id = chain_message_reactions.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Chain participants can add reactions"
  ON public.chain_message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chain_messages cm
      JOIN public.chain_participants cp ON cm.chain_id = cp.chain_id
      WHERE cm.id = chain_message_reactions.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reactions"
  ON public.chain_message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure messages bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat images storage
CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view chat images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

CREATE POLICY "Users can delete their own chat images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );