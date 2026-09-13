import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, Film, Menu, MoveRight, Play, X } from 'lucide-react';
import { portfolioAssets, type PortfolioAsset } from './portfolioAssets';
import { posterUrl, stillUrl } from './mediaUrls';
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

function PortfolioTile({ asset, index, onOpen }: { asset: PortfolioAsset; index: number; onOpen: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const slot = slotFor(index);
  const { w, h } = TILE_SIZE[slot];
  const isVideo = asset.kind === 'video';

  // Videos ship as poster only (preload="none"), so a first paint costs no video
  // bytes. Playback starts when the tile is hovered or focused, and rewinds on exit.
  const startPreview = () => {
    if (!isVideo || !previewsOnHover) return;
    void video.current?.play().catch(() => {});
  };

  const stopPreview = () => {
    const element = video.current;
    if (!element) return;
    element.pause();
    element.currentTime = 0;
  };

  return (
    <button
      type="button"
      className={`pf-tile pf-tile--${slot}${isVideo ? ' pf-tile--video' : ''}`}
      onClick={onOpen}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      aria-label={`${isVideo ? 'Video' : 'Photo'} ${String(index + 1).padStart(2, '0')} — open portfolio`}
    >
      <span className="pf-tile-media">
        {isVideo ? (
          <video ref={video} src={asset.asset} poster={posterUrl(asset.poster, w, h)} muted loop playsInline preload="none" />
        ) : (
          <img src={stillUrl(asset.asset, w, h)} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
        )}
        <span className="pf-tile-chip">{isVideo ? <><Play size={10} /> Video</> : 'Photo'}</span>
      </span>
      <span className="pf-tile-bar">
        <span className="pf-tile-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="pf-tile-open">Open <ArrowUpRight size={13} /></span>
      </span>
    </button>
  );
}

function App() {
  const [cv, setCv] = useState<CV | null>(null);
  const [activeFilter, setActiveFilter] = useState('All work');
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState<'home' | 'portfolio'>('home');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

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
        <a className="brand" href="#top" aria-label="Back to top" onClick={() => setPage('home')}><span className="brand-mark"><span>M</span><span>B</span></span><span className="brand-text">Marouane<br />Bouakba</span></a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <button className="nav-link-button" onClick={() => { setPage('home'); setMenuOpen(false); }}>Home</button>
          <button className="nav-link-button" onClick={() => { setPage('portfolio'); setMenuOpen(false); }}>Portfolio</button>
          <button className="nav-link-button" onClick={() => { setPage('home'); setMenuOpen(false); window.location.hash = '#contact'; }}>Contact</button>
        </nav>
        <a className="header-cta" href={`mailto:${cv.email}`}><span>Start a conversation</span><ArrowUpRight size={15} /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main id="top">
        {apiError && <div className="site-warning"><span>{apiError}</span></div>}
        {page === 'portfolio' ? (
          <PortfolioPage cv={cv} onBack={() => setPage('home')} />
        ) : (
          <>
            <section className="hero section-pad">
              <div className="hero-copy">
                <h1>Stories with<br /><em>signal.</em></h1>
                <p className="hero-intro">{cv.intro}</p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#work">Explore the work <ArrowDownRight size={17} /></a>
                  <button className="button button-quiet" onClick={() => setPage('portfolio')}>Open portfolio <ArrowUpRight size={16} /></button>
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
                  <button className="section-link" onClick={() => setPage('portfolio')}>Enter Portfolio Page <ArrowUpRight size={14} /></button>
                </div>
              </div>
              <div className="portfolio-feed">
                {portfolioAssets.slice(0, 4).map((asset, index) => (
                  <PortfolioTile key={asset.title} asset={asset} index={index} onOpen={() => setPage('portfolio')} />
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

function PortfolioPage({ cv, onBack }: { cv: CV; onBack: () => void }) {
  const [viewerAsset, setViewerAsset] = useState<PortfolioAsset | null>(null);
  const [viewerError, setViewerError] = useState(false);
  const portfolioDisplayAssets = portfolioAssets;

  const openPreview = (asset: PortfolioAsset) => {
    setViewerError(false);
    setViewerAsset(asset);
  };

  const closePreview = () => {
    setViewerError(false);
    setViewerAsset(null);
  };

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
            <button className="button button-primary" onClick={onBack}>Back to studio <ArrowDownRight size={14} /></button>
            <a className="button button-quiet" href={`mailto:${cv.email}`}>Commission <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className="portfolio-page-grid section-pad">
        {portfolioDisplayAssets.map((asset) => (
          <article className="portfolio-page-card" key={asset.title}>
            <button className="portfolio-page-card-media" type="button" onClick={() => openPreview(asset)} aria-label={`Open ${asset.title}`}> 
              {asset.kind === 'photo' ? (
                <img src={asset.asset} alt={asset.title} onError={(event: SyntheticEvent<HTMLImageElement>) => {
                  event.currentTarget.onerror = null;
                  setViewerError(true);
                }} />
              ) : (
                <video muted loop playsInline autoPlay src={asset.asset} poster={asset.poster} onError={(event: SyntheticEvent<HTMLVideoElement>) => {
                  event.currentTarget.onerror = null;
                  setViewerError(true);
                }} />
              )}
            </button>
          </article>
        ))}
      </section>

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
