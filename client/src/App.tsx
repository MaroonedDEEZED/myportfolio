import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type SyntheticEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, Film, Menu, MoveRight, Play, X } from 'lucide-react';
import { portfolioAssets, type PortfolioAsset } from './portfolioAssets';
import { posterUrl, blurUrl, scaledUrl, stillUrl } from './mediaUrls';
import { intrinsicSizes } from './portfolioSizes';
import { posterAdjustments } from './portfolioPosters';
import { cv as fallbackCv } from '../../server/src/data/cv';

type Experience = {
  company: string;
  role: string;
  dates: string;
  location: string;
  focus: string;
  highlights: string[];
};

type CV = {
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  portfolio: string;
  intro: string;
  education: { school: string; detail: string; degree: string; location: string };
  experience: Experience[];
  skills: { label: string; detail: string }[];
  languages: { label: string; detail: string }[];
};

const filters = ['All work', 'Camera', 'Edit', 'Sound', 'Production'];

// The site is two real pages sharing one bundle. Routes are history-backed so the
// portfolio is linkable, survives a refresh, and works with the back button.
type Route = 'home' | 'portfolio';

const ROUTE_PATH: Record<Route, string> = { home: '/', portfolio: '/portfolio' };

const routeFromPath = (pathname: string): Route => {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  return clean === '/portfolio' ? 'portfolio' : 'home';
};

function matchesFilter(item: Experience, filter: string) {
  if (filter === 'All work') return true;
  const text = `${item.role} ${item.focus} ${item.highlights.join(' ')}`.toLowerCase();
  const terms: Record<string, string[]> = {
    Camera: ['camera', 'cinematography', 'director of photography'],
    Edit: ['edit', 'post-production', 'digital'],
    Sound: ['sound', 'audio', 'music'],
    Production: ['production', 'logistics', 'manager'],
  };
  return terms[filter].some((term) => text.includes(term));
}

// The feed reads as a curated contact sheet: one feature frame, then supporting
// tiles. Slots repeat every four items so the pattern survives a different slice.
type TileSlot = 'feature' | 'standard' | 'wide';

const TILE_SIZE: Record<TileSlot, { w: number; h: number }> = {
  feature: { w: 1200, h: 760 },
  standard: { w: 620, h: 360 },
  wide: { w: 1200, h: 340 },
};

const slotFor = (index: number): TileSlot => {
  const position = index % 4;
  if (position === 0) return 'feature';
  if (position === 3) return 'wide';
  return 'standard';
};

// Previewing on intent needs a pointer that can hover and a visitor who has not
// asked for reduced motion. Without both, tiles stay as stills.
const previewsOnHover = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

/** Poster until the pointer or keyboard focus arrives, then play; rewind on exit. */
function useHoverPreview(isVideo: boolean) {
  const video = useRef<HTMLVideoElement>(null);

  const start = () => {
    if (!isVideo || !previewsOnHover) return;
    void video.current?.play().catch(() => {});
  };

  const stop = () => {
    const element = video.current;
    if (!element) return;
    element.pause();
    element.currentTime = 0;
  };

  return { video, start, stop };
}

function PortfolioTile({ asset, index, link }: { asset: PortfolioAsset; index: number; link: { href: string; onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void } }) {
  const { video, start, stop } = useHoverPreview(asset.kind === 'video');
  const still = useRef<HTMLImageElement>(null);
  const [painted, setPainted] = useState(false);
  const slot = slotFor(index);
  const { w, h } = TILE_SIZE[slot];
  const isVideo = asset.kind === 'video';
  const adjust = posterAdjustments[asset.title];

  // A blurred ~350 byte miniature of this tile's own frame, so the tile holds its
  // colours from the first paint instead of showing an empty box that later pops.
  const placeholder = blurUrl(isVideo ? asset.poster : asset.asset, 24, 16, adjust?.transform);

  // An image restored from cache can finish before React attaches its handler, and
  // that missed event would leave the still at opacity 0 forever. Check once on
  // mount as well, so the reveal never depends on the event arriving.
  useEffect(() => {
    if (still.current?.complete) setPainted(true);
  }, []);

  return (
    <a
      className={`pf-tile pf-tile--${slot}${isVideo ? ' pf-tile--video' : ''}`}
      {...link}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`${isVideo ? 'Video' : 'Photo'} ${String(index + 1).padStart(2, '0')} — open the portfolio`}
    >
      <span className={`pf-tile-media${painted ? ' is-painted' : ''}`}>
        {placeholder && <span className="pf-tile-lqip" style={{ backgroundImage: `url("${placeholder}")` }} />}
        {isVideo ? (
          <video ref={video} src={asset.asset} poster={posterUrl(asset.poster, w, h, adjust?.transform)} muted loop playsInline preload="none" />
        ) : (
          <img
            ref={still}
            className="pf-tile-still"
            src={stillUrl(asset.asset, w, h)}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setPainted(true)}
          />
        )}
        <span className="pf-tile-chip">{isVideo ? <><Play size={10} /> Video</> : 'Photo'}</span>
      </span>
      <span className="pf-tile-bar">
        <span className="pf-tile-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="pf-tile-open">Open <ArrowUpRight size={13} /></span>
      </span>
    </a>
  );
}

