import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from('service_workers').select('*');
    if (error) return NextResponse.json({ error: error.message || String(error) }, { status: 500 });

    return NextResponse.json({ workers: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const created: {
    auth: null | { id: string };
    profile: null | any;
  } = { auth: null, profile: null };

  try {
    const body = await req.json();

    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 1) Optionally create a Supabase auth user when email is provided
    if (body.profile_email) {
      const email = String(body.profile_email).toLowerCase();
      const password = 'ChangeMe123!';

      const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: body.profile?.name ?? null,
          phone: body.profile?.phone ?? null,
          role: body?.specialty === 'driver' ? 'driver' : 'service_worker',
        },
      });

      if (authError || !authData?.user) {
        return NextResponse.json(
          { error: authError?.message || 'Failed to create auth user' },
          { status: 500 }
        );
      }

      created.auth = { id: authData.user.id };
    }

    // ensure id exists to avoid NOT NULL violations

    // 3) Create the service_worker record
    const payload = {
      profile_id: created.auth?.id || null,
      specialty: body.specialty || null,
      description: body.description || null,
      hourly_rate: body.hourly_rate ?? null,
      badges: body.badges || [],
      rating: body.rating ?? 0,
      completed_jobs: body.completed_jobs ?? 0,
      is_available: body.is_available ?? true,
    };

    const { data, error } = await supabaseServer
      .from('service_workers')
      .insert(payload)
      .select('*, profiles(id)')
      .single();

    if (error) {
      // rollback profile and auth user if created
      if (created.profile?.id) {
        await supabaseServer.from('profiles').delete().eq('id', created.profile.id);
      }
      if (created.auth?.id) {
        await supabaseServer.auth.admin.deleteUser(created.auth.id).catch(() => null);
      }

      return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }

    // Success
    return NextResponse.json({ worker: data }, { status: 201 });
  } catch (err: any) {
    // Unexpected error: attempt cleanup
    if (created.profile?.id) {
      await supabaseServer.from('profiles').delete().eq('id', created.profile.id);
    }
    if (created.auth?.id) {
      await supabaseServer.auth.admin.deleteUser(created.auth.id).catch(() => null);
    }

    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
