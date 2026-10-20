import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Pause, RotateCcw, RotateCw } from 'lucide-react';
import { SAMPLE_GRID, loadSamples, prefersReducedMotion, useNearViewport } from '../media';
import type { Scope, ScopeMode } from './scopeRenderer';

const MODES: { id: ScopeMode; label: string; reads: string }[] = [
  { id: 'cube', label: 'Colour cube', reads: 'Every pixel placed by its red, green and blue.' },
  { id: 'vector', label: 'Vectorscope', reads: 'Hue around the circle, saturation outward.' },
  { id: 'wave', label: 'Waveform', reads: 'Brightness, left to right across the frame.' },
];

const TURN = 0.4;

/**
 * The 2D vectorscope, drawn when WebGL2 is unavailable: the same samples, flattened
 * to the view a colourist reads most.
 */
function drawFlatScope(canvas: HTMLCanvasElement, samples: Uint8Array) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.scale(dpr, dpr);
  context.fillStyle = '#060606';
  context.fillRect(0, 0, width, height);
  const radius = Math.min(width, height) * 0.42;
  const cx = width / 2;
  const cy = height / 2;
  context.strokeStyle = 'rgba(255,255,255,0.22)';
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.moveTo(cx - radius, cy);
  context.lineTo(cx + radius, cy);
  context.moveTo(cx, cy - radius);
  context.lineTo(cx, cy + radius);
  context.stroke();
  context.globalCompositeOperation = 'lighter';
  for (let i = 0; i < samples.length; i += 3) {
    const r = samples[i] / 255;
    const g = samples[i + 1] / 255;
    const b = samples[i + 2] / 255;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const cb = (b - y) / 1.8556;
    const cr = (r - y) / 1.5748;
    context.fillStyle = `rgba(${samples[i]},${samples[i + 1]},${samples[i + 2]},0.55)`;
    context.fillRect(cx + cb * radius * 2.4 - 1, cy - cr * radius * 2.4 - 1, 2, 2);
  }
  context.globalCompositeOperation = 'source-over';
}

type Props = {
  /** URL of the piece's sample grid. */
  samples?: string;
  /** What the cloud is of, for people who cannot see it: "still 44". */
  subject: string;
  className?: string;
  /** Hold the cloud still. Pass with onHoldChange to share one Hold key with a parent. */
  held?: boolean;
  onHoldChange?: (held: boolean) => void;
};

