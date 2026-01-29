import { NextResponse } from 'next/server';

const defaultRateLimitHeaders = {
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '100',
  'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + 60 * 60}`,
};

export function success(data: any, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json({ data }, { status, headers: { ...defaultRateLimitHeaders, ...headers } });
}

export function error(code: string, message: string, details: any = null, status = 500, headers: Record<string, string> = {}) {
  return NextResponse.json({ error: { code, message, details } }, { status, headers: { ...defaultRateLimitHeaders, ...headers } });
}
