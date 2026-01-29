import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query = supabaseServer.from('stores').select('*');
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch stores', supaErr, 500);

    const { count } = await supabaseServer.from('stores').select('id', { count: 'exact' });

    return success({ stores: data ?? [], total: Number(count ?? 0), page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, owner_id, category, location, phone } = body;
    if (!name || !owner_id) return error('VALIDATION_ERROR', 'Missing required fields', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('stores')
      .insert([{ name, description, owner_id, category, location, phone }])
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to create store', supaErr, 500);

    return success({ store: (data && data[0]) ?? null }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
