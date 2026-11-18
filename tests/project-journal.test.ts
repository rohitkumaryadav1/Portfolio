import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schemas, defaults } from '../src/lib/content';
test('journal fields retain safe links and support older project rows', () => {
  const legacy = { ...defaults.projects, title: 'Existing project' };
  const { blog_url, youtube_url, blog_content, highlights, currently_building, ...old } = legacy;
  const parsed = schemas.projects.parse(old);
  assert.equal(parsed.blog_content, '');
  assert.equal(parsed.currently_building, false);
  for (const field of ['blog_url', 'youtube_url', 'demo'])
    assert.equal(
      schemas.projects.safeParse({ ...legacy, [field]: 'javascript:alert(1)' }).success,
      false,
    );
  const result = schemas.projects.parse({
    ...legacy,
    currently_building: true,
    blog_content: 'Build notes',
    highlights: ['Gmail integration'],
    blog_url: 'https://example.com/blog',
    youtube_url: 'https://www.youtube.com/watch?v=example',
    demo: 'https://example.vercel.app',
  });
  assert.equal(result.blog_content, 'Build notes');
  assert.equal(result.highlights.length, 1);
  assert.equal(
    schemas.projects.safeParse({ ...legacy, status: 'Completed', currently_building: true })
      .success,
    false,
  );
});
