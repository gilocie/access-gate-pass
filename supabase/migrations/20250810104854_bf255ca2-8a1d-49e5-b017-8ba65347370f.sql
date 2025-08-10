-- Fix profiles table unique constraint issue and add missing columns
-- First, add company_name column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update the primary key and unique constraints to prevent duplicates
-- The issue is likely that there are multiple rows with the same user_id
-- Let's clean up duplicates first, keeping only the latest record for each user
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.profiles 
  ORDER BY user_id, updated_at DESC
);

-- Ensure user_id is the primary key to prevent duplicates
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

-- Create subscription plans if they don't exist
INSERT INTO public.subscription_plans (name, price, period, features, max_events, max_tickets, popular) VALUES
('Free', 0, 'month', '[
  "Up to 2 events",
  "Up to 50 tickets per event", 
  "Basic QR codes",
  "Email support"
]'::jsonb, 2, 50, false),
('Pro', 19.99, 'month', '[
  "Up to 10 events",
  "Up to 500 tickets per event",
  "Advanced QR codes", 
  "Custom ticket designs",
  "Analytics dashboard",
  "Priority support"
]'::jsonb, 10, 500, true),
('Enterprise', 49.99, 'month', '[
  "Unlimited events",
  "Unlimited tickets",
  "Premium QR codes",
  "Custom branding",
  "Advanced analytics",
  "24/7 phone support",
  "API access"
]'::jsonb, null, null, false)
ON CONFLICT (name) DO NOTHING;

-- Add ticket status field for better management
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'paused', 'cancelled'));