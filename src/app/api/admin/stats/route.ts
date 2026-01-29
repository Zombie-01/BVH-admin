import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    // users
    const usersList = await supabaseServer.auth.admin.listUsers();
    const users = usersList.data?.users || [];
    const totalUsers = users.length;
    const adminUsers = users.filter(
      (u: any) => (u.app_metadata?.role || 'user') === 'admin'
    ).length;
    const operationUsers = users.filter(
      (u: any) => (u.app_metadata?.role || '') === 'operation'
    ).length;
    const activeUsers = users.filter((u: any) => !u.disabled).length;

    // orders count and revenue (best-effort)
    let totalOrders = 0;
    let totalRevenue = 0;
    try {
      const { data: orders } = await supabaseServer.from('orders').select('id,total_amount');
      if (Array.isArray(orders)) {
        totalOrders = orders.length;
        totalRevenue = orders.reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0);
      }
    } catch (e) {
      // table may not exist
    }

    // stores count (best-effort)
    let totalStores = 0;
    try {
      const { data: stores } = await supabaseServer.from('stores').select('id');
      if (Array.isArray(stores)) totalStores = stores.length;
    } catch (e) {}

    return NextResponse.json({
      totalUsers,
      adminUsers,
      operationUsers,
      activeUsers,
      totalOrders,
      totalRevenue,
      totalStores,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
