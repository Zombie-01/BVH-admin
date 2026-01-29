import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const payload = {
      name: body.name,
      description: body.description || null,
      color: body.color || '#22c55e',
    };

    const { data, error } = await supabaseServer
      .from('badges')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ badge: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not update badge' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { error } = await supabaseServer.from('badges').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not delete badge' }, { status: 500 });
  }
}
