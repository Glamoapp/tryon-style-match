DROP POLICY IF EXISTS "Anyone can read schedules" ON public.provider_schedule;
CREATE POLICY "Providers can read own schedule"
ON public.provider_schedule FOR SELECT TO authenticated
USING (auth.uid() = provider_id);
CREATE POLICY "Admins can read all schedules"
ON public.provider_schedule FOR SELECT TO authenticated
USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can read rewards" ON public.rewards;
CREATE POLICY "Anyone can read active rewards"
ON public.rewards FOR SELECT TO anon, authenticated
USING (is_active = true);
CREATE POLICY "Admins can read all rewards"
ON public.rewards FOR SELECT TO authenticated
USING (private.is_admin(auth.uid()));