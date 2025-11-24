-- Fix the messages check constraint to allow audio_url
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_check;

ALTER TABLE public.messages ADD CONSTRAINT messages_check 
  CHECK (
    (content IS NOT NULL) OR 
    (image_url IS NOT NULL) OR 
    (audio_url IS NOT NULL)
  );

-- Drop the trigger that creates notifications for every message
-- This is too noisy for direct messages, notifications should be handled differently
DROP TRIGGER IF EXISTS trigger_notify_on_message ON public.messages;

-- Optionally, we can drop the function too if it's not used elsewhere
DROP FUNCTION IF EXISTS notify_on_message();