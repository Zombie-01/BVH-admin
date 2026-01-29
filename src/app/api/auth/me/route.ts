import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  try {
    const token = (await cookies()).get('sb-access-token')?.value;
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