export function ColourScope({ samples, subject, className, held: heldProp, onHoldChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const { ref: shell, near } = useNearViewport<HTMLDivElement>('240px');
  const [mode, setMode] = useState<ScopeMode>('cube');
  const [ready, setReady] = useState<'pending' | 'webgl' | 'flat'>('pending');
  // Bumped when the GPU drops the context: a new canvas, a new renderer.
  const [generation, setGeneration] = useState(0);
  const [heldLocal, setHeldLocal] = useState(false);
  const held = heldProp ?? heldLocal;
  const setHeld = (next: boolean) => (onHoldChange ? onHoldChange(next) : setHeldLocal(next));
  const stillByRequest = prefersReducedMotion();

  // The renderer is its own chunk, fetched only once the scope is about to be seen.
  // The piece's samples are fetched alongside it rather than after it.
  useEffect(() => {
    if (!near || !canvas.current || !labels.current) return;
    let cancelled = false;
    let created: Scope | null = null;
    void loadSamples(samples);
    void import('./scopeRenderer').then(({ createScope }) => {
      if (cancelled || !canvas.current || !labels.current) return;
      try {
        created = createScope({
          canvas: canvas.current,
          labels: labels.current,
          grid: SAMPLE_GRID,
          reducedMotion: stillByRequest,
          onLost: () => {
            if (cancelled) return;
            setReady('pending');
            setGeneration((value) => value + 1);
          },
        });
      } catch {
        created = null;
      }
      scope.current = created;
      setReady(created ? 'webgl' : 'flat');
      if (!created) setMode('vector');
    });
    return () => {
      cancelled = true;
      created?.destroy();
      scope.current = null;
    };
    // Samples are fed by the effect below; this one only builds the renderer.
  }, [near, generation]);

  // Feed the current piece's colours in; the renderer flows from the last frame.
  useEffect(() => {
    if (ready === 'pending') return;
    let current = true;
    void loadSamples(samples).then((bytes) => {
      if (!current || !bytes) return;
      if (ready === 'webgl') scope.current?.setSamples(bytes);
      else if (canvas.current) drawFlatScope(canvas.current, bytes);
    });
    return () => { current = false; };
  }, [samples, ready]);

  useEffect(() => {
    scope.current?.setMode(mode);
  }, [mode, ready]);

  useEffect(() => {
    scope.current?.setAutoTurn(!held);
  }, [held, ready]);

  // Draw only while the scope is on screen and the tab is in front; follow the
  // glass's own size, which is what the canvas fills.
  useEffect(() => {
    const node = shell.current;
    const box = glass.current;
    if (!node || !box || ready !== 'webgl') return;
    let onScreen = false;
    const apply = () => scope.current?.setVisible(onScreen && document.visibilityState === 'visible');
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      apply();
    });
    visibility.observe(node);
    const sizing = new ResizeObserver(() => scope.current?.resize());
    sizing.observe(box);
    document.addEventListener('visibilitychange', apply);
    return () => {
      visibility.disconnect();
      sizing.disconnect();
      document.removeEventListener('visibilitychange', apply);
    };
  }, [ready, shell, generation]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (ready !== 'webgl') return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    // Touch turns sideways only; vertical swipes stay with the page scroll.
    const tilt = event.pointerType === 'touch' ? 0 : (event.clientY - start.y) * 0.006;
    scope.current?.orbit((event.clientX - start.x) * -0.009, tilt);
    drag.current = { ...start, x: event.clientX, y: event.clientY };
  };

  const endDrag = () => { drag.current = null; };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const turns: Record<string, [number, number]> = { ArrowLeft: [0.18, 0], ArrowRight: [-0.18, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] };
    const turn = turns[event.key];
    if (!turn || ready !== 'webgl') return;
    event.preventDefault();
    scope.current?.orbit(turn[0], turn[1]);
  };

  const active = MODES.find((item) => item.id === mode) ?? MODES[0];
  const flat = ready === 'flat';

  return (
    <div className={`scope${className ? ` ${className}` : ''}`} ref={shell}>
      <div className="scope-keys" role="group" aria-label="Scope view">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="key key--small"
            aria-pressed={mode === item.id}
            disabled={flat && item.id !== 'vector'}
            onClick={() => setMode(item.id)}
          >
            <span className="led" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>
      <div
        ref={glass}
        className={`scope-glass is-${ready}`}
        tabIndex={ready === 'webgl' ? 0 : -1}
        role="img"
        aria-label={`The colours of ${subject}${flat ? ' on a flat vectorscope' : ' in 3D'}: ${SAMPLE_GRID * SAMPLE_GRID} of its pixels, each placed by its colour. ${flat ? 'Hue around the circle, saturation outward.' : `${active.reads} Arrow keys turn it.`}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        {/* A canvas that once held a WebGL context cannot give a 2D one, so the
            fallback and every rebuilt renderer get a canvas of their own. */}
        <canvas key={flat ? 'flat' : `gl-${generation}`} ref={canvas} />
        <div className="scope-labels" ref={labels} aria-hidden="true" />
      </div>
      <div className="scope-foot">
        <p className="scope-readout">
          <span className="data">{(SAMPLE_GRID * SAMPLE_GRID).toLocaleString('en-US')} px</span>
          <span>{flat ? 'Vectorscope. Your browser cannot draw it in 3D.' : active.reads}</span>
        </p>
        {(ready === 'webgl' || onHoldChange) && (
          <div className="scope-turns" role="group" aria-label={ready === 'webgl' ? 'Turn the cloud' : 'Motion'}>
            {ready === 'webgl' && <button className="key key--small key--icon-small" type="button" onClick={() => scope.current?.orbit(TURN, 0)} aria-label="Turn left"><RotateCcw size={14} aria-hidden="true" /></button>}
            {ready === 'webgl' && <button className="key key--small key--icon-small" type="button" onClick={() => scope.current?.orbit(-TURN, 0)} aria-label="Turn right"><RotateCw size={14} aria-hidden="true" /></button>}
            {!stillByRequest && (
              <button className="key key--small" type="button" aria-pressed={held} onClick={() => setHeld(!held)}>
                <span className="led" aria-hidden="true" />
                <Pause size={13} aria-hidden="true" /> Hold
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
