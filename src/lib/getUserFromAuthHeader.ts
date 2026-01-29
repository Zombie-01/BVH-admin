import supabaseServer from './supabaseServer';

export async function getUserFromAuthHeader(authorization?: string) {
  if (!authorization) return { user: null, error: 'No authorization header' };
  const m = authorization.match(/^Bearer\s+(.+)$/i);
  if (!m) return { user: null, error: 'Invalid authorization header' };
  const token = m[1];

  try {
    // Try to get user by access token
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error) return { user: null, error };
    return { user: data?.user ?? null, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}
