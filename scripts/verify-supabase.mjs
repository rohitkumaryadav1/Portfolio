// Read-only hosted checks. Never requires a database password or secret key.
// node --env-file=.env.local scripts/verify-supabase.mjs
import assert from 'node:assert/strict';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key, 'Configure the URL and publishable key in .env.local.');
assert.ok(url.startsWith('https://'), 'Use the hosted HTTPS project URL.');
const headers = { apikey: key, 'content-type': 'application/json' };
async function request(path, options = {}) {
  const response = await fetch(url + path, { ...options, headers });
  return { response, body: await response.json() };
}
for (const table of ['profile', 'projects', 'experiences', 'skills', 'education', 'interests', 'site_settings']) {
  const { response, body } = await request(`/rest/v1/${table}?select=id,published`);
  assert.equal(response.status, 200, `${table} must exist and allow published reads`);
  assert.ok(Array.isArray(body));
  assert.ok(body.every(row => row.published === true), `${table} exposed a draft`);
  console.log(`PASS ${table}: ${body.length} published rows`);
}
const role = await request('/rest/v1/rpc/is_admin', { method: 'POST', body: '{}' });
assert.equal(role.response.status, 200);
assert.equal(role.body, false, 'Anonymous callers must not be administrators');
const allowlist = await request('/rest/v1/admin_users?select=user_id');
assert.ok([401, 403].includes(allowlist.response.status), 'The admin allowlist must be private');
const auth = await request('/auth/v1/settings');
assert.equal(auth.response.status, 200);
assert.equal(auth.body.disable_signup, true, 'Disable public signups in Authentication settings');
assert.equal(auth.body.external.email, true, 'Keep email sign-in enabled');
console.log('PASS anonymous role, private allowlist, disabled signups, email authentication');
console.log('Admin login/CRUD and initial asset uploads require the owner-created Auth account.');
