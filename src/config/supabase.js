import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Ensure base URL does not have trailing slashes or /rest/v1 paths
const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn('[WARN] [SUPABASE] Missing SUPABASE_URL in .env');
}

/**
 * 1. Admin Client (Service Role Key)
 * Bypasses Row-Level Security (RLS) - Use for trusted backend operations,
 * user management, and server-side database tasks.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * 2. Public / Client-scoped Client (Anon Key)
 * Enforces Row-Level Security (RLS) - Use when operating on behalf of standard users.
 */
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Test connectivity to Supabase
 */
export const testSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
      return { ok: false, message: 'Supabase credentials not configured' };
    }

    // Ping Supabase Auth to verify API key validity
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      // Fallback check if service role key isn't permitted for listUsers
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
    }

    return { ok: true, message: 'Supabase connected successfully' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
