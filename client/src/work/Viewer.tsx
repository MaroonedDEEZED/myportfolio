import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { ColourScope } from '../suite/ColourScope';
import { originOf, setSpill } from '../suite/spill';
import { aspectName, describe, dimensions, mediaFor, pad, pieceNumber, runtime, sourceSize } from '../media';
import type { PortfolioAsset } from '../portfolioAssets';

type Props = {
  asset: PortfolioAsset;
  /** The pieces the visitor can step through: the archive as currently filtered. */
  list: PortfolioAsset[];
  onChange: (asset: PortfolioAsset) => void;
  onClose: () => void;
};

/** One piece on the monitor, its colours in the scope beside it. */
export function Viewer({ asset, list, onChange, onClose }: Props) {
  const media = mediaFor(asset);
  const isFilm = asset.kind === 'video';
  const size = sourceSize(asset);
  const number = pieceNumber(asset);
  const position = list.indexOf(asset);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState(media.full);
  const closeKey = useRef<HTMLButtonElement>(null);

  // The room takes on the colour of the open piece, flowing out from the frame.
  useEffect(() => {
    const media = mediaFor(asset);
    setSpill(media.spill, originOf(document.querySelector('.viewer-frame')), media.accent);
  }, [asset]);

  // Each piece starts from its best hosted version; a failure falls back to the
  // original once, then to an honest error.
  useEffect(() => {
    setFailed(false);
    setSource(mediaFor(asset).full);
  }, [asset]);

  const onError = (event: SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const original = mediaFor(asset).original;
    if (event.currentTarget.getAttribute('src') !== original) setSource(original);
    else setFailed(true);
  };

  const step = (direction: 1 | -1) => {
    if (position < 0 || list.length < 2) return;
    onChange(list[(position + direction + list.length) % list.length]);
  };

  // A true modal: the page behind goes inert, so neither Tab nor a screen reader can
  // wander into the archive hidden under the backdrop.
  useEffect(() => {
    closeKey.current?.focus();
    const page = document.getElementById('root');
    page?.setAttribute('inert', '');
    document.body.classList.add('is-viewing');
    return () => {
      page?.removeAttribute('inert');
      document.body.classList.remove('is-viewing');
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      // Arrow keys belong to whatever has them natively: a film's seek bar (its
      // shadow controls retarget to the <video>), a form field, or the scope.
      const owner = event.target instanceof Element && event.target.closest('video, audio, input, textarea, select, [role=slider], .scope-glass');
      if (owner) return;
      if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const label = `${isFilm ? 'Film' : 'Still'} ${pad(number)}`;

  return createPortal(
    <div className="viewer-backdrop" onClick={onClose}>
      <div className="viewer" role="dialog" aria-modal="true" aria-label={label} onClick={(event) => event.stopPropagation()}>
        <header className="viewer-bar">
          <p className="viewer-readout">
            <span className="data">{dimensions(size)}</span>
            <span className="data">{aspectName(size)}</span>
            {isFilm && media.duration ? <span className="data">{runtime(media.duration)}</span> : null}
          </p>
          <div className="viewer-keys">
            <button className="key key--icon" type="button" onClick={() => step(-1)} aria-label="Previous piece" disabled={list.length < 2}><ArrowLeft size={16} aria-hidden="true" /></button>
            <span className="data viewer-count">{position + 1} / {list.length}</span>
            <button className="key key--icon" type="button" onClick={() => step(1)} aria-label="Next piece" disabled={list.length < 2}><ArrowRight size={16} aria-hidden="true" /></button>
            <button ref={closeKey} className="key key--icon" type="button" onClick={onClose} aria-label="Close"><X size={17} aria-hidden="true" /></button>
          </div>
        </header>
        <div className="viewer-body">
          <div className="viewer-monitor">
            <div className="viewer-frame" style={{ '--ratio': size ? (size.w / size.h).toFixed(4) : undefined } as CSSProperties}>
              {failed ? (
                <div className="viewer-error" role="alert">
                  <span className="viewer-error-mark" aria-hidden="true">!</span>
                  <p><strong>This piece could not be loaded.</strong> The file host did not answer. Try the next piece, or come back to it later.</p>
                </div>
              ) : isFilm ? (
                <video key={asset.title} src={source} poster={media.thumb} controls controlsList="nodownload" autoPlay playsInline onError={onError} aria-label={describe(asset) ? `${label}: ${describe(asset)}` : label} />
              ) : (
                <img key={asset.title} src={source} alt={describe(asset) ?? `${label} from the portfolio`} decoding="async" onError={onError} />
              )}
            </div>
          </div>
          <aside className="viewer-side" aria-label="Colour of this piece">
            <ColourScope samples={media.samples} subject={label.toLowerCase()} className="viewer-scope" />
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}
