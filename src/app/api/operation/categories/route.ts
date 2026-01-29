import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('store_categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add store_count if possible (best-effort)
    const categories = (data || []).map((c: any) => ({ ...c, store_count: 0 }));

    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Could not fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      description: body.description || null,
      icon: body.icon || null,
    };

    const { data, error } = await supabaseServer
      .from('store_categories')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Could not create category' },
      { status: 500 }
    );
  }
}
