-- ============================================================================
-- COMPLETE SECURITY POLICY OVERHAUL
-- Securing profiles, photos, votes, comments, messages, friendships, chains
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE - Require authentication and respect privacy settings
-- ============================================================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Authenticated users can view profiles based on privacy settings
CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Always show own profile
  id = auth.uid() OR
  -- Public profiles
  privacy_settings->>'profile_visibility' = 'everyone' OR
  -- Friends-only profiles (check friendship)
  (
    privacy_settings->>'profile_visibility' = 'friends' AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE status = 'accepted' AND (
        (user_id = auth.uid() AND friend_id = profiles.id) OR
        (friend_id = auth.uid() AND user_id = profiles.id)
      )
    )
  )
);

-- ============================================================================
-- 2. PHOTOS TABLE - Require authentication and respect privacy settings
-- ============================================================================

DROP POLICY IF EXISTS "Photos are viewable by everyone" ON photos;

-- Authenticated users can view photos based on user's privacy settings
CREATE POLICY "Authenticated users can view photos"
ON photos FOR SELECT
TO authenticated
USING (
  -- Always show own photos
  user_id = auth.uid() OR
  -- Check photo owner's privacy settings
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = photos.user_id AND (
      profiles.privacy_settings->>'photo_visibility' = 'everyone' OR
      (
        profiles.privacy_settings->>'photo_visibility' = 'friends' AND
        EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted' AND (
            (user_id = auth.uid() AND friend_id = photos.user_id) OR
            (friend_id = auth.uid() AND user_id = photos.user_id)
          )
        )
      )
    )
  )
);

-- ============================================================================
-- 3. VOTES TABLE - Require authentication
-- ============================================================================

DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;

-- Authenticated users can view votes
CREATE POLICY "Authenticated users can view votes"
ON votes FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 4. COMMENTS TABLE - Require authentication
-- ============================================================================

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;

-- Authenticated users can view comments
CREATE POLICY "Authenticated users can view comments"
ON comments FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 5. SPOTLIGHT_CHAINS (FLARES) - Restrict to participants
-- ============================================================================

DROP POLICY IF EXISTS "Chains are viewable by everyone" ON spotlight_chains;

-- Only participants can view chains
CREATE POLICY "Participants can view chains"
ON spotlight_chains FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM chain_participants
    WHERE chain_id = spotlight_chains.id
    AND user_id = auth.uid()
  )
);

-- ============================================================================
-- 6. CHAIN_PARTICIPANTS - Require authentication
-- ============================================================================

DROP POLICY IF EXISTS "Participants are viewable by everyone" ON chain_participants;

-- Authenticated users can view chain participants
CREATE POLICY "Authenticated users can view participants"
ON chain_participants FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 7. FIX INFINITE RECURSION IN CHALLENGE_PARTICIPANTS
-- ============================================================================

-- Create security definer function to check challenge membership
CREATE OR REPLACE FUNCTION is_challenge_member(_user_id uuid, _challenge_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM challenge_participants
    WHERE challenge_id = _challenge_id
    AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM friend_challenges
    WHERE id = _challenge_id
    AND creator_id = _user_id
  )
$$;

-- Drop and recreate the problematic policy
DROP POLICY IF EXISTS "Participants viewable by challenge members" ON challenge_participants;

CREATE POLICY "Participants viewable by challenge members"
ON challenge_participants FOR SELECT
TO authenticated
USING (is_challenge_member(auth.uid(), challenge_id));

-- ============================================================================
-- 8. PHOTOGRAPHY_SPOTS - Require authentication
-- ============================================================================

DROP POLICY IF EXISTS "Spots are viewable by everyone" ON photography_spots;

CREATE POLICY "Authenticated users can view spots"
ON photography_spots FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 9. CHALLENGE_SUBMISSIONS - Already properly secured, verify
-- ============================================================================

-- Keep existing policy (already checks challenge membership)

-- ============================================================================
-- 10. USER_RANKS AND BADGES - Already properly secured
-- ============================================================================

-- Keep existing policies (read-only for everyone, system manages)

-- ============================================================================
-- SECURITY SUMMARY
-- ============================================================================
-- ✅ Profiles: Require auth + respect privacy settings (everyone/friends)
-- ✅ Photos: Require auth + respect owner's photo_visibility setting
-- ✅ Votes: Require authentication
-- ✅ Comments: Require authentication  
-- ✅ Messages: Already properly secured (sender/recipient only)
-- ✅ Friendships: Already properly secured (involved users only)
-- ✅ Spotlight Chains: Restricted to participants only
-- ✅ Chain Participants: Require authentication
-- ✅ Challenge Participants: Fixed infinite recursion with security definer
-- ✅ Photography Spots: Require authentication
-- ============================================================================