function App() {
  const [cv, setCv] = useState<CV | null>(null);
  const [activeFilter, setActiveFilter] = useState('All work');
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState<Route>(() => routeFromPath(window.location.pathname));
  const [apiError, setApiError] = useState<string | null>(null);
  // Set when a navigation also carries a hash, so the scroll effect below knows to
  // seek a section instead of jumping to the top.
  const pendingHash = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      pendingHash.current = null;
      setPage(routeFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const hash = pendingHash.current;
    pendingHash.current = null;
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const navigate = (next: Route, hash?: string) => {
    setMenuOpen(false);
    if (page === next) {
      // Same page: no history entry, just seek.
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    pendingHash.current = hash ?? null;
    window.history.pushState({ route: next }, '', hash ? `${ROUTE_PATH[next]}#${hash}` : ROUTE_PATH[next]);
    setPage(next);
  };

  // Real href for every navigation, with the click intercepted for instant
  // client-side routing. Middle-click and open-in-new-tab still work.
  const linkTo = (next: Route, hash?: string) => ({
    href: hash ? `${ROUTE_PATH[next]}#${hash}` : ROUTE_PATH[next],
    onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      navigate(next, hash);
    },
  });

  useEffect(() => {
    fetch('/api/cv')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CV API returned ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!payload || !Array.isArray(payload.experience) || !Array.isArray(payload.skills) || !Array.isArray(payload.languages)) {
          throw new Error('CV API payload was malformed');
        }
        setCv(payload as CV);
        setApiError(null);
      })
      .catch(() => {
        setCv(fallbackCv as CV);
        setApiError('The live CV feed could not be reached, so the archive fallback was loaded.');
      });
  }, []);

  const visibleExperience = useMemo(
    () => cv?.experience.filter((item) => matchesFilter(item, activeFilter)) ?? [],
    [cv, activeFilter],
  );

  const portfolioCounts = useMemo(() => {
    const videos = portfolioAssets.filter((asset) => asset.kind === 'video').length;
    return { videos, stills: portfolioAssets.length - videos };
  }, []);

  if (!cv) {
    return <div className="loading-screen"><span className="loading-mark">MB</span><span>Loading archive...</span></div>;
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" aria-label="Marouane Bouakba, back to the studio page" {...linkTo('home')}><span className="brand-mark"><span>M</span><span>B</span></span><span className="brand-text">Marouane<br />Bouakba</span></a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <a className="nav-link-button" {...linkTo('home')}>Home</a>
          <a className="nav-link-button" {...linkTo('portfolio')}>Portfolio</a>
          <a className="nav-link-button" {...linkTo('home', 'contact')}>Contact</a>
        </nav>
        <a className="header-cta" href={`mailto:${cv.email}`}><span>Start a conversation</span><ArrowUpRight size={15} /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main id="top">
        {apiError && <div className="site-warning"><span>{apiError}</span></div>}
        {page === 'portfolio' ? (
          <PortfolioPage cv={cv} linkHome={linkTo('home')} />
        ) : (
          <>
            <section className="hero section-pad">
              <div className="hero-copy">
                <h1>Stories with<br /><em>signal.</em></h1>
                <p className="hero-intro">{cv.intro}</p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#work">Explore the work <ArrowDownRight size={17} /></a>
                  <a className="button button-quiet" {...linkTo('portfolio')}>Open portfolio <ArrowUpRight size={16} /></a>
                  <a className="button button-quiet" href="/Marouane_Bouakba_Content_Producer_CV.pdf" download>Download CV <Download size={16} /></a>
                </div>
              </div>
              <div className="hero-art" aria-label="Portrait of Marouane Bouakba">
                <div className="portrait-stage"><img src="/myimage.jpeg" alt="Marouane Bouakba" /></div>
              </div>
              <div className="hero-meta"></div>
            </section>
            <section className="portfolio-strip section-pad" id="portfolio">
              <div className="section-heading portfolio-heading">
                <div className="section-kicker"><span>01</span><span>Portfolio feed</span></div>
                <div className="portfolio-heading-right">
                  <p className="portfolio-tally">
                    <strong>{portfolioCounts.videos}</strong> films · <strong>{portfolioCounts.stills}</strong> stills
                  </p>
                  <a className="section-link" {...linkTo('portfolio')}>Enter Portfolio Page <ArrowUpRight size={14} /></a>
                </div>
              </div>
              <div className="portfolio-feed">
                {portfolioAssets.slice(0, 4).map((asset, index) => (
                  <PortfolioTile key={asset.title} asset={asset} index={index} link={linkTo('portfolio')} />
                ))}
              </div>
            </section>

            <section className="manifesto section-pad" id="practice">
              <div className="section-kicker"><span>02</span><span>Point of view</span></div>
              <div className="manifesto-grid"><h2>The frame is only<br /><span>the beginning.</span></h2><div><p className="large-copy">Every project has a frequency. I find it in the rhythm of a cut, the weight of a room, the detail hiding in plain sight.</p><p className="muted-copy">From production floor to final mix, I bring a practical eye and a composed hand to image-making. Cinema, commercial, documentary, brand worlds: the medium shifts. The attention stays.</p></div></div>
            </section>

            <section className="work-section section-pad" id="work">
              <div className="section-heading"><div className="section-kicker"><span>03</span><span>Experience archive</span></div></div>
              <div className="filter-bar" role="tablist" aria-label="Filter experience">
                {filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'filter active' : 'filter'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
              </div>
              <div className="timeline">
                {visibleExperience.map((item, index) => <article className="work-item" key={item.company}>
                  <div className="work-marker"><span>{String(index + 1).padStart(2, '0')}</span><i /></div>
                  <div className="work-main"><div className="work-topline"><h3>{item.company}</h3><span>{item.dates}</span></div><p className="work-role">{item.role}</p><p className="work-focus">{item.focus}</p><ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
                  <div className="work-location">{item.location}</div>
                </article>)}
              </div>
            </section>

            <section className="capabilities section-pad">
              <div className="section-kicker"><span>04</span><span>Toolkit</span></div>
              <div className="capability-grid">
                <div className="capability-intro"><h2>Wide lens.<br /><em>Deep craft.</em></h2><p>One practice, many entry points. The work gets stronger when the disciplines speak to one another.</p></div>
                <div className="skill-list">{cv.skills.map((skill, index) => <div className="skill-row" key={skill.label}><span className="skill-number">0{index + 1}</span><div><h3>{skill.label}</h3><p>{skill.detail}</p></div><MoveRight size={18} /></div>)}</div>
              </div>
            </section>

            <section className="education section-pad"><div className="education-card"><div><div className="section-kicker"><span>05</span><span>Formation</span></div><h2>Made in the<br /><em>arts of spectacle.</em></h2></div><div className="edu-detail"><span className="edu-year">ISMAS</span><h3>{cv.education.degree}</h3><p>{cv.education.detail}<br />{cv.education.location}</p></div><div className="language-detail"><span>Languages</span>{cv.languages.map((language) => <p key={language.label}><strong>{language.label}</strong> <small>{language.detail}</small></p>)}</div></div></section>

            <section className="contact section-pad" id="contact"><div className="contact-card"><div className="section-kicker"><span>06</span><span>Next scene</span></div><h2>Have a story<br /><em>in mind?</em></h2><a className="contact-email" href={`mailto:${cv.email}`}>{cv.email} <ArrowUpRight size={22} /></a><span className="contact-phone">{cv.phone}</span></div></section>
          </>
        )}
      </main>
      <footer className="footer"><span>© {new Date().getFullYear()} Marouane Bouakba</span><span>Doha · Algiers · Everywhere</span><span>Built for the moving image <Film size={14} /></span></footer>
    </div>
  );
}

