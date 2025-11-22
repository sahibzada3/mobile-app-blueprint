-- Add tips table
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add user earnings tracking
CREATE TABLE IF NOT EXISTS public.user_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tips
CREATE POLICY "Users can view their sent tips"
  ON tips FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view their received tips"
  ON tips FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send tips"
  ON tips FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for user_earnings
CREATE POLICY "Users can view their own earnings"
  ON user_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage earnings"
  ON user_earnings FOR ALL
  USING (false);

-- Function to update earnings after tip
CREATE OR REPLACE FUNCTION update_earnings_after_tip()
RETURNS TRIGGER AS $$
BEGIN
  -- Update recipient's earnings
  INSERT INTO user_earnings (user_id, total_earned, available_balance)
  VALUES (NEW.recipient_id, NEW.amount, NEW.amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_earned = user_earnings.total_earned + NEW.amount,
    available_balance = user_earnings.available_balance + NEW.amount,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for earnings update
CREATE TRIGGER update_earnings_on_tip
  AFTER INSERT ON tips
  FOR EACH ROW
  EXECUTE FUNCTION update_earnings_after_tip();

-- Function to initialize user rank on profile creation
CREATE OR REPLACE FUNCTION init_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_ranks (user_id, rank_name, rank_level, total_points)
  VALUES (NEW.id, 'Beginner', 1, 0);
  
  INSERT INTO user_earnings (user_id, total_earned, available_balance)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to initialize rank on profile creation
CREATE TRIGGER init_rank_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION init_user_rank();

-- Create indexes
CREATE INDEX idx_tips_sender ON tips(sender_id);
CREATE INDEX idx_tips_recipient ON tips(recipient_id);
CREATE INDEX idx_tips_photo ON tips(photo_id);
CREATE INDEX idx_user_earnings_user ON user_earnings(user_id);