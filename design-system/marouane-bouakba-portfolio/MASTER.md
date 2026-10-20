# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/marouane-bouakba-portfolio/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **SOURCE OF TRUTH:** The tokens below mirror the root `DESIGN.md`, which is normative for visual values (Impeccable reads it too). If they ever disagree, `DESIGN.md` wins: update this file to match rather than the other way round. Product context lives in `PRODUCT.md`.

---

**Project:** Marouane Bouakba Portfolio
**Generated:** 2026-10-19 20:39:25 (UI UX Pro Max v2.13.0). Tokens aligned to the shipped site on 2026-10-19.
**Category:** Creative portfolio: cinematographer / video producer (primary visitor: employers and recruiters)
**Stack:** React 19 + Vite + TypeScript, plain CSS (`client/src/styles.css`), `lucide-react` icons

---

## Global Rules

### Color Palette

The existing CSS variables on `:root` are the implementation. The `--color-*` names map the UI UX Pro Max roles onto them.

| Role | Hex | Project variable | Name (DESIGN.md) |
|------|-----|------------------|------------------|
| Background | `#111C1D` | `--ink` | Darkroom Ink |
| Raised surface | `#172426` | `--ink-raised` | Ink Raised (tile bars, lightbox) |
| Hover surface | `#1E2D2E` | `--ink-overlay` | Ink Overlay |
| Foreground | `#E8E9DE` | `--paper` | Proof Paper |
| Muted Foreground | `#9BA8A3` | `--muted` | Faded Silver |
| Border | `rgba(232,233,222,.18)` | `--line` | Hairline |
| Accent/CTA (dark ground only) | `#F06D36` | `--orange` | Signal Orange |
| On Accent/CTA | `#111C1D` | `--ink` | Darkroom Ink |
| Accent on light panels | `#933A14` | `--orange-deep` | Signal Deep |
| Secondary | `#BAD6BF` | `--mint` | Fixer Mint |
| On Secondary | `#111C1D` | `--ink` | Darkroom Ink |
| Primary button on mint | `#111C1D` fill, `#E8E9DE` text | `--ink` / `--paper` | Hover: Signal Deep |
| Light panel | `#E8E9DE → #C8D8CB` (135°) | `--paper` → `--sage` | Wash Sage gradient |
| Muted on light | `#48554F` | `--slate` | Slate |
| Destructive (on light) | `#A3221A` | `--error` | Error (with a circled "!" mark) |
| Destructive (on dark) | `#FF8A7A` | `--error-on-dark` | Error on Dark |
| Card | `rgba(232,233,222,.035)` | — | Paper wash on ink |
| Ring / focus | `#F06D36` on dark, `#111C1D` on mint | `--orange` / `--ink` | 2px outline, 3px offset |

**Color Notes:** Filmic and low-saturation. Signal Orange is the only chromatic accent and marks things (CTA, indexes, one emphasised word, hover) rather than filling them, on dark ground only. On light panels, text is ink, Slate, or Signal Deep where the orange voice is needed. The hero's orange glow is held to 6%.

#### Verified contrast (WCAG 2.x)

| Pair | Ratio | Verdict |
|------|-------|---------|
| Proof Paper on Darkroom Ink | 14.19 | AAA |
| Proof Paper on Ink Raised / Ink Overlay | 13.02 / 11.66 | AAA |
| Fixer Mint on Darkroom Ink / Ink on Mint | 11.14 | AAA |
| Contact button (ink) edge against Mint | 11.14 | Passes 3:1 |
| Faded Silver on Darkroom Ink | 7.06 | AAA |
| Error on Dark on Darkroom Ink | 7.59 | AAA |
| Slate on Paper / Sage / Mint | 6.38 / 5.26 / 5.01 | AA |
| Signal Deep on Paper / Sage / Mint | 6.00 / 4.95 / 4.71 | AA |
| Error on Paper / Sage / Mint | 6.12 / 5.05 / 4.80 | AA |
| Paper text on the Signal Deep hover fill | 6.00 | AA |
| Signal Orange on Ink / Ink on Orange | 5.75 | AA |
| Input focus border (Signal Deep) vs focused field | 6.09 | Passes 3:1 |
| Input border (ink 55%) vs Mint | ~3.4 | Passes 3:1 |

