import { notFound } from 'next/navigation';
import { read, mediaUrl } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ProjectJournal } from '@/components/project-journal';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = (await read('projects')).find((r) => r.id === id);
  return { title: r?.data.title ?? 'Project', description: r?.data.short_description };
}
export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = (await read('projects')).find((r) => r.id === id);
  if (!r) notFound();
  const p = r.data;
  return (
    <main className="wrap detail">
      <Link className="text-link" href="/#projects">
        <ArrowLeft size={18} /> Back to selected work
      </Link>
      <span className="eyebrow">INDEPENDENT PROJECT / {p.status}</span>
      <h1>{p.title}</h1>
      <p className="intro">{p.short_description}</p>
      <div className="tags">
        {p.technologies.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {p.image && <img className="detail-image" src={mediaUrl(p.image)} alt={`${p.title} cover`} />}
      <div className="detail-body">
        {p.description.split('\n').map((v, i) => (
          <p key={i}>{v}</p>
        ))}
      </div>
      {p.highlights.length > 0 && (
        <ul className="dialog-highlights">
          {p.highlights.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      )}
      {(p.start_date || p.completion_date) && (
        <p>
          Started: {p.start_date || 'Not specified'} · Completed: {p.completion_date || 'Ongoing'}
        </p>
      )}
      <div className="actions">
        {p.blog_url && (
          <a className="button secondary" href={p.blog_url}>
            Read blog <ArrowUpRight size={18} />
          </a>
        )}
        {p.youtube_url && (
          <a className="button secondary" href={p.youtube_url}>
            YouTube video <ArrowUpRight size={18} />
          </a>
        )}
        {p.github && (
          <a className="button primary" href={p.github}>
            GitHub repository <ArrowUpRight size={18} />
          </a>
        )}
        {p.demo && (
          <a className="button secondary" href={p.demo}>
            Live demo <ArrowUpRight size={18} />
          </a>
        )}
      </div>
      {p.blog_content && (
        <section className="project-journal detail-body">
          <h2>Build notes</h2>
          <ProjectJournal content={p.blog_content} />
        </section>
      )}
      <div className="screenshots">
        {p.screenshots.map((image, i) => (
          <img
            key={image}
            src={mediaUrl(image)}
            alt={`${p.title} screenshot ${i + 1}`}
            loading="lazy"
          />
        ))}
      </div>
    </main>
  );
}
