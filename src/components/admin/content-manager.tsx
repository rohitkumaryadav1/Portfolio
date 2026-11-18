'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaults, type Table } from '@/lib/content';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { ResumeField } from './resume-field';
export type AdminRow = {
  id: string;
  data: Record<string, unknown>;
  published: boolean;
  display_order: number;
};
type Draft = {
  id?: string;
  data: Record<string, unknown>;
  published: boolean;
  display_order: number;
};
const longFields = [
  'about',
  'introduction',
  'description',
  'responsibilities',
  'achievements',
  'coursework',
  'screenshots',
  'blog_content',
];
const labels: Record<string, string> = {
  demo: 'Vercel / live demo URL',
  blog_url: 'External blog URL',
  youtube_url: 'YouTube video URL',
  blog_content: 'Project blog / notes',
  currently_building: 'Show in Currently building',
  highlights: 'Project bullet points',
};
const label = (key: string) => labels[key] ?? key.replaceAll('_', ' ');
export function ContentManager({ table, initialRows }: { table: Table; initialRows: AdminRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState(false);
  const singleton = table === 'profile' || table === 'site_settings';
  async function mutate(action: string, value: Draft) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...value, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setDraft(null);
      setError(false);
      setMessage(action === 'delete' ? 'Record deleted.' : 'Saved. Published content is now live.');
      router.refresh();
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }
  function update(key: string, value: unknown) {
    setDraft((d) => (d ? { ...d, data: { ...d.data, [key]: value } } : d));
  }
  return (
    <>
      <div className="admin-toolbar">
        <h2>{label(table)}</h2>
        {!singleton && (
          <button
            disabled={busy || uploading}
            className="button primary"
            onClick={() => {
              setMessage('');
              setDraft({
                data: structuredClone(defaults[table]),
                published: false,
                display_order: initialRows.length,
              });
            }}
          >
            <Plus size={15} /> Add{' '}
            {table === 'experiences'
              ? 'experience'
              : table === 'education'
                ? 'education'
                : table.slice(0, -1)}
          </button>
        )}
      </div>
      <p className="admin-help">
        Save a draft to keep it private. Publish when it is ready. List fields use one item per
        line. Optional links and unknown dates can stay empty.
      </p>
      {table === 'projects' && (
        <p className="admin-help">
          Use “Show in Currently building” for one published In Progress project. Uncheck the
          previous project before choosing another. Add bullet points, project notes, an external
          blog URL, a repository URL, a YouTube video, and a Vercel/live URL below. In notes, start
          a line with ## for a heading. Empty links stay unavailable publicly.
        </p>
      )}
      {message && (
        <p role="status" className={`message ${error ? 'error' : ''}`}>
          {message}
        </p>
      )}
      {draft && (
        <section className="record">
          <div className="record-heading">
            <h3>{draft.id ? 'Edit record' : 'New record'}</h3>
            <button
              disabled={busy || uploading}
              aria-label="Close editor"
              onClick={() => setDraft(null)}
            >
              <X size={18} />
            </button>
          </div>
          <form
            key={draft.id ?? 'new'}
            className="editor"
            onSubmit={(e) => {
              e.preventDefault();
              if (uploading) return;
              void mutate(draft.id ? 'update' : 'create', draft);
            }}
          >
            {Object.entries(defaults[table]).map(([key, initial]) => {
              const value = draft.data[key] ?? initial;
              if (key === 'resume_path')
                return (
                  <ResumeField
                    key={key}
                    value={String(value)}
                    onChange={(value) => update(key, value)}
                    onBusyChange={setUploading}
                    disabled={busy || uploading}
                  />
                );
              if (key === 'image' || key === 'screenshots')
                return (
                  <ImageField
                    key={key}
                    name={key}
                    value={value as string | string[]}
                    onChange={(value) => update(key, value)}
                    onBusyChange={setUploading}
                    disabled={busy || uploading}
                  />
                );
              if (typeof initial === 'boolean')
                return (
                  <label key={key} className="field check">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    {label(key)}
                  </label>
                );
              if (key === 'status')
                return (
                  <label className="field" key={key}>
                    Project status
                    <select value={String(value)} onChange={(e) => update(key, e.target.value)}>
                      {['Completed', 'In Progress', 'Experiment'].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                );
              if (Array.isArray(initial))
                return (
                  <label key={key} className="field wide">
                    {label(key)} (one per line)
                    <textarea
                      value={(value as string[]).join('\n')}
                      onChange={(e) => update(key, e.target.value.split('\n'))}
                      onBlur={() =>
                        update(
                          key,
                          (draft.data[key] as string[]).map((v) => v.trim()).filter(Boolean),
                        )
                      }
                    />
                  </label>
                );
              if (longFields.includes(key))
                return (
                  <label className="field wide" key={key}>
                    {label(key)}
                    <textarea
                      maxLength={12000}
                      value={String(value)}
                      onChange={(e) => update(key, e.target.value)}
                    />
                  </label>
                );
              const type = key.endsWith('_date')
                ? 'date'
                : key === 'email'
                  ? 'email'
                  : typeof initial === 'number'
                    ? 'number'
                    : ['github', 'linkedin', 'x', 'demo', 'blog_url', 'youtube_url'].includes(key)
                      ? 'url'
                      : 'text';
              return (
                <label key={key} className="field">
                  {label(key)}
                  <input
                    type={type}
                    maxLength={300}
                    value={String(value)}
                    onChange={(e) =>
                      update(key, type === 'number' ? Number(e.target.value) : e.target.value)
                    }
                  />
                </label>
              );
            })}
            <label className="field">
              Display order
              <input
                type="number"
                min={0}
                max={100000}
                value={draft.display_order}
                onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
              />
            </label>
            <label className="field check">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
              />{' '}
              Published
            </label>
            <div className="editor-actions">
              <button disabled={busy || uploading} className="button primary">
                {busy ? 'Saving…' : 'Save changes'}
              </button>
              <button
                disabled={busy || uploading}
                className="button secondary"
                type="button"
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      {initialRows.map((row) => (
        <article className="record" key={row.id}>
          <div className="record-heading">
            <div>
              <h3>
                {String(
                  row.data.title ??
                    row.data.name ??
                    row.data.organization ??
                    row.data.university ??
                    'Website settings',
                )}
              </h3>
              <small>
                {row.published ? 'Published' : 'Draft'} · Order {row.display_order}
              </small>
            </div>
            <div>
              <button
                disabled={busy || uploading}
                aria-label="Edit record"
                onClick={() => {
                  setMessage('');
                  setDraft(structuredClone(row));
                }}
              >
                <Pencil size={17} />
              </button>
              {!singleton && (
                <button
                  disabled={busy || uploading}
                  aria-label="Delete record"
                  onClick={() => {
                    if (window.confirm('Delete this record permanently?'))
                      void mutate('delete', row);
                  }}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
      {initialRows.length === 0 && !draft && <p>No records yet. Add your first one above.</p>}
    </>
  );
}
function ImageField({
  name,
  value,
  onChange,
  onBusyChange,
  disabled,
}: {
  name: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function upload() {
    if (!file) return;
    setBusy(true);
    onBusyChange(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onChange(Array.isArray(value) ? [...value, result.path] : result.path);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  const images = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="field wide">
      <span>{label(name)} · JPEG, PNG, WebP · under 4 MB</span>
      <div className="screenshot-preview">
        {images.map((path) => (
          <div key={path}>
            <img src={`/media/${path}`} alt="Current uploaded image" />
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => onChange(Array.isArray(value) ? value.filter((v) => v !== path) : '')}
            >
              Remove image
            </button>
          </div>
        ))}
      </div>
      <label>
        Choose image to preview
        <input
          aria-label={`Choose ${name}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled || busy}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </label>
      {preview && (
        <>
          <img src={preview} alt="Preview before upload" />
          <div>
            <button
              className="button secondary"
              type="button"
              disabled={busy || disabled}
              onClick={() => void upload()}
            >
              {busy ? 'Uploading…' : 'Use this image'}
            </button>
          </div>
          <small>Upload the image, then save the record to apply it.</small>
        </>
      )}
      {error && (
        <p role="alert" className="message error">
          {error}
        </p>
      )}
    </div>
  );
}
