import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query: any = supabaseServer.from('orders').select('*, order_items(*)');
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch orders', supaErr, 500);

    return success({ orders: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      store_id,
      items,
      delivery_address,
      delivery_lat,
      delivery_lng,
      customer_name,
      customer_phone,
      notes,
    } = payload;
    if (!store_id || !items || !Array.isArray(items) || items.length === 0)
      return error('VALIDATION_ERROR', 'Invalid order payload', null, 400);

    const orderPayload = {
      store_id,
      delivery_address,
      delivery_lat,
      delivery_lng,
      customer_name,
      customer_phone,
      notes,
      status: 'pending',
    };
    const { data: orderData, error: orderErr } = await supabaseServer
      .from('orders')
      .insert([orderPayload])
      .select();
    if (orderErr) return error('INTERNAL_ERROR', 'Failed to create order', orderErr, 500);

    const order = orderData && orderData[0];
    const itemsToInsert = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product_name ?? '',
      quantity: it.quantity,
      price: it.price ?? 0,
      image: it.image ?? null,
    }));

    const { data: itemsData, error: itemsErr } = await supabaseServer
      .from('order_items')
      .insert(itemsToInsert)
      .select();
    if (itemsErr) return error('INTERNAL_ERROR', 'Failed to insert order items', itemsErr, 500);

    return success({ order: { ...order, items: itemsData } }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
