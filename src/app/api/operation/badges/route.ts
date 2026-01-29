import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const badges = (data || []).map((b: any) => ({ ...b, worker_count: 0 }));

    return NextResponse.json({ badges });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not fetch badges' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      description: body.description || null,
      color: body.color || '#22c55e',
    };

    const { data, error } = await supabaseServer.from('badges').insert(payload).select().single();
    if (error) throw error;

    return NextResponse.json({ badge: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not create badge' }, { status: 500 });
  }
}
