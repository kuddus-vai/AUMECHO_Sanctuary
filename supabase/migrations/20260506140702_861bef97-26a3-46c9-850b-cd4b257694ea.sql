-- Create public bucket for blog cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public can view blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

-- Admin write
CREATE POLICY "Admins can upload blog covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));