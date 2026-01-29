import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data: stores, error: storesErr } = await supabaseServer.from('stores').select('*');
    if (storesErr)
      return NextResponse.json({ error: storesErr.message || String(storesErr) }, { status: 500 });

    const { data: cats } = await supabaseServer.from('store_categories').select('*');

    return NextResponse.json({ stores: stores ?? [], categories: cats ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, categories, location, phone, is_open } = body;
    const payload = { name, description, categories, location, phone, is_open };
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email: body.owner_email,
      password: body.owner_password,
      email_confirm: true,
      user_metadata: {
        name: body.owner_name ?? null,
        phone: body.owner_phone ?? null,
        role: 'store_owner',
      },
    });

    if (authError) throw authError;
    let owner_id = authData?.user.id;
    const { data, error } = await supabaseServer
      .from('stores')
      .insert({ ...payload, owner_id })
      .select()
      .limit(1)
      .single();
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    return NextResponse.json({ store: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
