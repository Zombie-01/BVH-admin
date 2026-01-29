import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error: supaErr } = await supabaseServer
      .from('delivery_tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (supaErr) return error('NOT_FOUND', 'Task not found', supaErr, 404);
    return success({ task: data }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const action = body.action;

    if (!action) return error('VALIDATION_ERROR', 'Action required', null, 400);

    if (action === 'accept') {
      const { driver_id } = body;
      const { data, error: supaErr } = await supabaseServer
        .from('delivery_tasks')
        .update({ driver_id, status: 'assigned' })
        .eq('id', id)
        .select();
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to accept task', supaErr, 500);
      return success({ task: data && data[0] }, 200);
    }

    if (action === 'pickup') {
      const { data, error: supaErr } = await supabaseServer
        .from('delivery_tasks')
        .update({ status: 'picked_up', updated_at: new Date() })
        .eq('id', id)
        .select();
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to mark pickup', supaErr, 500);
      return success({ task: data && data[0] }, 200);
    }

    if (action === 'deliver') {
      const { delivery_photo, signature, notes } = body;
      const { data, error: supaErr } = await supabaseServer
        .from('delivery_tasks')
        .update({ status: 'delivered', updated_at: new Date() })
        .eq('id', id)
        .select();
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to mark delivered', supaErr, 500);
      return success({ task: data && data[0] }, 200);
    }

    if (action === 'location') {
      const { lat, lng } = body;
      if (lat == null || lng == null)
        return error('VALIDATION_ERROR', 'lat/lng required', null, 400);
      const { data, error: supaErr } = await supabaseServer
        .from('delivery_tasks')
        .update({ updated_at: new Date() })
        .eq('id', id)
        .select();
      if (supaErr) return error('INTERNAL_ERROR', 'Failed to update location', supaErr, 500);
      return success({ task: data && data[0] }, 200);
    }

    return error('VALIDATION_ERROR', 'Unknown action', null, 400);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
