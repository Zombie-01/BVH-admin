import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabaseServer from './src/lib/supabaseServer';

const PUBLIC_FILE = /^\/(_next|api|static|favicon.ico|login)/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }

    // valid session - allow
    return NextResponse.next();
  } catch (err) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Apply to all routes under / (we early-exit for public paths)
  matcher: '/((?!_next|static|favicon.ico|api|login).*)',
};
