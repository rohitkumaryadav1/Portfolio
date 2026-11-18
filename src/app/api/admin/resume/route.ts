import { NextResponse, type NextRequest } from 'next/server';
import { authorized, configured } from '@/lib/supabase';
import { validateResume } from '@/lib/resume-file';
import { isSameOrigin } from '@/lib/request-origin';
export async function POST(req: NextRequest) {
  if (!configured())
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const db = await authorized();
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    if (Number(req.headers.get('content-length')) > 4_400_000)
      return NextResponse.json({ error: 'Maximum PDF size is 4 MB' }, { status: 413 });
    const file = (await req.formData()).get('file');
    if (!(file instanceof File) || file.type !== 'application/pdf' || file.size > 4_000_000)
      throw new Error('Choose a PDF under 4 MB.');
    const bytes = await validateResume(new Uint8Array(await file.arrayBuffer()));
    const path = `resumes/${crypto.randomUUID()}.pdf`;
    const { error } = await db.storage
      .from('portfolio-documents')
      .upload(path, bytes, { contentType: 'application/pdf', upsert: false });
    if (error)
      throw new Error('Could not store the resume. Check the documents bucket configuration.');
    return NextResponse.json({ path });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF upload failed' },
      { status: 400 },
    );
  }
}
