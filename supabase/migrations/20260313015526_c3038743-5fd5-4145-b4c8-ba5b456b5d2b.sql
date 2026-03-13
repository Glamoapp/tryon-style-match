
-- Profiles table for all users (providers and customers)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  city text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider')),
  service_category text,
  bio text,
  avatar_url text,
  is_onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Provider schedule table
CREATE TABLE public.provider_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, day_of_week)
);

ALTER TABLE public.provider_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read schedules" ON public.provider_schedule FOR SELECT USING (true);
CREATE POLICY "Providers can manage own schedule" ON public.provider_schedule FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own schedule" ON public.provider_schedule FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own schedule" ON public.provider_schedule FOR DELETE USING (auth.uid() = provider_id);

-- Provider services table
CREATE TABLE public.provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  duration_minutes int NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read services" ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "Providers can insert own services" ON public.provider_services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own services" ON public.provider_services FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own services" ON public.provider_services FOR DELETE USING (auth.uid() = provider_id);

-- Service photos table
CREATE TABLE public.service_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.provider_services(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read photos" ON public.service_photos FOR SELECT USING (true);
CREATE POLICY "Providers can insert own photos" ON public.service_photos FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own photos" ON public.service_photos FOR DELETE USING (auth.uid() = provider_id);

-- Bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id) NOT NULL,
  provider_id uuid REFERENCES public.profiles(id) NOT NULL,
  service_id uuid REFERENCES public.provider_services(id) NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  completion_code text,
  total_price decimal(10,2) NOT NULL,
  customer_address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Providers can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id OR auth.uid() = customer_id);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'booking', 'payment', 'system')),
  is_read boolean NOT NULL DEFAULT false,
  related_booking_id uuid REFERENCES public.bookings(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for bookings and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Storage bucket for service photos
INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true);

-- Storage RLS
CREATE POLICY "Anyone can read photos" ON storage.objects FOR SELECT USING (bucket_id = 'service-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
