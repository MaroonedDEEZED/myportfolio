import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { portfolioAssets, type PortfolioAsset } from '../portfolioAssets';
import { FILMS, STILLS, byNumber, describe, frameSize, mediaFor, pad, pieceLabel, pieceNumber, runtime, transformOf, useHoverPreview, useNearViewport } from '../media';
import { tiltHandlers } from '../depth';
import { Viewer } from './Viewer';
import type { CV, LinkTo } from '../types';

type Filter = 'all' | 'video' | 'photo';

const FILTERS: { id: Filter; label: string; count: number }[] = [
  { id: 'all', label: 'All', count: portfolioAssets.length },
  { id: 'video', label: 'Films', count: FILMS.length },
  { id: 'photo', label: 'Stills', count: STILLS.length },
];

// The archive streams rather than asking for sixty pieces at once: a first
// screenful, then a further batch each time the end of the grid comes near.
const PAGE_INITIAL = 12;
const PAGE_BATCH = 12;

type Placement = { x: number; y: number; width: number; height: number };

/**
 * Masonry by placement, not by markup. Every frame goes in the shortest column,
 * so frames already on screen never move when a batch arrives; but the list stays
 * one list in archive order, so tabbing and screen readers go 01, 02, 03 rather
 * than down one column and back up the next.
 */
function placeFrames(assets: PortfolioAsset[], containerWidth: number) {
  const columns = containerWidth >= 1560 ? 5 : containerWidth >= 1080 ? 4 : containerWidth >= 680 ? 3 : 2;
  const gapX = Math.round(Math.min(22, Math.max(12, containerWidth * 0.015)));
  const gapY = gapX;
  const width = (containerWidth - gapX * (columns - 1)) / columns;
  const heights = new Array(columns).fill(0);
  const placements = new Map<string, Placement>();
  for (const asset of assets) {
    const size = frameSize(asset);
    let shortest = 0;
    for (let i = 1; i < columns; i += 1) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    // Unknown dimensions count as a portrait-ish 4:5 frame, as the stylesheet does.
    const height = width / (size ? size.w / size.h : 0.8);
    placements.set(asset.title, { x: shortest * (width + gapX), y: heights[shortest], width, height });
    heights[shortest] += height + gapY;
  }
  return { placements, height: Math.max(0, ...heights) - gapY };
}

function FrameCard({ asset, place, onOpen }: { asset: PortfolioAsset; place?: Placement; onOpen: (asset: PortfolioAsset, trigger: HTMLButtonElement) => void }) {
  const media = mediaFor(asset);
  const isFilm = asset.kind === 'video';
  const { video, start, stop } = useHoverPreview(isFilm && !!media.preview, transformOf(asset), true);
  const { ref, near } = useNearViewport<HTMLButtonElement>('900px');
  const still = useRef<HTMLImageElement>(null);
  const [painted, setPainted] = useState(false);
  const shape = frameSize(asset);
  const number = pieceNumber(asset);

  // An image restored from cache can finish before React attaches its handler, and
  // that missed event would hold the frame at its placeholder. Check once as well.
  useEffect(() => {
    if (still.current?.complete && still.current.naturalWidth) setPainted(true);
  }, [near]);

  return (
    <li
      className="frame-card"
      style={place ? { transform: `translate(${place.x}px, ${place.y}px)`, width: place.width } : undefined}
    >
      <button
        ref={ref}
        id={`piece-${pad(number)}`}
        type="button"
        className={`frame${painted ? ' is-painted' : ''}`}
        style={{ '--tone': media.tone, aspectRatio: shape ? `${shape.w} / ${shape.h}` : undefined } as CSSProperties}
        onClick={(event) => onOpen(asset, event.currentTarget)}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        {...tiltHandlers}
        aria-label={`${pieceLabel(asset)}${isFilm && media.duration ? `, ${runtime(media.duration)}` : ''}${describe(asset) ? `: ${describe(asset)?.replace(/\.$/, '')}` : ''}. Open`}
      >
        <span className="frame-glass">
          {near && media.thumb && (
            <img ref={still} src={media.thumb} alt="" loading="lazy" decoding="async" onLoad={() => setPainted(true)} onError={() => setPainted(true)} />
          )}
          {/* Hover previews only from hosted six-second cuts: a card never pulls an original. */}
          {near && isFilm && media.preview && <video ref={video} src={media.preview} muted loop playsInline preload="none" />}
          {isFilm && <span className="frame-play" aria-hidden="true"><Play size={12} /></span>}
        </span>
      </button>
    </li>
  );
}

