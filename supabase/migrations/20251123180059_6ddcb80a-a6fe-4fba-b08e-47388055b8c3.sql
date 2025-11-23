-- Drop tables in correct order (child tables first due to foreign keys)
DROP TABLE IF EXISTS slice_views CASCADE;
DROP TABLE IF EXISTS slices CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS user_earnings CASCADE;

-- Drop the tip-related function
DROP FUNCTION IF EXISTS update_earnings_after_tip() CASCADE;

-- Update init_user_rank function to remove earnings initialization
CREATE OR REPLACE FUNCTION public.init_user_rank()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_ranks (user_id, rank_name, rank_level, total_points)
  VALUES (NEW.id, 'Beginner', 1, 0);
  
  RETURN NEW;
END;
$function$;