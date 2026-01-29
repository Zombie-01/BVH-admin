import { NextRequest } from 'next/server';
import { getUserFromAuthHeader } from '../../../../../lib/getUserFromAuthHeader';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? undefined;
    const { user, error: uErr } = await getUserFromAuthHeader(auth);
    if (uErr || !user) return error('UNAUTHORIZED', 'Invalid token', null, 401);

    const { data, error: supaErr } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (supaErr) return error('NOT_FOUND', 'Profile not found', supaErr, 404);

    return success({ profile: data }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? undefined;
    const { user, error: uErr } = await getUserFromAuthHeader(auth);
    if (uErr || !user) return error('UNAUTHORIZED', 'Invalid token', null, 401);

    const payload = await req.json();
    const { data, error: supaErr } = await supabaseServer
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to update profile', supaErr, 500);

    return success({ profile: data && data[0] }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
