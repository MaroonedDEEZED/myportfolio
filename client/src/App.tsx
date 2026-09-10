import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, Film, Menu, MoveRight, X } from 'lucide-react';

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

function App() {
  const [cv, setCv] = useState<CV | null>(null);
  const [activeFilter, setActiveFilter] = useState('All work');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/cv')
      .then((response) => response.json())
      .then(setCv)
      .catch(() => setCv(null));
  }, []);

  const visibleExperience = useMemo(
    () => cv?.experience.filter((item) => matchesFilter(item, activeFilter)) ?? [],
    [cv, activeFilter],
  );

  if (!cv) {
    return <div className="loading-screen"><span className="loading-mark">MB</span><span>Loading archive...</span></div>;
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Back to top"><span className="brand-mark"><span>M</span><span>B</span></span><span className="brand-text">Marouane<br />Bouakba</span></a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a>
          <a href="#practice" onClick={() => setMenuOpen(false)}>Practice</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <a className="header-cta" href={`mailto:${cv.email}`}><span>Start a conversation</span><ArrowUpRight size={15} /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> Available for selected projects <span className="eyebrow-line" /></div>
            <h1>Stories with<br /><em>signal.</em></h1>
            <p className="hero-intro">{cv.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">Explore the work <ArrowDownRight size={17} /></a>
              <a className="button button-quiet" href="/Visual Arts CV.pdf" download>Download CV <Download size={16} /></a>
            </div>
          </div>
          <div className="hero-art" aria-label="Abstract 3D camera lens composition">
            <div className="art-frame"><div className="art-grid" /><div className="portrait-orbit"><img src="/myimage.jpeg" alt="Marouane Bouakba" /><span>MAROUANE<br />BOUAKBA</span></div><div className="lens-orb"><div className="lens-glass" /><div className="lens-ring ring-a" /><div className="lens-ring ring-b" /><span className="lens-spec">50<br />MM</span></div><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-crosshair" /><span className="art-caption">VISUAL ARTS<br /><strong>01 — 09</strong></span><span className="art-side-label">FRAME / SOUND / MOTION</span><span className="art-hint">rotate the perspective</span></div>
            <div className="hero-index">01 <span /> 04</div>
          </div>
          <div className="hero-meta"><span>Based in {cv.location}</span><span>Working globally</span><span>Visual arts / 2026</span></div>
        </section>

        <section className="manifesto section-pad" id="practice">
          <div className="section-kicker"><span>01</span><span>Point of view</span></div>
          <div className="manifesto-grid"><h2>The frame is only<br /><span>the beginning.</span></h2><div><p className="large-copy">Every project has a frequency. I find it in the rhythm of a cut, the weight of a room, the detail hiding in plain sight.</p><p className="muted-copy">From production floor to final mix, I bring a practical eye and a composed hand to image-making. Cinema, commercial, documentary, brand worlds: the medium shifts. The attention stays.</p></div></div>
        </section>

        <section className="work-section section-pad" id="work">
          <div className="section-heading"><div className="section-kicker"><span>02</span><span>Experience archive</span></div><span className="archive-count">{String(cv.experience.length).padStart(2, '0')} roles indexed</span></div>
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
          <div className="section-kicker"><span>03</span><span>Toolkit</span></div>
          <div className="capability-grid">
            <div className="capability-intro"><h2>Wide lens.<br /><em>Deep craft.</em></h2><p>One practice, many entry points. The work gets stronger when the disciplines speak to one another.</p></div>
            <div className="skill-list">{cv.skills.map((skill, index) => <div className="skill-row" key={skill.label}><span className="skill-number">0{index + 1}</span><div><h3>{skill.label}</h3><p>{skill.detail}</p></div><MoveRight size={18} /></div>)}</div>
          </div>
          <div className="tool-strip"><span>DaVinci Resolve</span><span>Adobe Creative Suite</span><span>Steinberg Nuendo</span><span>Topaz AI Tools</span><span>Canva Pro</span></div>
        </section>

        <section className="education section-pad"><div className="education-card"><div><div className="section-kicker"><span>04</span><span>Formation</span></div><h2>Made in the<br /><em>arts of spectacle.</em></h2></div><div className="edu-detail"><span className="edu-year">ISMAS</span><h3>{cv.education.degree}</h3><p>{cv.education.detail}<br />{cv.education.location}</p></div><div className="language-detail"><span>Languages</span>{cv.languages.map((language) => <p key={language.label}><strong>{language.label}</strong> <small>{language.detail}</small></p>)}</div></div></section>

        <section className="contact section-pad" id="contact"><div className="contact-card"><div className="section-kicker"><span>05</span><span>Next scene</span></div><h2>Have a story<br /><em>in mind?</em></h2><a className="contact-email" href={`mailto:${cv.email}`}>{cv.email} <ArrowUpRight size={22} /></a><div className="contact-bottom"><span>{cv.phone}</span><a href={cv.portfolio} target="_blank" rel="noreferrer">External portfolio <ExternalLink size={14} /></a></div></div></section>
      </main>
      <footer className="footer"><span>© {new Date().getFullYear()} Marouane Bouakba</span><span>Doha · Algiers · Everywhere</span><span>Built for the moving image <Film size={14} /></span></footer>
    </div>
  );
}

export default App;
