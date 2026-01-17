import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface AuthResult {
  userId: string;
  email?: string;
}

/**
 * Validates JWT token from Authorization header and returns user info
 * Call this at the start of protected edge functions
 */
export async function validateAuth(req: Request): Promise<{ data: AuthResult | null; error: Response | null }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      data: null,
      error: new Response(
        JSON.stringify({ error: 'Unauthorized - No valid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      console.error('Auth validation failed:', error?.message);
      return {
        data: null,
        error: new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      };
    }

    return {
      data: {
        userId: data.user.id,
        email: data.user.email
      },
      error: null
    };
  } catch (err) {
    console.error('Auth validation error:', err);
    return {
      data: null,
      error: new Response(
        JSON.stringify({ error: 'Unauthorized - Token validation failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }
}

/**
 * Creates a Supabase client with service role key for admin operations
 */
export function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, serviceRoleKey);
}
