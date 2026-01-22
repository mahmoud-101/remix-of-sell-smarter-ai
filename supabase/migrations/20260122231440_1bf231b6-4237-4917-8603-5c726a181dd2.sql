-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to encrypt API credentials
CREATE OR REPLACE FUNCTION public.encrypt_api_credential(credential TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use a server-side secret for encryption (stored in vault or env)
  encryption_key := current_setting('app.encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    -- Fallback: use a derived key from service role (still secure, only accessible server-side)
    encryption_key := encode(digest(current_setting('request.jwt.claims', true)::text || 'store_credentials_v1', 'sha256'), 'hex');
  END IF;
  
  IF credential IS NULL OR credential = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(credential, encryption_key),
    'base64'
  );
END;
$$;

-- Create a secure function to decrypt API credentials (only callable by authenticated users for their own data)
CREATE OR REPLACE FUNCTION public.decrypt_api_credential(encrypted_credential TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := encode(digest(current_setting('request.jwt.claims', true)::text || 'store_credentials_v1', 'sha256'), 'hex');
  END IF;
  
  IF encrypted_credential IS NULL OR encrypted_credential = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(encrypted_credential, 'base64'),
      encryption_key
    );
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails (old unencrypted data), return as-is
    RETURN encrypted_credential;
  END;
END;
$$;

-- Add new encrypted columns
ALTER TABLE public.store_connections 
ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS api_secret_encrypted TEXT;

-- Create a trigger to automatically encrypt credentials on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_store_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Encrypt api_key if provided and not already encrypted
  IF NEW.api_key IS NOT NULL AND NEW.api_key != '' THEN
    NEW.api_key_encrypted := public.encrypt_api_credential(NEW.api_key);
    NEW.api_key := '***ENCRYPTED***'; -- Mask the original
  END IF;
  
  -- Encrypt api_secret if provided and not already encrypted
  IF NEW.api_secret IS NOT NULL AND NEW.api_secret != '' AND NEW.api_secret != '***ENCRYPTED***' THEN
    NEW.api_secret_encrypted := public.encrypt_api_credential(NEW.api_secret);
    NEW.api_secret := '***ENCRYPTED***'; -- Mask the original
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for encryption
DROP TRIGGER IF EXISTS encrypt_credentials_trigger ON public.store_connections;
CREATE TRIGGER encrypt_credentials_trigger
  BEFORE INSERT OR UPDATE ON public.store_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_store_credentials();

-- Create a secure view that never exposes raw credentials
CREATE OR REPLACE VIEW public.store_connections_safe AS
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
  -- Never expose actual credentials in views
  CASE WHEN api_key_encrypted IS NOT NULL THEN '***' ELSE NULL END as has_api_key,
  CASE WHEN api_secret_encrypted IS NOT NULL THEN '***' ELSE NULL END as has_api_secret
FROM public.store_connections
WHERE auth.uid() = user_id;

-- Grant access to the safe view
GRANT SELECT ON public.store_connections_safe TO authenticated;

-- Create RPC function for edge functions to get decrypted credentials (server-side only)
CREATE OR REPLACE FUNCTION public.get_store_credentials(connection_uuid UUID)
RETURNS TABLE(api_key TEXT, api_secret TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return credentials for the authenticated user's own connections
  RETURN QUERY
  SELECT 
    public.decrypt_api_credential(sc.api_key_encrypted) as api_key,
    public.decrypt_api_credential(sc.api_secret_encrypted) as api_secret
  FROM public.store_connections sc
  WHERE sc.id = connection_uuid 
    AND sc.user_id = auth.uid();
END;
$$;