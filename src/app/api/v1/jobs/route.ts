import { NextRequest } from 'next/server';
import supabaseServer from '../../../../lib/supabaseServer';
import { success, error } from '../../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let query: any = supabaseServer.from('service_jobs').select('*');
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: supaErr } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to fetch jobs', supaErr, 500);

    return success({ jobs: data ?? [], page, limit });
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { user_id, worker_id, description } = payload;
    if (!user_id || !description)
      return error('VALIDATION_ERROR', 'Missing required fields', null, 400);

    const { data, error: supaErr } = await supabaseServer
      .from('service_jobs')
      .insert([{ user_id, worker_id: worker_id ?? null, description }])
      .select();
    if (supaErr) return error('INTERNAL_ERROR', 'Failed to create job', supaErr, 500);

    return success({ job: data && data[0] }, 201);
  } catch (err: any) {
    return error('INTERNAL_ERROR', 'Unexpected error', err?.message ?? err, 500);
  }
}
