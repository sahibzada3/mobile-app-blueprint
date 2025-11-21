-- Add foreign key relationship between challenge_submissions and profiles
ALTER TABLE public.challenge_submissions
ADD CONSTRAINT challenge_submissions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;