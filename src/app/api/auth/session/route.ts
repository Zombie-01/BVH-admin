import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

const isProd = process.env.NODE_ENV === 'production';
const secureFlag = isProd ? '; Secure' : '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const access_token = body?.access_token;
    if (!access_token) return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });

    const { data, error } = await supabaseServer.auth.getUser(access_token);
    if (error || !data?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Set httpOnly cookie with the access token
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const cookie = `sb-access-token=${access_token}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=${maxAge}`;

    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const isProd2 = process.env.NODE_ENV === 'production';
  const secure2 = isProd2 ? '; Secure' : '';
  const cookie = `sb-access-token=; Path=/; HttpOnly${secure2}; SameSite=Lax; Max-Age=0`;
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } });
}
