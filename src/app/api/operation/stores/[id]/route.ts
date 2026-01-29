import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { data, error } = await supabaseServer
      .from('stores')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    return NextResponse.json({ store: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error } = await supabaseServer.from('stores').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
