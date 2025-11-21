-- Add audio_url and duration columns to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Add audio_url and duration columns to chain_messages
ALTER TABLE public.chain_messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.chain_messages ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Create audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for voice messages storage
CREATE POLICY "Authenticated users can upload voice messages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-messages' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view voice messages"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-messages');

CREATE POLICY "Users can delete their own voice messages"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-messages' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );