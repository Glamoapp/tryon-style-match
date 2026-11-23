CREATE TABLE public.customer_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_referrals TO authenticated;
GRANT ALL ON public.customer_referrals TO service_role;
ALTER TABLE public.customer_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrers and admins can see referrals"
ON public.customer_referrals FOR SELECT TO authenticated
USING (auth.uid() = referrer_id OR private.is_admin(auth.uid()));
CREATE INDEX customer_referrals_referrer_idx ON public.customer_referrals (referrer_id);

CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'available',
  earned_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz
);
GRANT SELECT ON public.referral_rewards TO authenticated;
GRANT ALL ON public.referral_rewards TO service_role;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners and admins can see referral rewards"
ON public.referral_rewards FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE INDEX referral_rewards_user_idx ON public.referral_rewards (user_id, status);

-- Returns (and creates if needed) the signed-in user's personal referral code.
CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  code text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  SELECT referral_code INTO code FROM public.profiles WHERE id = uid;
  IF code IS NULL THEN
    code := public.generate_stylist_referral_code();
    UPDATE public.profiles SET referral_code = code WHERE id = uid;
  END IF;
  RETURN code;
END;
$$;

-- Links a newly created account to the friend who referred it.
-- Every 5th referred friend earns the referrer one free service.
CREATE OR REPLACE FUNCTION public.claim_customer_referral(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  clean_code text := upper(trim(coalesce(_code, '')));
  ref_id uuid;
  account_created timestamptz;
  inserted_id uuid;
  friend_count int;
BEGIN
  IF uid IS NULL OR clean_code = '' THEN
    RETURN false;
  END IF;

  SELECT id INTO ref_id FROM public.profiles WHERE referral_code = clean_code;
  IF ref_id IS NULL OR ref_id = uid THEN
    RETURN false;
  END IF;

  -- Only brand-new accounts can be counted as referred friends.
  SELECT created_at INTO account_created FROM public.profiles WHERE id = uid;
  IF account_created IS NULL OR account_created < now() - interval '7 days' THEN
    RETURN false;
  END IF;

  INSERT INTO public.customer_referrals (referrer_id, referred_id, referral_code)
  VALUES (ref_id, uid, clean_code)
  ON CONFLICT (referred_id) DO NOTHING
  RETURNING id INTO inserted_id;

  IF inserted_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO friend_count FROM public.customer_referrals WHERE referrer_id = ref_id;
  IF friend_count % 5 = 0 THEN
    INSERT INTO public.referral_rewards (user_id) VALUES (ref_id);
  END IF;

  RETURN true;
END;
$$;

-- Uses one of the signed-in user's available free-service rewards.
CREATE OR REPLACE FUNCTION public.redeem_referral_reward()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  reward_id uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT id INTO reward_id
    FROM public.referral_rewards
   WHERE user_id = uid AND status = 'available'
   ORDER BY earned_at
   LIMIT 1
   FOR UPDATE SKIP LOCKED;
  IF reward_id IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.referral_rewards
     SET status = 'redeemed', redeemed_at = now()
   WHERE id = reward_id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_referral_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_customer_referral(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_referral_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_customer_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_referral_reward() TO authenticated;