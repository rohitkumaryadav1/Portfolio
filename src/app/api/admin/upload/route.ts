import { NextResponse, type NextRequest } from 'next/server';
import { authorized, configured } from '@/lib/supabase';
import sharp from 'sharp';
import { isSameOrigin } from '@/lib/request-origin';
export async function POST(req: NextRequest) {
  if (!configured())
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const db = await authorized();
  if (!db) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    if (Number(req.headers.get('content-length')) > 5_000_000)
      return NextResponse.json({ error: 'Maximum request size is 5 MB' }, { status: 413 });
    const form = await req.formData();
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      file.size > 4_000_000 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      return NextResponse.json(
        { error: 'Choose a JPEG, PNG, or WebP under 4 MB' },
        { status: 400 },
      );
    const bytes = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25_000_000,
    })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const path = `uploads/${crypto.randomUUID()}.webp`;
    const { error } = await db.storage
      .from('portfolio-media')
      .upload(path, bytes, { contentType: 'image/webp', upsert: false });
    if (error) throw error;
    return NextResponse.json({ path });
  } catch {
    return NextResponse.json({ error: 'Image could not be processed or stored' }, { status: 400 });
  }
}
