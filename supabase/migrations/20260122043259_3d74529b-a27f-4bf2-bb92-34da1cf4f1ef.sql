-- Add tracking_config column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tracking_config jsonb DEFAULT '{}'::jsonb;