import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.26.0/+esm';

const NEXT_PUBLIC_SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')!;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY in function env'
  );
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

serve(async () => {
  try {
    const [{ data: orders }, { data: stores }, { data: products }, { data: serviceJobs }] =
      await Promise.all([
        supabase.from('orders').select('id,total_amount,status,created_at'),
        supabase.from('stores').select('id,name,rating,review_count,location,created_at'),
        supabase.from('products').select('id,name,price,created_at'),
        supabase.from('service_jobs').select('id,status,quoted_price,created_at'),
      ]);

    const totalRevenue = (orders ?? []).reduce(
      (s: number, o: any) => s + Number(o.total_amount ?? 0),
      0
    );
    const orderCount = (orders ?? []).length;
    const avgRating = (stores ?? []).length
      ? (stores ?? []).reduce((s: number, st: any) => s + Number(st.rating ?? 0), 0) /
        (stores ?? []).length
      : 0;
    const completedJobs = (serviceJobs ?? []).filter((j: any) => j.status === 'completed').length;
    const jobEfficiency = (serviceJobs ?? []).length
      ? Math.round((completedJobs / (serviceJobs ?? []).length) * 100 * 10) / 10
      : 0;

    return new Response(
      JSON.stringify({
        orders: orders ?? [],
        stores: stores ?? [],
        products: products ?? [],
        serviceJobs: serviceJobs ?? [],
        metrics: {
          totalRevenue,
          orderCount,
          avgRating,
          jobEfficiency,
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
