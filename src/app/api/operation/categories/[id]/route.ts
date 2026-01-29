import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const payload = {
      name: body.name,
      description: body.description || null,
      icon: body.icon || null,
    };

    const { data, error } = await supabaseServer
      .from('store_categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Could not update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { error } = await supabaseServer.from('store_categories').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Could not delete category' },
      { status: 500 }
    );
  }
}
