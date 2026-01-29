import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../../../lib/supabaseServer';
import { success, error } from '../../../../../../../lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const storeId = params.storeId;
    const url = req.nextUrl;
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query: any = supabaseServer.from('products').select('*').eq('store_id', storeId);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch products', supaErr, 500);

    return success({ products: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const storeId = params.storeId;
    const payload = await req.json();
    const { name, description, price, category, in_stock, stock_quantity, unit, specifications } =
      payload;
    if (!name || price == null)
      return error('VALIDATION_ERROR', 'Missing product name or price', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('products')
      .insert([
        {
          store_id: storeId,
          name,
          description,
          price,
          category,
          in_stock,
          stock_quantity,
          unit,
          specifications,
        },
      ])
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to create product', supaErr, 500);

    return success({ product: data && data[0] }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
