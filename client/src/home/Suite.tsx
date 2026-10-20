import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Play } from 'lucide-react';
import { ColourScope } from '../suite/ColourScope';
import { originOf, setSpill } from '../suite/spill';
import { HERO_FRAMES, aspectName, byNumber, describe, dimensions, mediaFor, pad, prefersReducedMotion, runtime } from '../media';
import { portfolioAssets } from '../portfolioAssets';
import type { CV, LinkTo } from '../types';

// A frame holds the monitor this long before the next one cuts in, unless the
// visitor has taken over or pressed Hold.
const HOLD_MS = 7000;
const MONITOR_SIZES = '(max-width: 1100px) 100vw, 60vw';

export function Suite({ cv, linkTo }: { cv: CV; linkTo: LinkTo }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  // Set once a hosted film has failed, so every later play goes straight to the original.
  const [fromOriginal, setFromOriginal] = useState(false);
  const bay = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const playKey = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  const frame = HERO_FRAMES[index];
  const asset = byNumber(frame.number);
  const media = mediaFor(asset);
  const isFilm = frame.kind === 'video';
  const size = { w: frame.width, h: frame.height };
  const subject = `${isFilm ? 'film' : 'still'} ${pad(frame.number)}`;

  // Hold still for visitors who asked for less motion, while the visitor is driving
  // (a click, a focus, or Hold), while a film plays, and while the monitor is out of view.
  useEffect(() => {
    if (takenOver || held || playing || !onScreen || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % HERO_FRAMES.length), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, takenOver, held, playing, onScreen]);

  useEffect(() => {
    const node = bay.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => setOnScreen(entries.some((entry) => entry.isIntersecting)), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The room takes on the colour of what is on the monitor, flowing out from it.
  useEffect(() => {
    setSpill(media.spill, originOf(bay.current?.querySelector('.monitor-glass')), media.accent);
  }, [media.spill, media.accent]);

  // Warm the next frame at the size the monitor will pick, so the cut lands on a
  // decoded picture, never on black.
  useEffect(() => {
    const next = HERO_FRAMES[(index + 1) % HERO_FRAMES.length];
    const image = new Image();
    image.sizes = MONITOR_SIZES;
    image.srcset = `${next.frame} 800w, ${next.frameLarge} 1600w`;
    image.src = next.frame;
    void image.decode().catch(() => {});
  }, [index]);

  // Keyboard focus follows the film: onto the player when it starts, back to the
  // Play key when it stops, so it never falls to the page.
  useEffect(() => {
    if (playing) {
      film.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      playKey.current?.focus();
    }
  }, [playing]);

  const show = (next: number) => {
    setTakenOver(true);
    setPlaying(false);
    setIndex(next);
  };

  const stopFilm = () => {
    returnFocus.current = true;
    setPlaying(false);
  };

  // A hosted web version that fails (it is git-ignored, so absent on some deploys)
  // falls back to the original; if that fails too, the still returns.
  const onFilmError = () => {
    if (!fromOriginal) setFromOriginal(true);
    else stopFilm();
  };

  return (
    <section className="suite" aria-labelledby="suite-title">
      <div className="suite-statement">
        <h1 className="display" id="suite-title">
          <span className="display-quiet">Stories with</span> <span className="display-loud">signal.</span>
        </h1>
        <div className="suite-intro">
          <p className="byline"><strong>{cv.name}</strong><span className="byline-role">{cv.role.replace(/ · /g, ', ')} · {cv.location}</span></p>
          <p className="intro">{cv.intro}</p>
          <div className="actions">
            {/* The CV lives in the console bar, on screen at every scroll position. */}
            <a className="key key--large" {...linkTo('portfolio')}>See all {portfolioAssets.length} pieces</a>
          </div>
        </div>
      </div>

      <div className="suite-bay" ref={bay} onFocusCapture={() => setTakenOver(true)}>
        <div className="suite-monitor-col">
          <figure className="monitor">
            <div className="monitor-bezel">
              <div className="monitor-glass">
                {isFilm && playing ? (
                  <video
                    ref={film}
                    key={frame.title}
                    src={fromOriginal ? media.original : media.full}
                    poster={frame.frameLarge}
                    controls
                    controlsList="nodownload"
                    autoPlay
                    playsInline
                    onError={onFilmError}
                    onEnded={stopFilm}
                    aria-label={`Film ${pad(frame.number)}`}
                  />
                ) : (
                  <img
                    key={frame.title}
                    src={frame.frame}
                    srcSet={`${frame.frame} 800w, ${frame.frameLarge} 1600w`}
                    sizes={MONITOR_SIZES}
                    alt={describe(asset) ?? `${isFilm ? 'Film' : 'Still'} ${pad(frame.number)} from the portfolio.`}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                )}
                {/* Frame lines: corner marks on the picture's own edges, wherever
                    its shape sits inside the 16:9 glass. */}
                {!playing && <span className="frame-lines" style={{ '--ratio': (size.w / size.h).toFixed(4) } as CSSProperties} aria-hidden="true" />}
                {isFilm && !playing && (
                  <button ref={playKey} className="key key--small monitor-play" type="button" onClick={() => { setTakenOver(true); setPlaying(true); }}>
                    <Play size={14} aria-hidden="true" /> Play film{media.duration ? <span className="data"> · {runtime(media.duration)}</span> : null}
                  </button>
                )}
              </div>
              <figcaption className="monitor-status">
                <span className="data readout-strong">{pad(frame.number)}<span className="readout-of"> / {portfolioAssets.length}</span></span>
                <span className="legend">{isFilm ? 'Film' : 'Still'}</span>
                <span className="monitor-tally" aria-hidden="true" />
                <span className="data">{dimensions(size)}</span>
                <span className="data status-aspect">{aspectName(size)}</span>
                {isFilm && media.duration ? <span className="data">{runtime(media.duration)}</span> : null}
              </figcaption>
            </div>
          </figure>

          <ol className="clip-strip" aria-label="Frames for the monitor">
            {HERO_FRAMES.map((item, i) => (
              <li key={item.title}>
                <button
                  type="button"
                  className="clip"
                  aria-pressed={i === index}
                  aria-label={`Show ${item.kind === 'video' ? 'film' : 'still'} ${pad(item.number)}`}
                  onClick={() => show(i)}
                >
                  <img src={item.frameSmall} alt="" decoding="async" />
                  <span className="clip-number data" aria-hidden="true">{pad(item.number)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <ColourScope
          className="suite-scope"
          samples={media.samples}
          subject={subject}
          held={held}
          onHoldChange={(next) => { setHeld(next); if (next) setTakenOver(true); }}
        />
      </div>
    </section>
  );
}
