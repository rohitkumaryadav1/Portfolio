'use client';
import { useState, useEffect } from 'react';
export function ResumeField({
  value,
  onChange,
  onBusyChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
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
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/resume', { method: 'POST', body: form });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onChange(result.path);
      setMessage('PDF uploaded. Save the profile to make it the public resume.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'PDF upload failed');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <div className="field wide">
      <span>Resume PDF · under 4 MB · up to 20 pages</span>
      <p className="admin-help">
        Published PDFs are downloadable. Check personal details before uploading. The initial public
        copy omits your phone number.
      </p>
      {value && (
        <div className="resume-current">
          <span>{value.split('/').at(-1)}</span>
          <a href="/resume" target="_blank" rel="noopener noreferrer">
            Open published resume ↗
          </a>
          <button type="button" disabled={disabled || busy} onClick={() => onChange('')}>
            Remove resume
          </button>
        </div>
      )}
      <label>
        Choose a new resume
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled || busy}
          onChange={(e) => {
            const next = e.target.files?.[0];
            e.target.value = '';
            if (next && (next.size > 4_000_000 || next.type !== 'application/pdf')) {
              setMessage('Choose a PDF under 4 MB.');
              return;
            }
            setFile(next ?? null);
            setMessage('');
          }}
        />
      </label>
      {preview && (
        <div className="actions">
          <a className="button secondary" href={preview} target="_blank" rel="noopener noreferrer">
            Preview selected PDF ↗
          </a>
          <button
            className="button primary"
            type="button"
            disabled={disabled || busy}
            onClick={() => void upload()}
          >
            {busy ? 'Uploading…' : 'Use this resume'}
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="message">
          {message}
        </p>
      )}
    </div>
  );
}
