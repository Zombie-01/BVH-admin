import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    // List auth users (admin)
    const list = await supabaseServer.auth.admin.listUsers();
    const users = list.data?.users || [];

    // Try to fetch profiles table to enrich users (optional)
    let profilesMap: Record<string, any> = {};
    try {
      const { data: profiles } = await supabaseServer.from('profiles').select('id,full_name,role');
      if (Array.isArray(profiles)) {
        profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
      }
    } catch (e) {
      // ignore if profiles table missing
    }

    const normalized = users.map((u: any) => {
      const profile = profilesMap[u.id] || {};
      return {
        id: u.id,
        name: profile.full_name || u.user_metadata?.full_name || u.email || 'Unknown',
        email: u.email,
        role: profile.role || u.app_metadata?.role || 'user',
        status: u.disabled ? 'inactive' : 'active',
        created_at: u.created_at,
        last_login: u.last_sign_in_at ?? null,
      };
    });

    return NextResponse.json({ users: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
