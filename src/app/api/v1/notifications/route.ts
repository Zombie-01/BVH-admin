import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    // Try reading from a `notifications` table if present
    const url = req.nextUrl;
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await supabaseServer
      .from('notifications')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) {
      // If table doesn't exist, return empty list
      return success({ notifications: [], page, limit }, 200);
    }
    return success({ notifications: data ?? [], page, limit }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();
    const { id, mark_read } = payload;
    if (!id) return error('VALIDATION_ERROR', 'id required', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('notifications')
      .update({ read: !!mark_read })
      .eq('id', id)
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to update notification', supaErr, 500);
    return success({ notification: data && data[0] }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
