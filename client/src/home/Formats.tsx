import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { FILMS, STILLS, isVertical, mediaFor, pad, pieceNumber, prefersReducedMotion, runtime, sourceSize, transformOf, useHoverPreview, useNearViewport } from '../media';
import { tiltHandlers } from '../depth';
import { portfolioAssets, type PortfolioAsset } from '../portfolioAssets';
import type { LinkTo } from '../types';

const RAIL_LENGTH = 10;
const vertical = FILMS.filter(isVertical);
// The tally reads each film's file as delivered, the same measure the viewer prints,
// so the counts can be checked piece by piece.
const shape = (asset: PortfolioAsset) => {
  const size = sourceSize(asset);
  return size ? size.w / size.h : 1;
};
const verticalCount = FILMS.filter((asset) => shape(asset) < 0.95).length;
const widescreenCount = FILMS.filter((asset) => shape(asset) >= 1.6).length;
const tally = { vertical: verticalCount, widescreen: widescreenCount, other: FILMS.length - verticalCount - widescreenCount };
// Pieces with a hosted preview first: they play on hover instead of only resting.
const railFilms = [...vertical.filter((asset) => mediaFor(asset).preview), ...vertical.filter((asset) => !mediaFor(asset).preview)].slice(0, RAIL_LENGTH);

function PhoneFrame({ asset, linkTo }: { asset: PortfolioAsset; linkTo: LinkTo }) {
  const media = mediaFor(asset);
  const transform = transformOf(asset);
  const { video, start, stop } = useHoverPreview(true, transform, !!media.preview);
  const { ref, near } = useNearViewport<HTMLAnchorElement>('600px');
  const [painted, setPainted] = useState(false);
  const number = pieceNumber(asset);
  const size = sourceSize(asset);

  return (
    <li className="phone">
      <a
        ref={ref}
        className="phone-frame"
        {...linkTo('portfolio', undefined, `?open=${number}`)}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        {...tiltHandlers}
        aria-label={`Film ${pad(number)}${media.duration ? `, ${runtime(media.duration)}` : ''}. Open it in the work archive`}
        style={{ '--tone': media.tone } as CSSProperties}
      >
        <span className={`phone-glass${painted ? ' is-painted' : ''}`}>
          {near && media.thumb && <img src={media.thumb} alt="" loading="lazy" decoding="async" onLoad={() => setPainted(true)} />}
          {/* Hover previews only from hosted six-second cuts: a card never pulls an original. */}
          {near && media.preview && <video ref={video} src={media.preview} muted loop playsInline preload="none" />}
        </span>
        <span className="phone-readout">
          <span className="data">{pad(number)}</span>
          <span className="data">{media.duration ? runtime(media.duration) : size ? `${size.w}×${size.h}` : 'Film'}</span>
        </span>
      </a>
    </li>
  );
}

export function Formats({ linkTo }: { linkTo: LinkTo }) {
  const rail = useRef<HTMLOListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const update = () => setEdges({ start: node.scrollLeft < 8, end: node.scrollLeft + node.clientWidth > node.scrollWidth - 8 });
    update();
    node.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      node.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    // One full row at a time, so every page of frames sits balanced in the margins.
    const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 0;
    node.scrollBy({ left: direction * (node.clientWidth + gap), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className="formats section" aria-labelledby="formats-title">
      <div className="section-head formats-head">
        <div>
          <h2 id="formats-title">From phone to broadcast.</h2>
          <p className="section-lede">Vertical for the phone, widescreen for the big screen. The format changes; the eye doesn't.</p>
        </div>
        <div className="formats-meta">
          <p className="tally">
            <span><strong className="data">{tally.vertical}</strong> vertical films</span>
            <span><strong className="data">{tally.widescreen}</strong> widescreen films</span>
            {tally.other > 0 && <span><strong className="data">{tally.other}</strong> square or 4:3 films</span>}
            <span><strong className="data">{STILLS.length}</strong> stills</span>
          </p>
          <div className="rail-keys">
            {/* Paging keys only when the films do not all fit in the row. */}
            {!(edges.start && edges.end) && (
              <>
                <button className="key key--icon" type="button" onClick={() => page(-1)} disabled={edges.start} aria-label="Scroll the films back"><ArrowLeft size={16} aria-hidden="true" /></button>
                <button className="key key--icon" type="button" onClick={() => page(1)} disabled={edges.end} aria-label="Scroll the films on"><ArrowRight size={16} aria-hidden="true" /></button>
              </>
            )}
            <a className="key" {...linkTo('portfolio')}>All {portfolioAssets.length} pieces <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <ol className="rail" ref={rail} aria-label="Vertical films">
        {railFilms.map((asset) => <PhoneFrame key={asset.title} asset={asset} linkTo={linkTo} />)}
      </ol>
    </section>
  );
}
