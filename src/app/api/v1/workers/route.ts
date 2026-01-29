import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const specialty = url.searchParams.get('specialty');
    const available = url.searchParams.get('available');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query: any = supabaseServer.from('service_workers').select('*');
    if (specialty) query = query.ilike('specialty', `%${specialty}%`);
    if (available != null) query = query.eq('is_available', available === 'true');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch workers', supaErr, 500);

    return success({ workers: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
