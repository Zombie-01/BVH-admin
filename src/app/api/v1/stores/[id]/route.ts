import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error: supaErr } = await supabaseServer
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    if (supaErr) return error('NOT_FOUND', 'Store not found', supaErr, 404);
    return success({ store: data }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { data, error: supaErr } = await supabaseServer
      .from('stores')
      .update(body)
      .eq('id', id)
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to update store', supaErr, 500);
    return success({ store: data && data[0] }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { error: supaErr } = await supabaseServer.from('stores').delete().eq('id', id);
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to delete store', supaErr, 500);
    return success({ deleted: true }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
