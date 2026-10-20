import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Download } from 'lucide-react';
import { cv as bundledCv } from '../../server/src/data/cv';
import { Home } from './home/Home';
import { WorkPage } from './work/WorkPage';
import { CV_PDF, HERO_FRAMES, byNumber, mediaFor, prefersReducedMotion } from './media';
import { setSpill, useFluid } from './suite/spill';
import type { CV, LinkTo, Route } from './types';

// The site is two real pages sharing one bundle. Routes are history-backed so the
// work page is linkable, survives a refresh, and works with the back button.
const ROUTE_PATH: Record<Route, string> = { home: '/', portfolio: '/portfolio' };

const routeFromPath = (pathname: string): Route => {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  return clean === '/portfolio' ? 'portfolio' : 'home';
};

/**
 * Runs a route change inside a view transition where the browser has one, so the
 * old page sinks back while the new one comes forward. Elsewhere, an instant cut.
 */
function transition(update: () => void) {
  const start = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition;
  if (!start || prefersReducedMotion()) {
    update();
    return;
  }
  start.call(document, () => flushSync(update));
}

/**
 * Seeks a section and hands it keyboard focus, so the next Tab continues from
 * there rather than from the link that was pressed.
 */
function seek(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

function isValidCv(payload: unknown): payload is CV {
  const value = payload as Partial<CV> | null;
  return !!value && Array.isArray(value.experience) && Array.isArray(value.skills) && Array.isArray(value.languages) && !!value.education;
}

function App() {
  // The bundled CV paints immediately; the API, when it answers, replaces it. A
  // recruiter never waits on a request to see the page.
  const [cv, setCv] = useState<CV>(bundledCv as CV);
  const [page, setPage] = useState<Route>(() => routeFromPath(window.location.pathname));
  const [search, setSearch] = useState(() => window.location.search);
  // Set when a navigation also carries a hash, so the scroll effect below knows to
  // seek a section instead of jumping to the top.
  const pendingHash = useRef<string | null>(window.location.hash.slice(1) || null);
  // Where the visitor was on the page they are returning to with Back.
  const pendingScroll = useRef<number | null>(null);
  const firstRender = useRef(true);
  const pageRef = useRef(page);
  const surround = useRef<HTMLDivElement>(null);
  const fluidCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch('/api/cv')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`CV API returned ${response.status}`))))
      .then((payload: unknown) => {
        // The API usually serves the very CV that is bundled; re-rendering the whole
        // site for identical data would only cost a phone's main thread.
        if (isValidCv(payload) && JSON.stringify(payload) !== JSON.stringify(bundledCv)) setCv(payload);
      })
      .catch((error: unknown) => {
        console.warn('Using the bundled CV:', error instanceof Error ? error.message : error);
      });
  }, []);

  useEffect(() => {
    // The app restores scroll itself, so the browser's own restoration cannot fight it.
    window.history.scrollRestoration = 'manual';
    const onPopState = (event: PopStateEvent) => {
      pendingHash.current = window.location.hash.slice(1) || null;
      // Only a return to another page restores an offset; Back within a page
      // (a skip link, a section link) leaves the browser where it is.
      const leaving = routeFromPath(window.location.pathname) !== pageRef.current;
      pendingScroll.current = leaving && typeof event.state?.scrollY === 'number' ? event.state.scrollY : null;
      setSearch(window.location.search);
      setPage(routeFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    pageRef.current = page;
    // Wait a frame so the page has laid out before seeking within it. The pending
    // values are read inside the frame and the frame is cancelled on cleanup, so a
    // second run of this effect (StrictMode in development) cannot consume them twice.
    const frame = requestAnimationFrame(() => {
      const hash = pendingHash.current;
      const scroll = pendingScroll.current;
      const initial = firstRender.current;
      pendingHash.current = null;
      pendingScroll.current = null;
      firstRender.current = false;
      if (hash) {
        seek(hash);
        return;
      }
      window.scrollTo({ top: scroll ?? 0 });
      // A new page is announced by moving focus to its content, not left on <body>.
      if (!initial) document.getElementById('main')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [page]);

  // The room starts lit by the first frame the home monitor shows.
  useEffect(() => {
    const first = mediaFor(byNumber(HERO_FRAMES[0].number));
    setSpill(first.spill, undefined, first.accent);
  }, []);

  // The fluid surround is its own small chunk, fetched after first paint. Until it
  // runs, and wherever WebGL is missing or lost, the CSS pools light the room.
  useEffect(() => {
    const canvas = fluidCanvas.current;
    const shell = surround.current;
    if (!canvas || !shell) return;
    let cancelled = false;
    let fluid: import('./suite/fluidSurround').Fluid | null = null;
    const stop = () => {
      shell.classList.remove('is-fluid');
      useFluid(null);
    };
    canvas.addEventListener('fluidlost', stop);
    void import('./suite/fluidSurround').then(({ createFluid }) => {
      if (cancelled) return;
      try {
        fluid = createFluid(canvas, '#474747', prefersReducedMotion());
      } catch {
        fluid = null;
      }
      if (!fluid) return;
      shell.classList.add('is-fluid');
      useFluid(fluid);
    });
    return () => {
      cancelled = true;
      canvas.removeEventListener('fluidlost', stop);
      stop();
      fluid?.destroy();
    };
  }, []);

  useEffect(() => {
    document.title = page === 'portfolio' ? 'Work | Marouane Bouakba' : 'Marouane Bouakba | Content producer, video editor, director of photography';
  }, [page]);

  const navigate = (next: Route, hash?: string, query = '') => {
    if (page === next && !query) {
      // Same page: no history entry, just seek.
      if (hash) seek(hash);
      else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        document.getElementById('main')?.focus({ preventScroll: true });
      }
      return;
    }
    pendingHash.current = hash ?? null;
    pendingScroll.current = null;
    // Remember where this page was left, so Back returns to the same place.
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '');
    window.history.pushState({ route: next }, '', `${ROUTE_PATH[next]}${query}${hash ? `#${hash}` : ''}`);
    transition(() => {
      setSearch(query);
      setPage(next);
    });
  };

  // Real href for every navigation, with the click intercepted for instant
  // client-side routing. Middle-click and open-in-new-tab still work.
  const linkTo: LinkTo = (next, hash, query = '') => ({
    href: `${ROUTE_PATH[next]}${query}${hash ? `#${hash}` : ''}`,
    onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      navigate(next, hash, query);
    },
  });

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="surround" ref={surround} aria-hidden="true">
        <canvas className="surround-fluid" ref={fluidCanvas} />
        <span className="spill spill--a" />
        <span className="spill spill--b" />
        <span className="spill spill--c" />
      </div>
      <header className="console-bar">
        <a className="brand" aria-label="Marouane Bouakba, home" {...linkTo('home')}>
          <span className="brand-mark" aria-hidden="true"><span>M</span><span>B</span></span>
          <span className="brand-name">Marouane<br />Bouakba</span>
        </a>
        {/* The bar carries one action, the CV; the pages link to each other in place. */}
        <a className="key key--signal console-cv" href={CV_PDF} download>
          <span className="console-cv-long">Download CV</span><span className="console-cv-short">CV</span>
          <Download size={16} aria-hidden="true" />
        </a>
      </header>

      <main id="main" tabIndex={-1}>
        {page === 'portfolio' ? <WorkPage cv={cv} linkTo={linkTo} search={search} /> : <Home cv={cv} linkTo={linkTo} />}
      </main>

      <section className="terms" aria-labelledby="terms-title">
        <div className="terms-inner">
          <h2 className="terms-title" id="terms-title">Terms &amp; conditions</h2>
          <p>Every film, video and still shown on this site remains the sole property of the client it was produced for. Nothing here transfers ownership, licence or any other right, and no piece may be reused without that client's permission.</p>
          <p>The work appears for one reason only: to show the skills and experience I bring to a production. No client has endorsed, sponsored or approved this site, and nothing here should be read as a partnership or affiliation.</p>
          <p>All brand names, logos and trademarks remain the property of their respective owners.</p>
        </div>
      </section>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Marouane Bouakba</span>
        <span>Doha · Algiers · Everywhere</span>
        <a href={`mailto:${cv.email}`}>{cv.email}</a>
      </footer>
    </div>
  );
}

export default App;
