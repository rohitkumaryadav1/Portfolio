'use client';
import { useRef, useState, useId, useEffect } from 'react';
import Link from 'next/link';
import { ProjectJournal } from '@/components/project-journal';
import { ArrowUpRight, Mail, CodeXml, Play, BookOpen, Globe, X, ArrowRight } from 'lucide-react';
import type { Row } from '@/lib/content';

export function ProjectFeature({
  project,
  githubProfile,
  compact = false,
}: {
  project: Row<'projects'>;
  githubProfile: string;
  compact?: boolean;
}) {
  const p = project.data;
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  function show() {
    dialog.current?.showModal();
    setOpen(true);
  }
  function close() {
    dialog.current?.close();
  }
  const github = p.github || githubProfile;
  return (
    <article className={`project-feature ${compact ? 'building-feature' : ''}`}>
      {compact && (
        <div className="building-heading">
          <span className="dot" />
          <span className="eyebrow">CURRENTLY BUILDING</span>
          <span className="tag">In Progress</span>
        </div>
      )}
      <button
        ref={trigger}
        type="button"
        className="feature-trigger"
        onClick={show}
        aria-haspopup="dialog"
        aria-controls={id}
        aria-label={`Open ${p.title}`}
      >
        <div className={`feature-thumbnail ${p.image ? 'has-cover' : ''}`}>
          {p.image ? (
            <img src={`/media/${p.image}`} alt={`${p.title} thumbnail`} loading="lazy" />
          ) : (
            <div className="feature-illustration" aria-hidden="true">
              <span className="thumbnail-label">
                {p.status === 'In Progress' ? 'WORK IN PROGRESS' : 'INDEPENDENT PROJECT'}
              </span>
              <div className="trace-diagram">
                <span>
                  <Mail size={28} strokeWidth={1.4} />
                </span>
                <i />
                <span>
                  <CodeXml size={28} strokeWidth={1.4} />
                </span>
              </div>
              <span className="thumbnail-wordmark">
                {p.title === 'Mail Trace Monitor' ? 'Mail Trace Monitor' : p.title}
              </span>
              <span className="thumbnail-caption">
                {p.title === 'Mail Trace Monitor'
                  ? 'EMAIL → EVENTS → INSIGHT'
                  : 'IDEA → CODE → EXPLORATION'}
              </span>
            </div>
          )}
          <span className="feature-open">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="feature-copy">
          {!compact && p.featured && <span className="tag feature-featured">Featured</span>}
          <span className="eyebrow">
            {compact
              ? 'A BUILD IN THE MAKING'
              : p.currently_building
                ? 'CURRENTLY BUILDING'
                : p.status}
          </span>
          <h3>{p.title}</h3>
          <p>{p.short_description}</p>
          <ul>
            {p.highlights.slice(0, compact ? 2 : 3).map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <span className="feature-action">
            Project notes & links <ArrowRight size={15} />
          </span>
        </div>
      </button>
      {!compact && (
        <div className="tags">
          {p.technologies.slice(0, 5).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        id={id}
        className="project-dialog"
        aria-labelledby={`${id}-title`}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) {
            const rect = dialog.current.getBoundingClientRect();
            if (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            )
              close();
          }
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-top">
            <span className="eyebrow">PROJECT JOURNAL / {p.status}</span>
            <button
              type="button"
              className="icon-button"
              onClick={close}
              aria-label="Close project"
            >
              <X size={19} />
            </button>
          </div>
          <h2 id={`${id}-title`}>{p.title}</h2>
          <p className="dialog-intro">{p.short_description}</p>
          <div className="project-resources">
            {p.blog_url ? (
              <a href={p.blog_url} target="_blank" rel="noopener noreferrer">
                <BookOpen size={18} />
                <span>Read the blog</span>
                <ArrowUpRight size={15} />
              </a>
            ) : (
              <div>
                <BookOpen size={18} />
                <span>
                  Project blog<small>Read the notes below</small>
                </span>
              </div>
            )}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer">
                <CodeXml size={18} />
                <span>{p.github ? 'GitHub repository' : 'GitHub profile'}</span>
                <ArrowUpRight size={15} />
              </a>
            )}
            {p.youtube_url ? (
              <a href={p.youtube_url} target="_blank" rel="noopener noreferrer">
                <Play size={18} />
                <span>YouTube video</span>
                <ArrowUpRight size={15} />
              </a>
            ) : (
              <div>
                <Play size={18} />
                <span>
                  YouTube video<small>Not added yet</small>
                </span>
              </div>
            )}
            {p.demo ? (
              <a href={p.demo} target="_blank" rel="noopener noreferrer">
                <Globe size={18} />
                <span>Vercel / live demo</span>
                <ArrowUpRight size={15} />
              </a>
            ) : (
              <div>
                <Globe size={18} />
                <span>
                  Vercel / live demo<small>Not added yet</small>
                </span>
              </div>
            )}
          </div>
          {p.highlights.length > 0 && (
            <ul className="dialog-highlights">
              {p.highlights.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
          <div className="project-journal">
            <span className="eyebrow">{p.blog_content ? 'BUILD NOTES' : 'ABOUT THIS PROJECT'}</span>
            <ProjectJournal content={p.blog_content || p.description} />
          </div>
          <div className="tags">
            {p.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          {p.screenshots.map((path, i) => (
            <img
              className="journal-screenshot"
              key={path}
              src={`/media/${path}`}
              alt={`${p.title} screenshot ${i + 1}`}
              loading="lazy"
            />
          ))}
          <Link className="text-link" href={`/projects/${project.id}`} onClick={close}>
            Open full project page <ArrowUpRight size={15} />
          </Link>
        </div>
      </dialog>
    </article>
  );
}
