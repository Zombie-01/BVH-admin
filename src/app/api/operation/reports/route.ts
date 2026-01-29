import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

function lastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export async function GET() {
  try {
    // Orders time series for last 7 days
    let reportData: Array<any> = [];
    try {
      const days = lastNDays(7);
      const { data: orders } = await supabaseServer
        .from('orders')
        .select('id,total_amount,type,created_at');
      reportData = days.map((d) => {
        const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
        const dayOrders = (orders || []).filter((o: any) => {
          const od = new Date(o.created_at);
          return (
            od.getDate() === d.getDate() &&
            od.getMonth() === d.getMonth() &&
            od.getFullYear() === d.getFullYear()
          );
        });
        return {
          date: dayStr,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0),
          deliveries: dayOrders.filter((o: any) => o.type === 'delivery').length,
          services: dayOrders.filter((o: any) => o.type === 'service').length,
        };
      });
    } catch (e) {
      // ignore
    }

    // Recent orders
    let recentOrders: Array<any> = [];
    try {
      const { data: ro } = await supabaseServer
        .from('orders')
        .select('id,user_id,total_amount,store_id,worker_id,type,status,created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      recentOrders = ro || [];
    } catch (e) {}

    // Product sales (group by product name if table exists)
    let productSales: Array<any> = [];
    try {
      const { data: ps } = await supabaseServer.from('product_sales').select('name,sales,revenue');
      productSales = ps || [];
    } catch (e) {
      // fallback: empty
    }

    // basic stats
    let stats: any = {};
    try {
      const usersList = await supabaseServer.auth.admin.listUsers();
      const { data: ordersAll } = await supabaseServer.from('orders').select('id,total_amount');
      stats.totalOrders = ordersAll?.length || 0;
      stats.totalRevenue =
        ordersAll?.reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0) || 0;
    } catch (e) {
      stats = { totalOrders: 0, totalRevenue: 0 };
    }

    return NextResponse.json({ reportData, recentOrders, productSales, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
