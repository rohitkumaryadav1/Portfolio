import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authorized, configured } from '@/lib/supabase';
import { tables, isTable } from '@/lib/content';
import { logout } from './login/actions';
import { ContentManager, type AdminRow } from '@/components/admin/content-manager';
export const dynamic = 'force-dynamic';
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  if (!configured()) redirect('/admin/login');
  const db = await authorized();
  if (!db) redirect('/admin/login');
  const section = (await searchParams).section ?? 'overview';
  if (section !== 'overview' && !isTable(section)) redirect('/admin');
  const counts = await Promise.all(
    ['projects', 'experiences', 'skills'].map(async (table) => {
      const { count, error } = await db.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    }),
  );
  const { count: featured } = await db
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('data->>featured', 'true');
  let rows: AdminRow[] = [];
  if (isTable(section)) {
    const { data, error } = await db.from(section).select('*').order('display_order');
    if (error) throw error;
    rows = data ?? [];
  }
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="eyebrow">RKY / CONTENT STUDIO</span>
          <h1>Your portfolio, your words.</h1>
        </div>
        <form action={logout}>
          <button className="button secondary">Log out</button>
        </form>
      </header>
      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Content management">
          {['overview', ...tables].map((v) => (
            <Link
              className={section === v ? 'active' : ''}
              key={v}
              href={v === 'overview' ? '/admin' : `/admin?section=${v}`}
            >
              {v.replaceAll('_', ' ')}
            </Link>
          ))}
          <Link href="/" target="_blank">
            View website ↗
          </Link>
        </nav>
        <main className="admin-main">
          {isTable(section) ? (
            <ContentManager key={section} table={section} initialRows={rows} />
          ) : (
            <>
              <span className="eyebrow">OVERVIEW</span>
              <h2>A little room to build.</h2>
              <p>Your published changes appear on the website immediately.</p>
              <div className="stat-grid">
                {[...counts, featured ?? 0].map((n, i) => (
                  <div className="stat" key={i}>
                    <strong>{n}</strong>
                    <span>{['Projects', 'Experiences', 'Skills', 'Featured projects'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="actions">
                <Link className="button primary" href="/admin?section=projects">
                  Manage projects ↗
                </Link>
                <Link className="button secondary" href="/admin?section=profile">
                  Edit profile
                </Link>
              </div>
              <p className="admin-help">
                Draft records are private. Use Published to control public visibility, and Display
                order to arrange content. Uploads stay private until referenced by a published
                record. Personal interests begin unpublished.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