export function WorkPage({ cv, linkTo, search }: { cv: CV; linkTo: LinkTo; search: string }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [visible, setVisible] = useState(PAGE_INITIAL);
  const [open, setOpen] = useState<PortfolioAsset | null>(null);
  const [width, setWidth] = useState(0);
  const trigger = useRef<HTMLElement | null>(null);
  const grid = useRef<HTMLOListElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (filter === 'all' ? portfolioAssets : portfolioAssets.filter((asset) => asset.kind === filter)), [filter]);
  const shown = useMemo(() => list.slice(0, visible), [list, visible]);
  const layout = useMemo(() => placeFrames(shown, width), [shown, width]);

  // Measured before paint, so the first frame lands in place.
  useLayoutEffect(() => {
    const node = grid.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // A link from the home page (?open=14) arrives with that piece on the monitor.
  useEffect(() => {
    const number = Number(new URLSearchParams(search).get('open'));
    const asset = Number.isInteger(number) && number > 0 ? byNumber(number) : undefined;
    if (asset) setOpen(asset);
  }, [search]);

  useEffect(() => {
    setVisible(PAGE_INITIAL);
  }, [filter]);

  // Extend the grid as its end comes into view, well before it is reached.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || visible >= list.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setVisible((count) => Math.min(count + PAGE_BATCH, list.length));
    }, { rootMargin: '900px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, list.length]);

  const openPiece = (asset: PortfolioAsset, from: HTMLElement) => {
    trigger.current = from;
    setOpen(asset);
  };

  const close = () => {
    const closing = open;
    setOpen(null);
    if (new URLSearchParams(window.location.search).has('open')) {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
    // Hand focus back to the frame that opened the viewer. A viewer opened from a
    // link has no such frame, so focus goes to that piece's frame if it is on the
    // page, or to the top of the content.
    requestAnimationFrame(() => {
      const fallback = closing ? document.getElementById(`piece-${pad(pieceNumber(closing))}`) : null;
      const target = trigger.current ?? fallback ?? document.getElementById('main');
      trigger.current = null;
      target?.focus();
    });
  };

  return (
    <div className="work">
      <section className="work-head" aria-labelledby="work-title">
        <div className="work-title">
          <a className="key key--small back-key" {...linkTo('home')}><ArrowLeft size={14} aria-hidden="true" /> Back home</a>
          <h1 className="display display--page" id="work-title">
            <span className="display-quiet">Selected</span> <span className="display-loud">work.</span>
          </h1>
          <p className="section-lede">Field production, visual direction, image systems, motion studies and sound-led editorial work.</p>
        </div>
        <div className="work-controls">
          <div className="filter-keys" role="group" aria-label="Show">
            {FILTERS.map((item) => (
              <button key={item.id} type="button" className="key" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
                <span className="led" aria-hidden="true" />
                {item.label} <span className="data key-count">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="masonry-shell">
        <ol
          className="masonry"
          ref={grid}
          aria-label={`${list.length} pieces, ${shown.length} shown`}
          style={{ height: width ? layout.height : undefined }}
        >
          {width > 0 && shown.map((asset) => <FrameCard key={asset.title} asset={asset} place={layout.placements.get(asset.title)} onOpen={openPiece} />)}
        </ol>
      </div>
      {visible < list.length && <div ref={sentinel} className="masonry-sentinel" aria-hidden="true" />}

      <p className="work-close">
        Want the story behind a piece? <a {...linkTo('home', 'contact')}>Ask me</a> or write to <a href={`mailto:${cv.email}`}>{cv.email}</a>.
      </p>

      {open && <Viewer asset={open} list={list} onChange={setOpen} onClose={close} />}
    </div>
  );
}
