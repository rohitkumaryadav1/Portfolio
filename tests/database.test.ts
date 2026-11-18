import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { schemas, type Table } from '../src/lib/content';
test('PostgreSQL migrations: seed validation, admin CRUD, publication boundaries and media RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated; create schema auth;create schema storage;
 create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated;`);
    await db.exec(readFileSync('supabase/migrations/202611180001_schema.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/202611180002_content.sql', 'utf8'));
    // Exercise an upgrade from the pre-journal payload shape as well as the fresh seed.
    await db.exec(
      "update projects set data=data - array['blog_url','youtube_url','blog_content','highlights','currently_building']",
    );
    await db.exec(readFileSync('supabase/migrations/202611180003_project_journal.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/202611180004_resume.sql', 'utf8'));
    assert.equal(
      (await db.query("select id from projects where data->>'currently_building'='true'")).rows
        .length,
      1,
    );
    await assert.rejects(
      db.exec(
        "update projects set data=data||'{\"currently_building\":true}' where data->>'status'='Completed'",
      ),
    );
    for (const table of Object.keys(schemas) as Table[]) {
      const { rows } = await db.query<{ data: unknown }>(`select data from public.${table}`);
      for (const row of rows)
        assert.equal(schemas[table].safeParse(row.data).success, true, `Invalid seed in ${table}`);
    }
    const admin = '00000000-0000-4000-8000-000000000001',
      other = '00000000-0000-4000-8000-000000000002';
    await db.exec(
      `insert into auth.users values('${admin}'),('${other}');insert into public.admin_users(user_id) values('${admin}');`,
    );
    await assert.rejects(db.exec(`insert into public.admin_users(user_id) values('${other}')`));
    await db.exec(`set role anon;select set_config('request.jwt.claim.sub','',false);`);
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          "select public.is_published_document('initial/rohit-resume.pdf') as allowed",
        )
      ).rows[0].allowed,
      true,
    );
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          "select public.is_published_document('resumes/private.pdf') as allowed",
        )
      ).rows[0].allowed,
      false,
    );
    assert.equal((await db.query('select * from projects')).rows.length, 3);
    await assert.rejects(db.exec(`insert into projects(data) values('{}')`));
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${other}',false)`,
    );
    await assert.rejects(
      db.exec(`insert into interests(data) values(' {"title":"unauthorized"}')`),
    );
    await assert.rejects(db.exec(`insert into public.admin_users(user_id) values('${other}')`));
    await assert.rejects(
      db.exec(
        `insert into storage.objects(bucket_id,name) values('portfolio-media','uploads/unauthorized.webp')`,
      ),
    );
    await db.exec(`select set_config('request.jwt.claim.sub','${admin}',false)`);
    for (const table of ['projects', 'experiences']) {
      const data =
        table === 'projects'
          ? { title: 'Disposable test', status: 'In Progress', featured: false }
          : { organization: 'Disposable test', position: 'Test' };
      const {
        rows: [row],
      } = await db.query<{ id: string }>(
        `insert into ${table}(data,published) values($1,false) returning id`,
        [JSON.stringify(data)],
      );
      await db.query(`update ${table} set data=data||'{"description":"Edited"}' where id=$1`, [
        row.id,
      ]);
      await db.exec(`set role anon;select set_config('request.jwt.claim.sub','',false)`);
      assert.equal((await db.query(`select * from ${table} where id=$1`, [row.id])).rows.length, 0);
      await db.exec(
        `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false)`,
      );
      await db.query(`update ${table} set published=true where id=$1`, [row.id]);
      await db.exec(`set role anon;select set_config('request.jwt.claim.sub','',false)`);
      assert.equal((await db.query(`select * from ${table} where id=$1`, [row.id])).rows.length, 1);
      await db.exec(
        `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false)`,
      );
      await db.query(`update ${table} set published=false where id=$1`, [row.id]);
      await db.exec(`set role anon;select set_config('request.jwt.claim.sub','',false)`);
      assert.equal((await db.query(`select * from ${table} where id=$1`, [row.id])).rows.length, 0);
      await db.exec(
        `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false)`,
      );
      await db.query(`delete from ${table} where id=$1`, [row.id]);
      assert.equal((await db.query(`select * from ${table} where id=$1`, [row.id])).rows.length, 0);
    }
    await db.exec(
      `insert into storage.objects(bucket_id,name) values('portfolio-media','uploads/draft.webp'),('portfolio-media','initial/rohit-yellow-hoodie.webp');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.deepEqual(
      (await db.query<{ name: string }>(`select name from storage.objects`)).rows.map(
        (r) => r.name,
      ),
      ['initial/rohit-yellow-hoodie.webp'],
    );
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);update profile set data=jsonb_set(data,'{image}','"uploads/draft.webp"');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.deepEqual(
      (await db.query<{ name: string }>('select name from storage.objects')).rows.map(
        (r) => r.name,
      ),
      ['uploads/draft.webp'],
    );
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);update profile set data=jsonb_set(data,'{image}','""');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);insert into storage.objects(bucket_id,name) values('portfolio-documents','initial/rohit-resume.pdf'),('portfolio-documents','resumes/replacement.pdf');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.deepEqual(
      (await db.query<{ name: string }>('select name from storage.objects')).rows.map(
        (r) => r.name,
      ),
      ['initial/rohit-resume.pdf'],
    );
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`,
    );
    await assert.rejects(
      db.exec(
        "insert into storage.objects(bucket_id,name) values('portfolio-documents','resumes/unauthorized.pdf')",
      ),
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${admin}',false);update profile set data=jsonb_set(data,'{resume_path}','"resumes/replacement.pdf"');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.deepEqual(
      (await db.query<{ name: string }>('select name from storage.objects')).rows.map(
        (r) => r.name,
      ),
      ['resumes/replacement.pdf'],
    );
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);update profile set data=jsonb_set(data,'{resume_path}','""');set role anon;select set_config('request.jwt.claim.sub','',false);`,
    );
    assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
  } finally {
    await db.close();
  }
});
