'use client';
import { useEffect, useState, useRef } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import Link from 'next/link';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
export function ResumeViewer({ name }: { name: string }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null),
    [page, setPage] = useState(1),
    [zoom, setZoom] = useState(1),
    [width, setWidth] = useState(800),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [text, setText] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stopped = false,
      task: ReturnType<typeof import('pdfjs-dist').getDocument> | undefined;
    (async () => {
      try {
        const pdf = await import('pdfjs-dist');
        if (stopped) return;
        pdf.GlobalWorkerOptions.workerSrc = '/pdf-worker.mjs';
        task = pdf.getDocument({ url: '/api/resume', enableXfa: false });
        const result = await task.promise;
        if (!stopped) setDocument(result);
      } catch {
        if (!stopped) {
          setError('The resume could not be displayed. You can still download the PDF below.');
          setLoading(false);
        }
      }
    })();
    return () => {
      stopped = true;
      void task?.destroy().catch(() => {});
    };
  }, []);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(Math.min(950, el.clientWidth)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!document || !canvas.current) return;
    let stopped = false,
      render: RenderTask | undefined;
    const node = canvas.current;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const pdfPage = await document.getPage(page);
        if (stopped) return;
        const initial = pdfPage.getViewport({ scale: 1 });
        const viewport = pdfPage.getViewport({ scale: (width / initial.width) * zoom });
        const ratio = Math.min(devicePixelRatio, 2);
        node.width = Math.floor(viewport.width * ratio);
        node.height = Math.floor(viewport.height * ratio);
        node.style.width = `${viewport.width}px`;
        node.style.height = `${viewport.height}px`;
        render = pdfPage.render({ canvas: node, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
        await render.promise;
        const content = await pdfPage.getTextContent();
        if (!stopped) {
          setText(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
          setLoading(false);
        }
      } catch (e) {
        if (!stopped) {
          setError('Unable to render this page. Please download the original PDF.');
          setLoading(false);
        }
      }
    })();
    return () => {
      stopped = true;
      render?.cancel();
    };
  }, [document, page, width, zoom]);
  return (
    <main className="resume-viewer">
      <header className="resume-toolbar">
        <Link className="text-link" href="/">
          <ArrowLeft size={17} /> Portfolio
        </Link>
        <h1>
          {name}
          <span>Resume / PDF</span>
        </h1>
        <a className="button primary" href="/api/resume?download=1">
          <Download size={16} /> Download PDF
        </a>
      </header>
      <div className="resume-view-controls">
        <button
          type="button"
          disabled={page <= 1}
          aria-label="Previous resume page"
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          Page {page} of {document?.numPages ?? '…'}
        </span>
        <button
          type="button"
          disabled={!document || page >= document.numPages}
          aria-label="Next resume page"
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          aria-label="Zoom resume out"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
        >
          <Minus size={18} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          aria-label="Zoom resume in"
          onClick={() => setZoom((z) => Math.min(1.75, z + 0.15))}
        >
          <Plus size={18} />
        </button>
      </div>
      {loading && (
        <p className="resume-status" role="status">
          Loading your resume…
        </p>
      )}
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      <div className="resume-document" ref={container}>
        <canvas ref={canvas} role="img" aria-label={`Page ${page} of ${name}'s resume`} />
      </div>
      {text && (
        <details className="resume-text">
          <summary>Read this page as text</summary>
          <p>{text}</p>
        </details>
      )}
      <p className="resume-view-note">
        Prefer your own PDF viewer?{' '}
        <a href="/api/resume" target="_blank" rel="noopener noreferrer">
          Open original PDF ↗
        </a>
      </p>
    </main>
  );
}
