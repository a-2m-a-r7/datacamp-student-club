import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAdmin } from '../api/_lib/authorize';

const user = { id: '00000000-0000-4000-8000-000000000002', email: 'QA_TEST_admin@example.invalid', email_confirmed_at: '2026-10-13T00:00:00Z' };
test('server authorization rejects visitor, member, expired token and unverified administrator', async () => {
  const originalFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL; const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = 'https://qa-test.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'QA_TEST_SERVER';
  let role = 'user'; let valid = true; let verified = true; let requests = 0;
  globalThis.fetch = async (input: any) => {
    requests++; const url = String(input);
    return new Response(JSON.stringify(url.includes('/auth/v1/user')
      ? valid ? { ...user, email_confirmed_at: verified ? user.email_confirmed_at : null } : { message: 'Invalid token' }
      : [{ role, status: 'active' }]), { status: url.includes('/auth/') && !valid ? 401 : 200, headers: { 'Content-Type': 'application/json' } });
  };
  const response = () => ({ code: 0, payload: null as any, setHeader() {}, status(code: number) { this.code = code; return this; }, json(payload: any) { this.payload = payload; return this; } });
  try {
    let res = response(); assert.equal(await authorizeAdmin({ headers: {} }, res), null); assert.equal(res.code, 401); assert.equal(requests, 0);
    res = response(); assert.equal(await authorizeAdmin({ headers: { authorization: 'Bearer QA_TEST' } }, res), null); assert.equal(res.code, 403);
    valid = false; res = response(); assert.equal(await authorizeAdmin({ headers: { authorization: 'Bearer QA_TEST' } }, res), null); assert.equal(res.code, 401);
    valid = true; role = 'admin'; verified = false; res = response(); assert.equal(await authorizeAdmin({ headers: { authorization: 'Bearer QA_TEST' } }, res), null); assert.equal(res.code, 403);
    verified = true; res = response(); assert.ok(await authorizeAdmin({ headers: { authorization: 'Bearer QA_TEST' } }, res));
  } finally {
    globalThis.fetch = originalFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
  }
});