function PortfolioPageCard({ asset, onOpen, onSettled }: { asset: PortfolioAsset; onOpen: () => void; onSettled: () => void }) {
  const isVideo = asset.kind === 'video';
  const { video, start, stop } = useHoverPreview(isVideo);
  const still = useRef<HTMLImageElement>(null);
  const reported = useRef(false);
  const [painted, setPainted] = useState(false);
  const size = frameSize(asset.title);
  const adjust = posterAdjustments[asset.title];
  const placeholder = blurUrl(isVideo ? asset.poster : asset.asset, 24, 16, adjust?.transform);

  const report = () => {
    if (reported.current) return;
    reported.current = true;
    onSettled();
  };

  useEffect(() => {
    if (still.current?.complete) setPainted(true);
  }, []);

  // A poster emits no load event to wait on, so video cards settle on mount; the
  // spinner is gated by the stills, which do report back.
  useEffect(() => {
    if (isVideo) report();
  }, [isVideo]);

  return (
    <article className="portfolio-page-card">
      <button
        className={`portfolio-page-card-media${size ? ' has-ratio' : ''}${painted ? ' is-painted' : ''}`}
        type="button"
        style={size ? { aspectRatio: `${size.w} / ${size.h}` } : undefined}
        onClick={onOpen}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        aria-label={isVideo ? `Play ${asset.title}` : `View ${asset.title}`}
      >
        {placeholder && <span className="pf-lqip" style={{ backgroundImage: `url("${placeholder}")` }} />}
        {isVideo ? (
          <video ref={video} src={asset.asset} poster={scaledUrl(asset.poster, 900, adjust?.transform)} muted loop playsInline preload="none" />
        ) : (
          <img
            ref={still}
            src={scaledUrl(asset.asset, 900) ?? asset.asset}
            alt={asset.title}
            loading="lazy"
            decoding="async"
            onLoad={() => { setPainted(true); report(); }}
            onError={() => { setPainted(true); report(); }}
          />
        )}
      </button>
    </article>
  );
}

