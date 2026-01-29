import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await supabaseServer
      .from('chats')
      .select('*')
      .range(from, to)
      .order('updated_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch chats', supaErr, 500);

    return success({ chats: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
