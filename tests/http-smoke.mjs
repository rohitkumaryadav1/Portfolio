// Run against the isolated visual fixture-backed app, not a production deployment.
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:3000';
for (const [path, options, status] of [
  ['/', {}, 200],
  ['/projects/00000000-0000-4000-8000-000000000004', {}, 200],
  ['/admin', { redirect: 'manual' }, 307],
  [
    '/api/admin/projects',
    { method: 'POST', headers: { origin: base, 'content-type': 'application/json' }, body: '{}' },
    401,
  ],
  [
    '/api/admin/projects',
    {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      body: '{}',
    },
    403,
  ],
  ['/api/admin/upload', { method: 'POST', headers: { origin: base } }, 401],
  ['/api/admin/resume', { method: 'POST', headers: { origin: base } }, 401],
]) {
  const res = await fetch(base + path, options);
  assert.equal(res.status, status, path);
  console.log(`PASS ${path}: ${res.status}`);
}
const missing = await fetch(base + '/projects/missing');
const html = await missing.text();
// Next.js streamed notFound responses may already have HTTP 200 headers; noindex is authoritative.
assert.match(html, /404 \/ NOT FOUND/);
assert.match(html, /noindex/);
console.log('PASS missing project: not-found UI and noindex');
for (const download of [false, true]) {
  const res = await fetch(base + '/api/resume' + (download ? '?download=1' : ''));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.match(res.headers.get('content-disposition'), download ? /attachment/ : /inline/);
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-');
}
console.log('PASS resume open/download response headers and PDF bytes');
