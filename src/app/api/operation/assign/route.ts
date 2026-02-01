import { NextRequest } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';
import { success, error } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, workerId } = body ?? {};
    if (!orderId || !workerId)
      return error('VALIDATION_ERROR', 'orderId and workerId are required', null, 400);

    // verify order exists
    const { data: orderData, error: orderErr } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (orderErr || !orderData) return error('NOT_FOUND', 'Order not found', orderErr, 404);
    if (orderData.status !== 'pending') {
      return error('INVALID_STATE', 'Order must be in pending state to assign', null, 400);
    }

    // fetch worker
    const { data: workerData, error: workerErr } = await supabaseServer
      .from('service_workers')
      .select('*, profiles(*)')
      .eq('id', workerId)
      .single();
    if (workerErr || !workerData) return error('NOT_FOUND', 'Worker not found', workerErr, 404);
    if (!workerData.is_available)
      return error('INVALID_STATE', 'Worker is not available', null, 400);

    // perform updates
    const updates = await Promise.allSettled([
      supabaseServer
        .from('orders')
        .update({
          worker_id: workerId,
          worker_name: workerData.profile?.name ?? workerData.profile_name ?? null,
          status: 'confirmed',
        })
        .eq('id', orderId)
        .select(),
      supabaseServer
        .from('service_workers')
        .update({ is_available: false, current_task: `Order #${orderId}` })
        .eq('id', workerId)
        .select(),
    ]);

    const orderUpd = updates[0] as PromiseFulfilledResult<any> | PromiseRejectedResult;
    const workerUpd = updates[1] as PromiseFulfilledResult<any> | PromiseRejectedResult;

    if ('status' in orderUpd && orderUpd.status === 'rejected') {
      return error('INTERNAL_ERROR', 'Failed to assign order', (orderUpd as any).reason, 500);
    }
    if ('status' in workerUpd && workerUpd.status === 'rejected') {
      return error('INTERNAL_ERROR', 'Failed to update worker', (workerUpd as any).reason, 500);
    }

    return success(
      { order: (orderUpd as any).value.data?.[0], worker: (workerUpd as any).value.data?.[0] },
      200
    );
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
