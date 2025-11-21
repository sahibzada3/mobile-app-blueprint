-- Enable realtime for challenge_submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_submissions;

-- Enable realtime for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;