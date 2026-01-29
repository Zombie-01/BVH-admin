import { NextRequest } from 'next/server';
import supabaseServer from '../../../../../../lib/supabaseServer';
import { success, error } from '../../../../../../lib/apiResponse';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { quoted_price, worker_id } = await req.json();
    if (quoted_price == null || !worker_id)
      return error('VALIDATION_ERROR', 'Missing quoted_price or worker_id', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('service_jobs')
      .update({ quoted_price, worker_id, status: 'quoted' })
      .eq('id', id)
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to submit quote', supaErr, 500);

    return success({ job: data && data[0] }, 200);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
