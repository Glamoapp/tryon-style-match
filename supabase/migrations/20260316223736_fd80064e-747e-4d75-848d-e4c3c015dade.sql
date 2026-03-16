
INSERT INTO storage.buckets (id, name, public) VALUES ('reward-images', 'reward-images', true);

CREATE POLICY "Anyone can read reward images" ON storage.objects FOR SELECT USING (bucket_id = 'reward-images');
CREATE POLICY "Authenticated users can upload reward images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reward-images');
CREATE POLICY "Authenticated users can update reward images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'reward-images');
CREATE POLICY "Authenticated users can delete reward images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reward-images');
