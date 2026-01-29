import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query: any = supabaseServer.from('delivery_tasks').select('*');
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch delivery tasks', supaErr, 500);

    return success({ tasks: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
