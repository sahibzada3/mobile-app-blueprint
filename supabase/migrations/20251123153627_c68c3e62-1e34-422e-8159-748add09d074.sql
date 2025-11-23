-- Create photography_spots table
CREATE TABLE IF NOT EXISTS public.photography_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  best_time TEXT NOT NULL DEFAULT 'anytime',
  scene_types TEXT[] NOT NULL DEFAULT '{}',
  weather_types TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating DECIMAL(3, 2) DEFAULT 0,
  views_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.photography_spots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Spots are viewable by everyone"
  ON public.photography_spots
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add spots"
  ON public.photography_spots
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own spots"
  ON public.photography_spots
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own spots"
  ON public.photography_spots
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create index for location-based queries
CREATE INDEX idx_spots_location ON public.photography_spots (latitude, longitude);

-- Insert some sample curated spots
INSERT INTO public.photography_spots (name, description, latitude, longitude, best_time, scene_types, weather_types, image_url) VALUES
('Golden Gate Vista Point', 'Iconic bridge views with stunning sunset opportunities', 37.8199, -122.4783, 'golden_hour', ARRAY['landscape', 'urban', 'architecture'], ARRAY['sunny', 'cloudy'], NULL),
('Central Park Bethesda Terrace', 'Beautiful architecture and natural light for portraits', 40.7722, -73.9714, 'anytime', ARRAY['architecture', 'urban'], ARRAY['sunny', 'cloudy'], NULL),
('Griffith Observatory', 'Perfect for cityscape and night photography', 34.1184, -118.3004, 'blue_hour', ARRAY['landscape', 'urban', 'night'], ARRAY['sunny', 'cloudy'], NULL),
('Pike Place Market', 'Vibrant urban scenes and street photography', 47.6097, -122.3425, 'anytime', ARRAY['urban', 'street'], ARRAY['rainy', 'cloudy', 'sunny'], NULL),
('Antelope Canyon', 'Stunning natural light beams and rock formations', 36.8619, -111.3743, 'golden_hour', ARRAY['landscape', 'nature'], ARRAY['sunny'], NULL);