import { NextRequest } from 'next/server';
import { getUserFromAuthHeader } from '../../../../lib/getUserFromAuthHeader';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? undefined;
    const { user, error: uErr } = await getUserFromAuthHeader(auth);
    if (uErr || !user) return error('UNAUTHORIZED', 'Invalid token', null, 401);

    // Invalidate sessions for this user (service role required)
    // Supabase admin API: invalidateUserSessions(userId)
    // @ts-ignore
    const { error: invErr } = await supabaseServer.auth.admin.invalidateUserSessions(user.id);
    if (invErr) return error('INTERNAL_ERROR', 'Failed to logout', invErr, 500);

    return success({ logged_out: true }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
