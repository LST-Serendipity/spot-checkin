-- Create spots table
CREATE TABLE IF NOT EXISTS spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  cover_image TEXT,
  current_cycle_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_kept BOOLEAN DEFAULT FALSE,
  cycle_start TIMESTAMP,
  total_score INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  visitor_name TEXT,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_images_spot_id ON images(spot_id);
CREATE INDEX IF NOT EXISTS idx_images_cycle_start ON images(cycle_start);
CREATE INDEX IF NOT EXISTS idx_images_is_kept ON images(is_kept);
CREATE INDEX IF NOT EXISTS idx_ratings_image_id ON ratings(image_id);

-- Enable Row Level Security
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read spots" ON spots FOR SELECT USING (true);
CREATE POLICY "Public read images" ON images FOR SELECT USING (true);
CREATE POLICY "Public read ratings" ON ratings FOR SELECT USING (true);

-- Public insert access
CREATE POLICY "Public insert spots" ON spots FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert images" ON images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert ratings" ON ratings FOR INSERT WITH CHECK (true);

-- Enable storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-images', 'spot-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Public read images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'spot-images');

CREATE POLICY "Public upload images storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'spot-images');

CREATE POLICY "Public delete images storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'spot-images');
