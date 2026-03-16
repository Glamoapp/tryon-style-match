
-- Allow authenticated users to insert/update/delete rewards (admin check is done at app level)
CREATE POLICY "Authenticated users can insert rewards" ON public.rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rewards" ON public.rewards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rewards" ON public.rewards FOR DELETE TO authenticated USING (true);