// The archive streams rather than blocking on sixty assets: a spinner covers the
// first screenful, then further cards arrive as the sentinel nears the viewport.
const PAGE_INITIAL = 8;
const PAGE_BATCH = 12;
const LOADER_CEILING_MS = 6000;
const MASONRY_COLUMNS = 4;
const NARROW = '(max-width: 850px)';

/** Mirrors the stylesheet's column breakpoints so JS and CSS never disagree. */
function useColumnCount() {
  const [count, setCount] = useState(() =>
    (typeof window !== 'undefined' && window.matchMedia(NARROW).matches ? 1 : MASONRY_COLUMNS));

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const update = () => setCount(query.matches ? 1 : MASONRY_COLUMNS);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return count;
}

/**
 * Frame dimensions to reserve for an asset. A letterboxed video is delivered
 * cropped, so the crop's dimensions win over the source frame's — otherwise the
 * reserved box would be the wrong shape and the picture would be re-cropped.
 */
function frameSize(title: string) {
  return posterAdjustments[title] ?? intrinsicSizes[title];
}

/**
 * CSS multi-column re-balances the whole archive whenever a batch arrives, which
 * briefly leaves ragged gaps and shuffles cards between columns. Placing each card
 * in the shortest column ourselves keeps the layout stable as it streams: existing
 * cards never move, and a gap cannot open because the next card fills it.
 *
 * Heights are tracked in column-widths — the intrinsic ratio is proportional to the
 * rendered height because every column is the same width.
 */
function distributeIntoColumns(assets: PortfolioAsset[], count: number) {
  const columns: PortfolioAsset[][] = Array.from({ length: count }, () => []);
  const heights = new Array(count).fill(0);

  for (const asset of assets) {
    const size = frameSize(asset.title);
    let shortest = 0;
    for (let i = 1; i < count; i += 1) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(asset);
    // Unknown dimensions are counted as a portrait-ish frame so they still land fairly.
    heights[shortest] += size ? size.h / size.w : 1.2;
  }

  return columns;
}

