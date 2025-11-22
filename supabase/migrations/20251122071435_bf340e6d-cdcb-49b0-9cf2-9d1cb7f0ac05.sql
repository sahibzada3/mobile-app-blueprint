-- Create function to notify on new vote
CREATE OR REPLACE FUNCTION public.notify_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  photo_owner_id uuid;
  voter_username text;
BEGIN
  -- Get photo owner
  SELECT user_id INTO photo_owner_id FROM photos WHERE id = NEW.photo_id;
  
  -- Get voter username
  SELECT username INTO voter_username FROM profiles WHERE id = NEW.user_id;
  
  -- Don't notify if user votes on their own photo
  IF photo_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (
    photo_owner_id,
    CASE WHEN NEW.vote_type = 'upvote' THEN 'like' ELSE 'feedback' END,
    voter_username || ' ' || CASE WHEN NEW.vote_type = 'upvote' THEN 'liked' ELSE 'downvoted' END || ' your photo',
    COALESCE(NEW.feedback, ''),
    'photo',
    NEW.photo_id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to notify on new comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  photo_owner_id uuid;
  commenter_username text;
BEGIN
  -- Get photo owner
  SELECT user_id INTO photo_owner_id FROM photos WHERE id = NEW.photo_id;
  
  -- Get commenter username
  SELECT username INTO commenter_username FROM profiles WHERE id = NEW.user_id;
  
  -- Don't notify if user comments on their own photo
  IF photo_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (
    photo_owner_id,
    'comment',
    commenter_username || ' commented on your photo',
    NEW.content,
    'photo',
    NEW.photo_id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to notify on friend request
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_username text;
BEGIN
  -- Only notify on new pending requests
  IF NEW.status != 'pending' OR TG_OP = 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  -- Get requester username
  SELECT username INTO requester_username FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (
    NEW.friend_id,
    'friend_request',
    requester_username || ' sent you a friend request',
    'Tap to view and respond',
    'friendship',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to notify on friend request accepted
CREATE OR REPLACE FUNCTION public.notify_on_friend_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepter_username text;
BEGIN
  -- Only notify when status changes to accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get accepter username
    SELECT username INTO accepter_username FROM profiles WHERE id = NEW.friend_id;
    
    -- Notify the original requester
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      NEW.user_id,
      'friend_accepted',
      accepter_username || ' accepted your friend request',
      'You are now friends!',
      'profile',
      NEW.friend_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_username text;
  message_preview text;
BEGIN
  -- Get sender username
  SELECT username INTO sender_username FROM profiles WHERE id = NEW.sender_id;
  
  -- Create preview
  IF NEW.content IS NOT NULL THEN
    message_preview := LEFT(NEW.content, 50);
  ELSIF NEW.image_url IS NOT NULL THEN
    message_preview := 'Sent a photo';
  ELSIF NEW.audio_url IS NOT NULL THEN
    message_preview := 'Sent a voice message';
  ELSE
    message_preview := 'Sent a message';
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (
    NEW.recipient_id,
    'message',
    sender_username || ' sent you a message',
    message_preview,
    'message',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to notify on chain invitation
CREATE OR REPLACE FUNCTION public.notify_on_chain_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chain_title text;
  creator_id uuid;
  creator_username text;
BEGIN
  -- Get chain info
  SELECT title, creator_id INTO chain_title, creator_id 
  FROM spotlight_chains WHERE id = NEW.chain_id;
  
  -- Get creator username
  SELECT username INTO creator_username FROM profiles WHERE id = creator_id;
  
  -- Don't notify if user joins their own chain
  IF creator_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
  VALUES (
    NEW.user_id,
    'chain_invite',
    'Added to "' || chain_title || '"',
    creator_username || ' added you to their spotlight chain',
    'chain',
    NEW.chain_id
  );
  
  RETURN NEW;
END;
$$;

-- Create function to notify on new chain contribution
CREATE OR REPLACE FUNCTION public.notify_on_chain_contribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chain_title text;
  contributor_username text;
  participant_record RECORD;
BEGIN
  -- Get chain title
  SELECT title INTO chain_title FROM spotlight_chains WHERE id = NEW.chain_id;
  
  -- Get contributor username
  SELECT username INTO contributor_username FROM profiles WHERE id = NEW.user_id;
  
  -- Notify all participants except the contributor
  FOR participant_record IN 
    SELECT user_id FROM chain_participants 
    WHERE chain_id = NEW.chain_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
    VALUES (
      participant_record.user_id,
      'chain_contribution',
      contributor_username || ' added a photo',
      'New contribution to "' || chain_title || '"',
      'chain',
      NEW.chain_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_on_vote ON votes;
CREATE TRIGGER trigger_notify_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_vote();

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

DROP TRIGGER IF EXISTS trigger_notify_on_friend_request ON friendships;
CREATE TRIGGER trigger_notify_on_friend_request
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_friend_request();

DROP TRIGGER IF EXISTS trigger_notify_on_friend_accepted ON friendships;
CREATE TRIGGER trigger_notify_on_friend_accepted
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_friend_accepted();

DROP TRIGGER IF EXISTS trigger_notify_on_message ON messages;
CREATE TRIGGER trigger_notify_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();

DROP TRIGGER IF EXISTS trigger_notify_on_chain_participant ON chain_participants;
CREATE TRIGGER trigger_notify_on_chain_participant
  AFTER INSERT ON chain_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_chain_participant();

DROP TRIGGER IF EXISTS trigger_notify_on_chain_contribution ON chain_contributions;
CREATE TRIGGER trigger_notify_on_chain_contribution
  AFTER INSERT ON chain_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_chain_contribution();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;