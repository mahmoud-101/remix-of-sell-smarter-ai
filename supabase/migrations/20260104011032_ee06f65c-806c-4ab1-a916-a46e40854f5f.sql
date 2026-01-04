-- Create storage bucket for ad designs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-designs', 'ad-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload ad design images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-designs');

-- Allow authenticated users to view their files
CREATE POLICY "Users can view ad design images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ad-designs');

-- Allow public access to read files
CREATE POLICY "Public can view ad designs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-designs');