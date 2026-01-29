import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return error('VALIDATION_ERROR', 'Missing credentials', null, 400);

    const { data, error: supaErr } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (supaErr) return error('UNAUTHORIZED', 'Invalid credentials', supaErr, 401);

    return success({ session: data }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
