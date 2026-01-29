import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
if (!supabaseServiceRoleKey)
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY environment variable');

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export default supabaseServer;
