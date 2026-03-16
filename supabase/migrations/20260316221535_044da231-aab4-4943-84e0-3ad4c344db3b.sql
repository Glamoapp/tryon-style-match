
-- Rewards/promotions table (admin-managed)
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL DEFAULT 'promotion',
  discount_percent NUMERIC,
  discount_amount NUMERIC,
  points_cost INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer points balance
CREATE TABLE public.customer_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Point transaction history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'earned',
  description TEXT,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Rewards: anyone can read active rewards
CREATE POLICY "Anyone can read rewards" ON public.rewards FOR SELECT USING (true);

-- Customer points: users can read own points
CREATE POLICY "Users can read own points" ON public.customer_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert points" ON public.customer_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update points" ON public.customer_points FOR UPDATE USING (auth.uid() = user_id);

-- Point transactions: users can read own
CREATE POLICY "Users can read own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for rewards
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards;
