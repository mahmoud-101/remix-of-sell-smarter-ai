-- Create shopify_connections table for OAuth flow
CREATE TABLE IF NOT EXISTS public.shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  shop_url TEXT NOT NULL,
  shop_name TEXT,
  access_token_encrypted TEXT,
  scopes TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shopify connections"
ON public.shopify_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopify connections"
ON public.shopify_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopify connections"
ON public.shopify_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopify connections"
ON public.shopify_connections FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for automatic encryption of access_token
CREATE OR REPLACE FUNCTION public.encrypt_shopify_token()
RETURNS TRIGGER AS $$
BEGIN
  -- If access_token is provided in a special column, encrypt it
  IF NEW.access_token_encrypted IS NOT NULL AND NEW.access_token_encrypted != '' AND NEW.access_token_encrypted NOT LIKE 'c1%' THEN
    NEW.access_token_encrypted := public.encrypt_api_credential(NEW.access_token_encrypted);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER encrypt_shopify_token_trigger
BEFORE INSERT OR UPDATE ON public.shopify_connections
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_shopify_token();

-- Function to get decrypted token (only for authenticated user's own connection)
CREATE OR REPLACE FUNCTION public.get_shopify_token(connection_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_token TEXT;
BEGIN
  SELECT access_token_encrypted INTO encrypted_token
  FROM public.shopify_connections
  WHERE id = connection_uuid AND user_id = auth.uid();
  
  IF encrypted_token IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN public.decrypt_api_credential(encrypted_token);
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_shopify_connections_updated_at
BEFORE UPDATE ON public.shopify_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add shopify-related columns to generated_content if not exist
ALTER TABLE public.generated_content 
ADD COLUMN IF NOT EXISTS product_id TEXT,
ADD COLUMN IF NOT EXISTS product_title TEXT,
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS tone TEXT;