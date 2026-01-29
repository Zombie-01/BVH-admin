import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone, role } = body;

    if (!email || !password) {
      return error('VALIDATION_ERROR', 'Email and password are required', null, 400);
    }

    const { data, error: supaErr } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, phone, role },
    });

    if (supaErr) return error('INTERNAL_ERROR', 'Failed to create user', supaErr, 500);

    return success({ user: data?.user ?? null }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
