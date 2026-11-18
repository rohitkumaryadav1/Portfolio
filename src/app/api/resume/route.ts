import { NextResponse } from 'next/server';
import { read } from '@/lib/data';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const profile = (await read('profile'))[0]?.data;
  if (!profile?.resume_path)
    return new NextResponse('Resume is not currently available.', { status: 404 });
  const db = await supabase();
  const { data, error } = await db.storage
    .from('portfolio-documents')
    .download(profile.resume_path);
  if (error || !data)
    return new NextResponse('Resume is not currently available.', { status: 404 });
  const download = new URL(req.url).searchParams.get('download') === '1';
  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="Rohit-Kumar-Yadav-Resume.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