function PortfolioPage({ cv, linkHome }: { cv: CV; linkHome: { href: string; onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void } }) {
  const [viewerAsset, setViewerAsset] = useState<PortfolioAsset | null>(null);
  const [viewerError, setViewerError] = useState(false);
  const [visible, setVisible] = useState(PAGE_INITIAL);
  const [settled, setSettled] = useState(0);
  const [ready, setReady] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const total = portfolioAssets.length;
  const firstBatch = Math.min(PAGE_INITIAL, total);
  const shown = portfolioAssets.slice(0, visible);
  const columnCount = useColumnCount();
  const columns = useMemo(() => distributeIntoColumns(shown, columnCount), [shown, columnCount]);

  const openPreview = (asset: PortfolioAsset) => {
    setViewerError(false);
    setViewerAsset(asset);
  };

  const closePreview = () => {
    setViewerError(false);
    setViewerAsset(null);
  };

  // Reveal once the opening grid has settled — counted whether assets loaded or
  // failed, so one broken file cannot hold the spinner open.
  useEffect(() => {
    if (settled >= firstBatch) setReady(true);
  }, [settled, firstBatch]);

  // A ceiling on the wait, so a stalled request never traps the visitor.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOADER_CEILING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Extend the grid as the end of it comes into view, well before it is reached.
  // Depends on `ready` too: the sentinel is not in the tree until the loader clears.
  useEffect(() => {
    if (!ready) return;
    const node = sentinel.current;
    if (!node || visible >= total) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible((count) => Math.min(count + PAGE_BATCH, total));
      }
    }, { rootMargin: '900px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, visible, total]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreview();
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  return (
    <section className="portfolio-page-wrap">
      <section className="portfolio-page-head section-pad">
        <div className="section-kicker"><span>01</span><span>Portfolio archive</span></div>
        <div className="portfolio-page-title">
          <div>
            <h1>Selected<br /><em>work.</em></h1>
            <p className="portfolio-page-intro">Field production, visual direction, image systems, motion studies and sound-led editorial work.</p>
          </div>
          <div className="portfolio-page-actions">
            <a className="button button-primary" {...linkHome}>Back to studio <ArrowDownRight size={14} /></a>
            <a className="button button-quiet" href={`mailto:${cv.email}`}>Commission <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </section>

      <div className="portfolio-page-body section-pad">
        {!ready && (
          <div className="portfolio-loader" role="status" aria-live="polite">
            <span className="portfolio-loader-ring" />
            <span className="portfolio-loader-text">Loading archive</span>
          </div>
        )}
        <div className={`portfolio-masonry${ready ? ' is-ready' : ''}`} aria-busy={!ready}>
          {columns.map((column, columnIndex) => (
            <div className="portfolio-masonry-column" key={columnIndex}>
              {column.map((asset) => (
                <PortfolioPageCard
                  key={asset.title}
                  asset={asset}
                  onOpen={() => openPreview(asset)}
                  onSettled={() => setSettled((count) => count + 1)}
                />
              ))}
            </div>
          ))}
        </div>
        {ready && visible < total && <div ref={sentinel} className="portfolio-sentinel" aria-hidden="true" />}
      </div>

      {viewerAsset && (
        <div className="media-viewer-backdrop" onClick={closePreview} role="dialog" aria-modal="true" aria-label={`Preview ${viewerAsset.title}`}> 
          <div className="media-viewer-shell" onClick={(event) => event.stopPropagation()}>
            <button className="media-viewer-close" type="button" onClick={closePreview} aria-label="Close preview">
              <X size={18} />
            </button>
            <div className="media-viewer-frame">
              {viewerError ? (
                <div className="media-viewer-error">
                  <div className="media-viewer-error-icon">!</div>
                  <h3>Media could not be loaded</h3>
                  <p>The requested visual asset is unavailable or the cloud source did not respond.</p>
                  <button className="button button-quiet" type="button" onClick={closePreview}>Return to archive</button>
                </div>
              ) : viewerAsset.kind === 'photo' ? (
                <img src={viewerAsset.asset} alt={viewerAsset.title} onError={(event: SyntheticEvent<HTMLImageElement>) => {
                  event.currentTarget.onerror = null;
                  setViewerError(true);
                }} />
              ) : (
                <video muted loop playsInline controls autoPlay src={viewerAsset.asset} poster={viewerAsset.poster} onError={(event: SyntheticEvent<HTMLVideoElement>) => {
                  event.currentTarget.onerror = null;
                  setViewerError(true);
                }} />
              )}
            </div>
            <div className="media-viewer-details">
              <div className="media-viewer-meta">
                <span>{viewerAsset.location}</span>
                <span>{viewerAsset.summary}</span>
              </div>
            </div>
          </div>
        </div>
      )}


    </section>
  );
}

export default App;
