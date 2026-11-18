import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schemas, defaults, envelope, isTable } from '../src/lib/content';
test('rejects unknown tables and unsafe outbound URLs', () => {
  assert.equal(isTable('admin_users'), false);
  assert.equal(isTable('projects'), true);
  for (const github of ['javascript:alert(1)', 'http://example.com', 'data:text/html,test'])
    assert.equal(
      schemas.projects.safeParse({ ...defaults.projects, title: 'Test', github }).success,
      false,
    );
});
test('rejects invalid project dates and invalid storage paths', () => {
  assert.equal(
    schemas.projects.safeParse({
      ...defaults.projects,
      title: 'Test',
      start_date: '2026-12-01',
      completion_date: '2026-11-01',
    }).success,
    false,
  );
  for (const image of ['../../secret.png', 'https://example.com/photo.png', 'uploads/photo.svg'])
    assert.equal(
      schemas.profile.safeParse({
        ...defaults.profile,
        name: 'Rohit',
        headline: 'Student',
        email: 'rohit@example.com',
        image,
      }).success,
      false,
    );
});
test('publication and ordering are explicit and bounded', () => {
  assert.equal(
    envelope.safeParse({ data: {}, published: 'true', display_order: 0 }).success,
    false,
  );
  assert.equal(
    envelope.safeParse({ data: {}, published: false, display_order: -1 }).success,
    false,
  );
  assert.equal(envelope.safeParse({ data: {}, published: false, display_order: 3 }).success, true);
});
test('accepts in-progress projects without inventing dates or links', () => {
  assert.equal(
    schemas.projects.safeParse({
      ...defaults.projects,
      title: 'Mail Trace Monitor',
      status: 'In Progress',
    }).success,
    true,
  );
});
