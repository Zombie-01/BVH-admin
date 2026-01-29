import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../lib/supabaseServer';
import { success, error } from '../../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || 'month';

    // Simple aggregation: count delivered tasks and estimate earnings if `earnings` field exists
    const { data: delivered, error: dErr } = await supabaseServer
      .from('delivery_tasks')
      .select('id,driver_id,created_at')
      .eq('status', 'delivered');
    if (dErr) return error('INTERNAL_ERROR', 'Failed to fetch deliveries', dErr, 500);

    const totalDeliveries = (delivered ?? []).length;
    const totalEarnings = 0; // Placeholder: compute from related charges if available

    return success(
      {
        total_earnings: totalEarnings,
        completed_deliveries: totalDeliveries,
        average_per_delivery: totalDeliveries ? totalEarnings / totalDeliveries : 0,
      },
      200
    );
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
