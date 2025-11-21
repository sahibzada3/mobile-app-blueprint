-- Create chain_messages table for group chats
CREATE TABLE public.chain_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chain_id UUID NOT NULL REFERENCES public.spotlight_chains(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content IS NOT NULL OR image_url IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.chain_messages ENABLE ROW LEVEL SECURITY;

-- Only chain participants can view messages
CREATE POLICY "Chain participants can view messages"
  ON public.chain_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chain_participants
      WHERE chain_participants.chain_id = chain_messages.chain_id
      AND chain_participants.user_id = auth.uid()
    )
  );

-- Only chain participants can send messages
CREATE POLICY "Chain participants can send messages"
  ON public.chain_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chain_participants
      WHERE chain_participants.chain_id = chain_messages.chain_id
      AND chain_participants.user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.chain_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX idx_chain_messages_chain_id ON public.chain_messages(chain_id);
CREATE INDEX idx_chain_messages_sender_id ON public.chain_messages(sender_id);
CREATE INDEX idx_chain_messages_created_at ON public.chain_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chain_messages;