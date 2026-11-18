'use client';
import { useEffect, useRef, useState } from 'react';
import { Waves, Pause } from 'lucide-react';
import { usePathname } from 'next/navigation';
export function AmbientMesh() {
  const pathname = usePathname();
  const active = !pathname.startsWith('/admin') && !pathname.startsWith('/resume');
  const canvas = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) setEnabled(false);
  }, []);
  useEffect(() => {
    if (!enabled || !active) return;
    const node = canvas.current;
    if (!node) return;
    const ctx = node.getContext('2d');
    if (!ctx) return;
    let width = innerWidth,
      height = innerHeight,
      frame = 0,
      last = 0,
      x = width * 0.7,
      y = height * 0.3,
      targetX = x,
      targetY = y;
    const abort = new AbortController();
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      node.width = width * ratio;
      node.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { signal: abort.signal });
    window.addEventListener(
      'pointermove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true, signal: abort.signal },
    );
    function draw(time: number) {
      frame = requestAnimationFrame(draw);
      if (document.hidden || time - last < 45) return;
      last = time;
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      ctx!.clearRect(0, 0, width, height);
      const dark = document.documentElement.dataset.theme === 'dark';
      ctx!.strokeStyle = dark ? 'rgba(185,211,150,.32)' : 'rgba(86,116,70,.28)';
      ctx!.lineWidth = 0.95;
      const step = width < 680 ? 58 : 68,
        phase = time * 0.00042;
      function point(col: number, row: number) {
        const px = col * step,
          py = row * step,
          d = Math.hypot(px - x, py - y);
        const influence = Math.exp(-(d * d) / (2 * 240 * 240));
        const tide = Math.sin(col * 0.32 + phase) * 20 + Math.cos(row * 0.37 - phase * 0.7) * 16;
        const ripple = Math.cos(d * 0.011 - phase * 2.2) * 30 * influence;
        return [
          px + Math.sin(row * 0.35 + phase * 0.8) * 14 + (px - x) * influence * 0.22,
          py + tide + ripple - 65 * influence + (py - y) * influence * 0.12,
        ];
      }
      for (let row = -2; row < height / step + 3; row++) {
        ctx!.beginPath();
        for (let col = -2; col < width / step + 3; col++) {
          const [vx, vy] = point(col, row);
          if (col === -2) ctx!.moveTo(vx, vy);
          else ctx!.lineTo(vx, vy);
        }
        ctx!.stroke();
      }
      for (let col = -2; col < width / step + 3; col++) {
        ctx!.beginPath();
        for (let row = -2; row < height / step + 3; row++) {
          const [vx, vy] = point(col, row);
          if (row === -2) ctx!.moveTo(vx, vy);
          else ctx!.lineTo(vx, vy);
        }
        ctx!.stroke();
      }
      // Sparse floating points travel with the same tidal surface.
      ctx!.fillStyle = dark ? 'rgba(209,225,174,.6)' : 'rgba(84,112,64,.45)';
      for (let i = 0; i < 13; i++) {
        const [px, py] = point(
          (i * 7.3) % Math.max(1, width / step),
          (i * 4.7 + phase * 0.35) % Math.max(1, height / step),
        );
        ctx!.beginPath();
        ctx!.arc(px, py, i % 3 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    frame = requestAnimationFrame(draw);
    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled, active]);
  if (!active) return null;
  return (
    <>
      <canvas className="ambient-mesh" aria-hidden="true" ref={canvas} />
      <button
        className="motion-control"
        type="button"
        aria-label={enabled ? 'Pause background animation' : 'Enable background animation'}
        onClick={() => setEnabled((v) => !v)}
      >
        {enabled ? <Pause size={13} /> : <Waves size={14} />}
        <span>{enabled ? 'Pause motion' : 'Enable motion'}</span>
      </button>
    </>
  );
}
