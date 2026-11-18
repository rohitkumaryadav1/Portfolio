import { NextResponse } from 'next/server';
import { supabase, configured } from '@/lib/supabase';
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!configured()) return new NextResponse(null, { status: 404 });
  const path = (await params).path.join('/');
  if (!/^[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg)$/.test(path))
    return new NextResponse(null, { status: 404 });
  const db = await supabase();
  const { data, error } = await db.storage.from('portfolio-media').createSignedUrl(path, 60);
  if (error || !data) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(data.signedUrl, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
