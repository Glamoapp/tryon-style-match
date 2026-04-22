CREATE POLICY "Admins can read all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));