Every text and control pair on the site now passes. These pairs were fixed on 2026-10-19:
- paper on orange, 2.47 (Education number and ISMAS label, now ink);
- orange on sage, 2.04 (kickers, skill numbers and "Deep craft.", now Signal Deep);
- slate on the old deep sage, 2.93 (gradient end and Slate changed);
- the orange button's edge on mint, 1.94 (now ink);
- ink at 67% on orange, 3.44 (ISMAS detail);
- ink at 50% on mint, 2.97 ("optional" label);
- ink at 45% for placeholders, 2.72 (now 65%).

### Typography

- **Display / Headings:** Manrope 800, extreme negative tracking (−0.07em to −0.075em), line-height 0.87–0.91
- **Accent:** Playfair Display italic 600, for **one** emphasised phrase per heading only
- **Body:** Manrope 400, 15px / 1.75 (13–14px for secondary copy)
- **Labels / metadata:** DM Mono 400, 9–11px, uppercase, 0.08em+ tracking
- **Mood:** cinematic, composed, editorial, contact-sheet, poster-scale type, mono metadata
- **Google Fonts:** [Manrope + DM Mono + Playfair Display](https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600;1,700&display=swap)

**CSS Import (already in `styles.css`):**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600;1,700&display=swap');
```

| Role | Size | Notes |
|------|------|-------|
| Display (h1) | `clamp(68px, 8.4vw, 132px)` | 64px at ≤450px |
| Headline (h2) | `clamp(48px, 6vw, 85px)` | |
| Lead | `clamp(23px, 2.5vw, 35px)` | −0.04em |
| Title (h3) | 20–28px, 700 | −0.04 to −0.05em |
| Body | 15px / 1.75 | measure ~405–460px |
| Label | 10px DM Mono | uppercase |

### Spacing Variables

Spacing is spacious and editorial. Use the observed values below and don't introduce a new scale.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-tile` | `14px` | Contact-sheet feed gap, button padding (14×17) |
| `--space-masonry` | `16px` | Archive masonry gap, kicker gap |
| `--space-form` | `20px` | Form field and grid gaps |
| `--space-kicker` | `53px` | Below section kicker (35px at ≤850px) |
| `--space-section-y` | `100–120px` | Section vertical padding (75–90px at ≤850px) |
| `--space-section-x` | `10vw` | Section horizontal gutter (6vw at ≤850px) |

### Shadow Depths

The system is flat. Use these four shadows only, with no generic `shadow-sm/md/lg` scale.

| Level | Value | Usage |
|-------|-------|-------|
| Print offset | `18px 18px 0 rgba(240,109,54,.9)` | Hero portrait frame only (10px at ≤450px) |
| Shape offset | `15px 15px 0 rgba(17,28,29,.16)` | Ambient cube on sage panels |
| Overlay lift | `0 30px 80px rgba(0,0,0,.8)` | Lightbox shell |
| Toast lift | `0 16px 40px rgba(0,0,0,.3)` | Fixed warning toast |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.button-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--orange);
  color: var(--ink);
  padding: 14px 17px;
  border: 1px solid transparent;
  border-radius: 0;
  font: 10px 'DM Mono', monospace;
  text-transform: uppercase;
  transition: background 200ms ease;
  cursor: pointer;
}
.button-primary:hover { background: var(--paper); }

/* Quiet (secondary) Button */
.button-quiet {
  background: transparent;
  color: var(--mint);
  border: 1px solid var(--line);
  padding: 14px 17px;
  border-radius: 0;
  font: 10px 'DM Mono', monospace;
  text-transform: uppercase;
  transition: border-color 200ms ease;
  cursor: pointer;
}
.button-quiet:hover { border-color: var(--mint); }

