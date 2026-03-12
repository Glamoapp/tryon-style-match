
CREATE TABLE public.stylist_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  stylist_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION DEFAULT 0,
  speed DOUBLE PRECISION DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'en_route',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stylist_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stylist locations"
  ON public.stylist_locations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stylist locations"
  ON public.stylist_locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stylist locations"
  ON public.stylist_locations FOR UPDATE
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.stylist_locations;
