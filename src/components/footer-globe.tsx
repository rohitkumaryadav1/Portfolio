'use client';
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Pause, Play, LocateFixed } from 'lucide-react';
type GlobeControls = { zoom: (factor: number) => void; locate: () => void; rotate: () => void };
export function FooterGlobe({ name }: { name: string }) {
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    marker = useRef<HTMLButtonElement>(null),
    controls = useRef<GlobeControls | null>(null);
  const [paused, setPaused] = useState(false),
    [error, setError] = useState(false),
    [located, setLocated] = useState(false);
  useEffect(() => {
    const element = canvas.current,
      container = host.current,
      pin = marker.current;
    if (!element || !container || !pin) return;
    const context = element.getContext('2d');
    if (!context) {
      setError(true);
      return;
    }
    let disposed = false,
      frame = 0,
      visible = false,
      width = 300,
      height = 300,
      scale = 1,
      longitude = -77.209,
      latitude = -28.614,
      dragging = false,
      lastX = 0,
      lastY = 0,
      lastTime = 0,
      auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPaused(!auto);
    const abort = new AbortController();
    let observer: IntersectionObserver | undefined, resize: ResizeObserver | undefined;
    const cleanup: () => void = () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resize?.disconnect();
      controls.current = null;
    };
    (async () => {
      try {
        const [{ geoOrthographic, geoPath, geoGraticule10, geoDistance }, land] = await Promise.all(
          [
            import('d3-geo'),
            fetch('/data/land.geojson', { signal: abort.signal }).then((r) => {
              if (!r.ok) throw new Error('Map unavailable');
              return r.json();
            }),
          ],
        );
        if (disposed) return;
        const projection = geoOrthographic().clipAngle(90).precision(0.4),
          path = geoPath(projection, context),
          grid = geoGraticule10();
        const sphere = { type: 'Sphere' as const };
        function draw() {
          if (disposed) return;
          const ctx = context!;
          ctx.clearRect(0, 0, width, height);
          const radius = Math.min(width, height) * 0.405 * scale;
          projection
            .translate([width / 2, height / 2])
            .scale(radius)
            .rotate([longitude, latitude]);
          ctx.beginPath();
          path(sphere);
          ctx.fillStyle = '#1b3029';
          ctx.fill();
          ctx.strokeStyle = '#74826d';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          path(grid);
          ctx.strokeStyle = '#78907838';
          ctx.lineWidth = 0.65;
          ctx.stroke();
          ctx.beginPath();
          path(land);
          ctx.fillStyle = '#9eaf8b';
          ctx.fill();
          ctx.strokeStyle = '#bed09f60';
          ctx.lineWidth = 0.45;
          ctx.stroke();
          // A clipped radial shadow gives the orthographic sphere depth without WebGL.
          ctx.save();
          ctx.beginPath();
          path(sphere);
          ctx.clip();
          const shade = ctx.createRadialGradient(
            width * 0.36,
            height * 0.3,
            radius * 0.1,
            width * 0.55,
            height * 0.5,
            radius * 1.15,
          );
          shade.addColorStop(0, '#d2e2bb08');
          shade.addColorStop(0.6, '#07120d10');
          shade.addColorStop(1, '#07120dbb');
          ctx.fillStyle = shade;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
          const point = projection([77.209, 28.614]),
            front = geoDistance([77.209, 28.614], [-longitude, -latitude]) < Math.PI / 2;
          pin!.hidden = !front || !point;
          if (front && point) {
            pin!.style.left = `${point[0]}px`;
            pin!.style.top = `${point[1]}px`;
          }
          element!.dataset.rotation = `${longitude.toFixed(1)},${latitude.toFixed(1)}`;
          element!.dataset.zoom = scale.toFixed(2);
        }
        function loop(time: number) {
          if (disposed) return;
          if (visible && !document.hidden && time - lastTime > 32) {
            if (auto && !dragging) longitude += 0.0018 * Math.min(time - lastTime, 50);
            draw();
            lastTime = time;
          }
          frame = requestAnimationFrame(loop);
        }
        resize = new ResizeObserver(() => {
          width = container.clientWidth;
          height = container.clientHeight;
          const ratio = Math.min(devicePixelRatio, 2);
          element.width = width * ratio;
          element.height = height * ratio;
          context.setTransform(ratio, 0, 0, ratio, 0, 0);
          draw();
        });
        resize.observe(container);
        observer = new IntersectionObserver(
          (entries) => {
            visible = entries[0].isIntersecting;
            if (visible) {
              lastTime = performance.now();
              draw();
            }
          },
          { rootMargin: '80px' },
        );
        observer.observe(container);
        const zoom = (factor: number) => {
          scale = Math.max(0.75, Math.min(1.55, scale * factor));
          draw();
        };
        controls.current = {
          zoom,
          locate: () => {
            longitude = -77.209;
            latitude = -28.614;
            scale=1;
            auto = false;
            setPaused(true);
            setLocated(true);
            draw();
          },
          rotate: () => {
            auto = !auto;
            setPaused(!auto);
            draw();
          },
        };
        const down = (e: PointerEvent) => {
          dragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          element.setPointerCapture(e.pointerId);
          auto = false;
          setPaused(true);
        };
        const move = (e: PointerEvent) => {
          if (!dragging) return;
          longitude += (e.clientX - lastX) * 0.45;
          latitude = Math.max(-80, Math.min(80, latitude - (e.clientY - lastY) * 0.45));
          lastX = e.clientX;
          lastY = e.clientY;
          draw();
        };
        const up = () => {
          dragging = false;
        };
        const wheel = (e: WheelEvent) => {
          e.preventDefault();
          zoom(Math.exp(-e.deltaY * 0.001));
        };
        const key = (e: KeyboardEvent) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '='].includes(e.key))
            return;
          e.preventDefault();
          auto = false;
          setPaused(true);
          if (e.key === 'ArrowLeft') longitude -= 8;
          if (e.key === 'ArrowRight') longitude += 8;
          if (e.key === 'ArrowUp') latitude = Math.max(-80, latitude - 8);
          if (e.key === 'ArrowDown') latitude = Math.min(80, latitude + 8);
          if (e.key === '+' || e.key === '=') zoom(1.1);
          if (e.key === '-') zoom(0.9);
          draw();
        };
        const signal = abort.signal;
        element.addEventListener('pointerdown', down, { signal });
        element.addEventListener('pointermove', move, { signal });
        element.addEventListener('pointerup', up, { signal });
        element.addEventListener('pointercancel', up, { signal });
        element.addEventListener('wheel', wheel, { passive: false, signal });
        element.addEventListener('keydown', key, { signal });
        frame = requestAnimationFrame(loop);
        draw();
      } catch (e) {
        if (!disposed && !abort.signal.aborted) setError(true);
      }
    })();
    return cleanup;
  }, []);
  return (
    <section className="footer-globe" aria-label="Rohit's location on an interactive globe">
      <div className="globe-heading">
        <span className="eyebrow">ONE SMALL DOT. LOTS TO BUILD.</span>
      </div>
      <div className="globe-stage" ref={host}>
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label="Interactive globe. Drag to rotate, scroll to zoom. Arrow keys rotate, plus and minus zoom."
        />
        <button
          ref={marker}
          className="delhi-marker"
          type="button"
          onClick={() => {
            controls.current?.locate();
            setLocated(true);
          }}
          aria-label={`${name}, based in Delhi, India`}
        >
          <span>🏛</span>
          <b>Rohit · Delhi</b>
        </button>
        {error && (
          <div className="globe-fallback">
            🏛<p>Based in Delhi, India.</p>
          </div>
        )}
      </div>
      <div className="globe-controls">
        <button
          type="button"
          onClick={() => controls.current?.zoom(1.15)}
          aria-label="Zoom globe in"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => controls.current?.zoom(0.87)}
          aria-label="Zoom globe out"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={() => controls.current?.rotate()}
          aria-label={paused ? 'Start globe rotation' : 'Pause globe rotation'}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          type="button"
          onClick={() => controls.current?.locate()}
          aria-label="Find Rohit in Delhi"
        >
          <LocateFixed size={15} />
        </button>
        <span>DRAG · SCROLL TO ZOOM</span>
      </div>
      <p className="globe-location" aria-live="polite">
        {located ? 'Rohit · Based in Delhi, India.' : 'Based in Delhi. Building for everywhere.'}
      </p>
    </section>
  );
}