/* Both, keyboard */
.button:focus-visible { outline: 2px solid var(--orange); outline-offset: 3px; }
```

### Cards (portfolio tile)

```css
.pf-tile {
  background: rgba(232, 233, 222, .035);
  border: 1px solid var(--line);
  border-radius: 0;
  padding: 0;
  transition: border-color 220ms ease, background 220ms ease;
  cursor: pointer;
}
.pf-tile:hover, .pf-tile:focus-visible {
  border-color: var(--orange);
  background: rgba(240, 109, 54, .06);
}
/* Media zooms inside an overflow-hidden frame (no layout shift) */
.pf-tile:hover .pf-tile-media img { transform: scale(1.035); }
```

### Inputs (on the Fixer Mint panel)

```css
.field input, .field textarea {
  padding: 13px 14px;
  background: rgba(255, 255, 255, .34);
  border: 1px solid rgba(17, 28, 29, .55);
  border-radius: 0;
  color: var(--ink);
  font: 15px 'Manrope', sans-serif;   /* keep ≥16px on phones to avoid iOS zoom */
  transition: border-color 200ms ease, background 200ms ease;
}
.field input:focus, .field textarea:focus {
  border-color: var(--orange-deep);
  background: rgba(255, 255, 255, .55);
  outline: none;
}
```

### Modals (media lightbox)

```css
.media-viewer-backdrop {
  background: rgba(17, 28, 29, .84);
  backdrop-filter: blur(7px);
}
.media-viewer-shell {
  background: var(--ink-raised);
  border: 1px solid var(--line);
  border-radius: 0;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .8);
  width: min(960px, calc(100vw - 48px));
}
```

---

## Style Guidelines

**Style:** "The Contact Sheet": cinematic dark editorial, flat, colour-blocked (see `DESIGN.md` → Overview)

**Keywords:** darkroom, proof sheet, hairline frames, numbered frames, mono metadata, poster type, single orange mark, sage wash, flat with hard offset

**Best For:** Showing moving-image craft to hiring decision-makers. The work leads and the interface recedes.

**Key Effects:**
- Blurred colour placeholders (LQIP) that fade out on paint, with aspect ratios reserved up front
- Hover-to-preview video (hover-capable pointers only, never under reduced motion)
- 18px `revealUp` entrances on `cubic-bezier(.2,.75,.25,1)`
- Slow ambient drift shapes on sage panels

### Page Pattern

**Pattern Name:** Hero-Centric Portfolio + CV

- **Conversion Strategy:** The visitor is usually a recruiter, so the hiring next step (Download CV, Start a conversation) must be reachable from every route and viewport. The work is the proof, so put it above any claims. Keep the hero static under reduced motion. Videos stay muted and never autoplay on load.
- **CTA Placement:** Hero action row + persistent topbar CTA ("Start a conversation") + contact form at the end of Home
- **Section Order (Home):** Hero (headline, intro, portrait, CTAs) > 01 Portfolio feed > 02 Point of view > 03 Experience archive > 04 Toolkit > 05 Education > 06 Contact > Terms
- **Section Order (/portfolio):** Masthead (title, intro, Back / Commission) > streaming masonry archive > lightbox

---

## Anti-Patterns (Do NOT Use)

- ❌ Rounded corners on buttons, tiles, inputs, chips or the viewer (the system is 0px)
- ❌ Blurred drop shadows on resting surfaces (use flat surfaces, or the hard offset)
- ❌ A second chromatic accent, or Signal Orange as a large fill on dark sections
- ❌ Proof Paper, Faded Silver or Signal Orange text on light panels (sage, orange, mint); use ink, Slate or Signal Deep
- ❌ An orange button on the mint panel (1.9:1 edge); the primary there is ink
- ❌ Client names, logos or captions on portfolio pieces (the work stays unattributed)
- ❌ Autoplaying video on load; hover previews for touch or reduced-motion users
- ❌ Slow video player (media must not block first paint; keep `preload="none"` and the poster/LQIP pipeline)

### Additional Forbidden Patterns

- ❌ **Emojis as icons:** use Lucide (already installed)
- ❌ **Missing cursor:pointer:** all clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers:** animate `transform` and `opacity` only; scale media inside overflow-hidden frames
- ❌ **Low contrast text:** maintain a 4.5:1 minimum (see the verified pairs above)
- ❌ **Instant state changes:** always use transitions (150–300ms)
- ❌ **Invisible focus states:** focus must be visible (orange outline)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (Lucide SVG only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast is at least 4.5:1, especially on the sage, orange and mint panels
- [ ] Focus states visible for keyboard navigation; lightbox closes on Escape
- [ ] `prefers-reduced-motion` respected (no hover previews, no zoom, still loader)
- [ ] Media reserves its aspect ratio and shows an LQIP; no CLS while streaming
- [ ] CV download and a contact route reachable from both routes on mobile
- [ ] Square corners and 1px hairlines everywhere; one Playfair italic phrase per heading
- [ ] Responsive: 375px, 768px, 1024px, 1440px (project breakpoints: 450 / 650 / 850px)
- [ ] No content hidden behind the 82px topbar
- [ ] No horizontal scroll on mobile
