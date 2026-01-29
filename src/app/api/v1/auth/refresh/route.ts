import { NextRequest } from 'next/server';
import { error, success } from '../../../../../lib/apiResponse';
import supabaseServer from '../../../../../lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) return error('VALIDATION_ERROR', 'Missing refresh_token', null, 400);

    // Supabase recommends handling refresh on the client with anon key; server-side flows vary.
    // Here we'll attempt to use the server client to exchange refresh token.
    // Note: behavior depends on Supabase SDK; if not supported, return 501 with guidance.
    try {
      // @ts-ignore
      const { data, error: rErr } = await supabaseServer.auth.refreshSession({ refresh_token });
      if (rErr) return error('INTERNAL_ERROR', 'Failed to refresh token', rErr, 500);
      return success({ session: data }, 200);
    } catch (e) {
      return error(
        'NOT_IMPLEMENTED',
        'Refresh token flow not supported on server client. Use client-side refresh with anon key or implement on auth server.',
        null,
        501
      );
    }
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
