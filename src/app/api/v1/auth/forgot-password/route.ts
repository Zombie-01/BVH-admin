import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { error, success } from '../../../../../lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return error('VALIDATION_ERROR', 'Missing email', null, 400);

    // Use Supabase's built-in password reset email if available
    try {
      // supabase-js v2 exposes `auth.resetPasswordForEmail` on client; server SDK may differ.
      // Attempt call; if SDK doesn't support, return guidance.
      // @ts-ignore
      const { data, error: supaErr } = await supabaseServer.auth.resetPasswordForEmail(email);
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to send reset email', supaErr, 500);
      return success({ sent: true }, 200);
    } catch (e) {
      return error(
        'NOT_IMPLEMENTED',
        'Password reset via Supabase client not supported in this environment. Use Supabase Auth or implement your own email flow.',
        null,
        501
      );
    }
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
