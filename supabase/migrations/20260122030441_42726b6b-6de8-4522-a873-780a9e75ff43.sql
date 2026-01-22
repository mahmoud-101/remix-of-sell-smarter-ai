-- Create enum for store platforms
CREATE TYPE public.store_platform AS ENUM ('shopify', 'woocommerce');

-- Create store connections table
CREATE TABLE public.store_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform store_platform NOT NULL,
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  -- For Shopify: access_token, For WooCommerce: consumer_key
  api_key TEXT,
  -- For WooCommerce: consumer_secret
  api_secret TEXT,
  -- Additional metadata
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Each user can only have one connection per platform
  UNIQUE (user_id, platform)
);

-- Enable RLS
ALTER TABLE public.store_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connections
CREATE POLICY "Users can view their own store connections"
ON public.store_connections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert their own store connections"
ON public.store_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own store connections"
ON public.store_connections
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own store connections"
ON public.store_connections
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_store_connections_updated_at
BEFORE UPDATE ON public.store_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create synced products table
CREATE TABLE public.synced_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_connection_id UUID REFERENCES public.store_connections(id) ON DELETE CASCADE,
  external_product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  image_url TEXT,
  product_url TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  -- Generated content
  generated_title TEXT,
  generated_description TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  -- Sync status
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Unique product per store
  UNIQUE (store_connection_id, external_product_id)
);

-- Enable RLS
ALTER TABLE public.synced_products ENABLE ROW LEVEL SECURITY;

-- Users can only see their own products
CREATE POLICY "Users can view their own synced products"
ON public.synced_products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own synced products"
ON public.synced_products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own synced products"
ON public.synced_products
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own synced products"
ON public.synced_products
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_synced_products_updated_at
BEFORE UPDATE ON public.synced_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();