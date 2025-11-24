-- Remove music_track column from photos table
ALTER TABLE public.photos DROP COLUMN IF EXISTS music_track;