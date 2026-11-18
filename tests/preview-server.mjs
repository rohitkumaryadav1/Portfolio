// Isolated visual QA fixture server. Never deployed, never used by application code.
// It serves reviewed SQL seed content through a minimal read-only PostgREST shape.
import http from 'node:http';
import fs from 'node:fs';
const sql = fs.readFileSync(
  new URL('../supabase/migrations/202611180002_content.sql', import.meta.url),
  'utf8',
);
const tables = {};
let index = 0;
for (const match of sql.matchAll(
  /insert into public\.(\w+)\(data,published,display_order\) values \('((?:[^']|'')*)'::jsonb,(true|false),(\d+)\);/g,
)) {
  const [, table, json, published, order] = match;
  const row = {
    id: `00000000-0000-4000-8000-${String(++index).padStart(12, '0')}`,
    data: JSON.parse(json.replaceAll("''", "'")),
    published: published === 'true',
    display_order: Number(order),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  (tables[table] ??= []).push(row);
}
http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:54399');
    if (url.pathname.startsWith('/rest/v1/')) {
      const table = url.pathname.split('/').at(-1);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify((tables[table] ?? []).filter((r) => r.published)));
      return;
    }
    if (url.pathname.startsWith('/storage/v1/object/portfolio-documents/')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.end(fs.readFileSync(new URL('../assets/initial/rohit-resume.pdf', import.meta.url)));
      return;
    }
    if (url.pathname.startsWith('/storage/v1/object/sign/')) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ signedURL: '/object/qa-portrait' }));
      return;
    }
    if (url.pathname === '/storage/v1/object/qa-portrait') {
      res.setHeader('Content-Type', 'image/webp');
      res.end(
        fs.readFileSync(new URL('../assets/initial/rohit-yellow-hoodie.webp', import.meta.url)),
      );
      return;
    }
    res.writeHead(404).end();
  })
  .listen(54399, '127.0.0.1', () =>
    console.log('Read-only visual QA fixtures: http://127.0.0.1:54399'),
  );
