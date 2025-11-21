-- Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN privacy_settings JSONB DEFAULT '{
  "profile_visibility": "everyone",
  "photo_visibility": "everyone",
  "activity_visibility": "everyone"
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.privacy_settings IS 'Privacy settings: profile_visibility, photo_visibility, activity_visibility. Values: everyone, friends, private';