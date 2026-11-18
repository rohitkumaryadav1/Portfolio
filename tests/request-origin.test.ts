import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSameOrigin } from '../src/lib/request-origin';
test('origin checks support local host aliases and reject foreign or missing origins', () => {
  assert.equal(
    isSameOrigin(
      new Request('http://localhost:3000/api/admin/projects', {
        headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' },
      }),
    ),
    true,
  );
  for (const origin of [
    'https://evil.example',
    'null',
    'https://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ])
    assert.equal(
      isSameOrigin(
        new Request('http://localhost:3000/api/admin/projects', {
          headers: { host: '127.0.0.1:3000', origin },
        }),
      ),
      false,
    );
  assert.equal(isSameOrigin(new Request('http://localhost:3000/api/admin/projects')), false);
});
