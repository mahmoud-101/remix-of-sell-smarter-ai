-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS credits_used integer DEFAULT 0;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_subscription_id text,
  stripe_customer_id text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Create generated_content table (renamed from history for clarity)
CREATE TABLE IF NOT EXISTS public.generated_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  credits_used integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on generated_content
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generated_content
CREATE POLICY "Users can view their own generated content"
ON public.generated_content FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated content"
ON public.generated_content FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated content"
ON public.generated_content FOR DELETE
USING (auth.uid() = user_id);

-- Create usage_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  credits integer DEFAULT 1,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_logs
CREATE POLICY "Users can view their own usage logs"
ON public.usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs"
ON public.usage_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at on subscriptions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();