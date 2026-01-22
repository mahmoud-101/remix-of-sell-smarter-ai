-- Drop the security definer view and recreate as regular view with RLS
DROP VIEW IF EXISTS public.store_connections_safe;

-- Create a simple view without SECURITY DEFINER (relies on RLS of underlying table)
CREATE VIEW public.store_connections_safe AS
SELECT 
  id,
  user_id,
  platform,
  store_name,
  store_url,
  is_active,
  products_count,
  last_sync_at,
  created_at,
  updated_at,
  CASE WHEN api_key_encrypted IS NOT NULL THEN true ELSE false END as has_api_key,
  CASE WHEN api_secret_encrypted IS NOT NULL THEN true ELSE false END as has_api_secret
FROM public.store_connections;

-- Enable RLS on the view (it inherits from the table)
-- Views automatically respect the RLS of the underlying table

-- Grant access to the view
GRANT SELECT ON public.store_connections_safe TO authenticated;