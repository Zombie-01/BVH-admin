import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error: supaErr } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (supaErr) return error('NOT_FOUND', 'Order not found', supaErr, 404);
    return success({ order: data }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const payload = await req.json();
    if (payload.status) {
      const { data, error: supaErr } = await supabaseServer
        .from('orders')
        .update({ status: payload.status })
        .eq('id', id)
        .select();
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to update order', supaErr, 500);
      return success({ order: data && data[0] }, 200);
    }
    return error('VALIDATION_ERROR', 'No updatable fields provided', null, 400);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
