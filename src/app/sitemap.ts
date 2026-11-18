import type { MetadataRoute } from 'next';
import { read } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  return [
    { url: base },
    ...(await read('projects')).map((r) => ({
      url: `${base}/projects/${r.id}`,
      lastModified: r.updated_at,
    })),
  ];
}
