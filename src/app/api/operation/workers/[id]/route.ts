import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    // If profile payload included, create or update profile and attach
    let profileId = body.profile_id ?? null;
    if (body.profile && typeof body.profile === 'object') {
      const prof = body.profile as any;
      if (prof.id) {
        // update existing profile
        const { data: updated, error: upErr } = await supabaseServer
          .from('profiles')
          .update({
            name: prof.name ?? undefined,
            phone: prof.phone ?? undefined,
            role: prof.role ?? undefined,
            avatar: prof.avatar ?? undefined,
            vehicle_type: prof.vehicle_type ?? undefined,
          })
          .eq('id', prof.id)
          .select()
          .single();
        if (upErr)
          return NextResponse.json({ error: upErr.message || String(upErr) }, { status: 500 });
        profileId = (updated as any).id;
      } else if (prof.phone) {
        // try find by phone
        const { data: existing, error: findErr } = await supabaseServer
          .from('profiles')
          .select('id')
          .eq('phone', prof.phone)
          .limit(1)
          .maybeSingle();
        if (findErr)
          return NextResponse.json({ error: findErr.message || String(findErr) }, { status: 500 });
        if (existing && (existing as any).id) {
          // optionally update
          const { data: updated, error: upErr } = await supabaseServer
            .from('profiles')
            .update({
              name: prof.name ?? undefined,
              role: prof.role ?? undefined,
              avatar: prof.avatar ?? undefined,
            })
            .eq('id', (existing as any).id)
            .select()
            .single();
          if (upErr)
            return NextResponse.json({ error: upErr.message || String(upErr) }, { status: 500 });
          profileId = (updated as any).id;
        } else {
          const { data: newProfile, error: pErr } = await supabaseServer
            .from('profiles')
            .insert({
              name: prof.name || null,
              phone: prof.phone || null,
              role: prof.role || 'service_worker',
            })
            .select()
            .single();
          if (pErr)
            return NextResponse.json({ error: pErr.message || String(pErr) }, { status: 500 });
          profileId = (newProfile as any).id;
        }
      }
    }

    const payload: any = {
      profile_id: profileId ?? null,
      profile_name: body.profile_name,
      specialty: body.specialty || null,
      description: body.description || null,
      hourly_rate: body.hourly_rate ?? null,
      badges: body.badges || [],
      is_available: body.is_available ?? true,
    };

    const { data, error } = await supabaseServer
      .from('service_workers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });

    return NextResponse.json({ worker: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { error } = await supabaseServer.from('service_workers').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
