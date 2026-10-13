import { createClient } from '@supabase/supabase-js';

/** Validate the bearer token with Auth, then read the role from the database. */
export async function authorizeAdmin(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(503).json({ error: 'Server authentication is not configured.' });
    return null;
  }
  const authorization = req.headers?.authorization;
  const token = typeof authorization === 'string' ? authorization.match(/^Bearer\s+(\S+)$/i)?.[1] : null;
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error } = await client.auth.getUser(token);
  if (error || !identity.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
  const { data: profile, error: profileError } = await client.from('profiles')
    .select('role, status').eq('id', identity.user.id).maybeSingle();
  if (profileError) {
    res.status(503).json({ error: 'Unable to verify permissions.' });
    return null;
  }
  if (!identity.user.email_confirmed_at || !profile || !['admin', 'super_admin'].includes(profile.role)
    || (profile.status && profile.status !== 'active')) {
    res.status(403).json({ error: 'Verified administrator access required.' });
    return null;
  }
  return { client, user: identity.user };
}
