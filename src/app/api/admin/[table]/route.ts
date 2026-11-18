import { NextResponse, type NextRequest } from 'next/server';
import { authorized, configured } from '@/lib/supabase';
import { isTable, schemas, envelope } from '@/lib/content';
import { z } from 'zod';
import { isSameOrigin } from '@/lib/request-origin';
export async function POST(req: NextRequest, context: { params: Promise<{ table: string }> }) {
  if (!configured())
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const db = await authorized();
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { table } = await context.params;
  if (!isTable(table)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = await req.json();
    const action = z.enum(['create', 'update', 'delete']).parse(body.action);
    const id = action === 'create' ? undefined : z.uuid().parse(body.id);
    if ((table === 'profile' || table === 'site_settings') && action !== 'update')
      return NextResponse.json({ error: 'This record can only be edited' }, { status: 400 });
    if (action === 'delete') {
      const { error } = await db.from(table).delete().eq('id', id!).select('id').single();
      if (error) throw error;
    } else {
      const input = envelope.parse(body);
      const value = { ...input, data: schemas[table].parse(input.data) };
      const result =
        action === 'create'
          ? await db.from(table).insert(value).select('id').single()
          : await db.from(table).update(value).eq('id', id!).select('id').single();
      if (result.error) throw result.error;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
            : 'Could not save content. Check the fields and database configuration.',
      },
      { status: 400 },
    );
  }
}
