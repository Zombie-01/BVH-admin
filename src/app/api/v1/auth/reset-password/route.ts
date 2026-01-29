import { NextRequest } from 'next/server';
import { error, success } from '../../../../lib/apiResponse';
import supabaseServer from '../../../../lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { access_token, password } = await req.json();
    if (!access_token || !password)
      return error('VALIDATION_ERROR', 'Missing token or password', null, 400);

    try {
      // @ts-ignore
      const { data, error: supaErr } = await supabaseServer.auth.updateUser(access_token, {
        password,
      });
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to reset password', supaErr, 500);
      return success({ updated: true }, 200);
    } catch (e) {
      return error(
        'NOT_IMPLEMENTED',
        'Reset password flow depends on Supabase client implementation; handle via Supabase Auth flows.',
        null,
        501
      );
    }
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
