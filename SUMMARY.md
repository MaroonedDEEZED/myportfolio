# Codebase Summary — Marouane Bouakba Portfolio

A personal portfolio site for **Marouane Bouakba**, a content producer, video editor and director of photography based in Doha. It is a TypeScript "MERN-style" app: a React 19 + Vite single-page client, an Express API for local dev, Vercel serverless functions for production, and optional MongoDB storage.

---

## 1. Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, `lucide-react` icons, plain CSS (no framework), raw WebGL2 for the 3D colour cloud (no three.js) |
| Backend (local) | Express 4, `cors`, `dotenv`, Mongoose 8 (optional) |
| Backend (prod) | Vercel serverless functions in `api/` |
| Media hosting | Small web versions built from the originals by `npm run media` (`client/public/portfolio-media/`, git-ignored), falling back to the two shared Dropbox folders (`raw=1` links), which were returning "Link Temporarily Disabled" on 2026-10-20. Hero frames, a poster and a colour sample for every piece are built by `npm run suite` and committed (`client/public/suite/`). |
| Email | EmailJS REST API, called **server-side only** |
| Fonts | Mona Sans and Martian Mono, self-hosted variable woff2 (`client/src/fonts/`) |

---

## 2. Project structure

```
myportfolio/
├── api/                        # Vercel serverless functions (production)
│   ├── contact.ts              #   POST /api/contact → shared mailer
│   └── cv.ts                   #   GET  /api/cv      → bundled CV data
├── server/src/                 # Express server (local dev / self-hosted)
│   ├── index.ts                #   routes, static serving, Mongo connection
│   ├── mailer.ts               #   contact validation, rate limit, EmailJS send
│   ├── data/cv.ts              #   CV content (single source of truth)
│   └── models/Portfolio.ts     #   Mongoose model {slug, payload, updatedAt}
├── scripts/
│   ├── prepare-media.mjs       # originals in media/ → web versions + mediaManifest.json
│   └── prepare-suite.mjs       # hero frames, posters, colour samples, spill colours
├── client/
│   ├── index.html              # Vite entry HTML; preloads the first monitor frame on /
│   ├── vite.config.ts          # root=client, /api proxy → :5000, fills the preload href
│   ├── public/
│   │   ├── suite/              # committed: frames/, posters/, samples/ (content-hashed)
│   │   └── portfolio-media/    # git-ignored web versions (thumbs, stills, previews, films)
│   └── src/
│       ├── main.tsx, App.tsx   # root, hand-rolled routing, console bar, terms, footer
│       ├── media.ts            # where each piece is served from, measurements, hooks
│       ├── depth.ts            # pointer tilt for frames
│       ├── styles.css          # the whole design system (tokens on :root)
│       ├── fonts/              # self-hosted woff2
│       ├── suite/              # scopeRenderer.ts (WebGL2), ColourScope.tsx, spill.ts,
│       │                       # suiteData.json (generated)
│       ├── home/               # Suite (hero), Formats, PointOfView, Pipeline, Career,
│       │                       # Education, Contact
│       ├── work/               # WorkPage (archive), Viewer (dialog)
│       ├── portfolioAssets.ts  # Registry of 60 assets (Dropbox raw links)
│       ├── portfolioSizes.ts   # Intrinsic width/height per asset
│       ├── portfolioPosters.ts # Per-video crop/start-offset fixes
│       └── mediaUrls.ts, fallbackCv.ts, generatePortfolioAssets.*, updatePortfolioAssets.py
│                               # legacy, unused by the current UI
├── email-templates/
│   ├── visitor-confirmation.html  # HTML pasted into the EmailJS template
│   └── preview.html               # Browser preview of that email + settings notes
├── vercel.json                 # Builds client only; SPA rewrite except /api/*; cache headers
├── tsconfig.json               # Project references → client + server
└── .env.example                # PORT, MONGODB_URI, EMAILJS_* keys
```

---

## 3. Running & building

```bash
npm install
npm run dev        # concurrently: tsx watch server (:5000) + vite client (:5173)
npm run build      # vite build → dist/client, tsc server → dist/server
npm start          # node dist/server/index.js (serves API + built client)
```

**Environment variables** (`.env`, see `.env.example`):

| Var | Purpose |
|---|---|
| `PORT` | Express port (default 5000) |
| `MONGODB_URI` | Optional. If set and reachable, `/api/cv` serves the stored document |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY` | All four are needed for the contact form to send |

**Deployment (Vercel):** `vercel.json` builds only the client (`npm run build:client` → `dist/client`). The `api/*.ts` files become serverless functions, and every non-`/api` path rewrites to `index.html` so `/portfolio` survives a refresh.

---

## 4. Backend

### API surface

| Route | Express (`server/src/index.ts`) | Vercel (`api/`) |
|---|---|---|
| `GET /api/health` | ✅ status, DB state, mail-config state | ❌ not present |
| `GET /api/cv` | Mongo doc `slug: 'marouane-bouakba'` if connected, else bundled `cv` | Always bundled `cv` (no Mongo) |
| `POST /api/contact` | ✅ rate limit → `sendContactMessage` | ✅ same, plus manual body parsing |
| Other verbs on `/api/contact` | 405 JSON | 405 JSON |
| Unknown `/api/*` | 404 JSON | (Vercel default) |
| Everything else | Static `dist/client` + SPA fallback to `index.html` | Handled by `vercel.json` rewrite |

### `mailer.ts`: contact pipeline

Both the Express route and the Vercel function call this one module, so validation can't drift between them. The client never imports it, which keeps the EmailJS private key out of the browser bundle.

1. **Honeypot:** if the hidden `company` field has a value, the function returns `{ok:true}` and sends nothing, so a bot gets no signal that it was caught.
2. **Validation:** fields are trimmed, and newlines are collapsed in single-line fields to block header injection. Limits:
   - name: required, ≤120 chars
   - email: required, ≤200 chars, loose `x@y.z` shape
   - phone: optional, ≤60 chars
   - message: 5–5000 chars
3. **Rate limit:** an in-memory sliding window of **5 messages per 10 minutes per client IP** (taken from `x-forwarded-for`). The code's own comments call it best-effort: each serverless instance keeps its own map.
4. **Send:** a `POST` to `api.emailjs.com` with a 10 s timeout and a forced `Origin` header (EmailJS rejects requests that have none). Template params: `name`, `email`, `contact` (email · phone), `message`.
5. **Error mapping:** 400 for validation errors, 503 when env vars are missing, 429 when EmailJS rate-limits, 502 for any other failure. Visitors see friendly messages; the details go to the server log.

### Email flow

According to `email-templates/visitor-confirmation.html`, the EmailJS template sends **to the visitor** (`{{email}}`) with the subject *"Your story is in my inbox"*. It sets Reply-To and CC to `bouakbamarouane@gmail.com`, so the studio gets a copy of every enquiry.

### Data model

`Portfolio`: `{ slug: string (unique), payload: Mixed, updatedAt: Date }`. Nothing in the repo writes to it; a document has to be inserted by hand to override the bundled CV.

---

## 5. Frontend: "The Grading Suite"

The site is designed as a colourist's grading suite (redesign of 2026-10-20; direction and decisions in `.impeccable/surfaces/client-src-app-tsx.md`, design system in `DESIGN.md`).

### Routing and shell

There's no router library. Two history-backed routes: `/` (home) and `/portfolio` (the work archive). `linkTo()` returns a real `href` plus client-side navigation; modifier and middle clicks still open tabs. Route changes run inside a view transition where supported, move focus to `#main`, and Back restores the scroll position of the page being returned to. The console bar holds only the MB mark (home) and Download CV, the site's only CV link; it is sticky on every route. Pages link to each other in place: See all 60 pieces and the films rail on home, Back home on the work page.

### Data loading

The CV bundled from `server/src/data/cv.ts` renders immediately; `/api/cv` replaces it only when the payload is valid and actually differs.

### Home page

1. **The suite (hero):** "Stories with signal.", byline, intro and See all 60 pieces (the CV is downloaded from the console bar only). Below, a reference monitor (16:9 glass, frame-line corners on the picture, a status line of measured facts in the bezel) cycles eight curated frames every 7 s; beside it the **colour cloud**: 6,400 real pixels of the frame on the monitor plotted in 3D by raw WebGL2, switchable between an RGB colour cube, a YCbCr vectorscope and a luma waveform, turnable by drag, arrow keys or turn keys. A Hold key stops both the frame cycle and the cloud's turn.
2. **From phone to broadcast:** a rail of vertical films with hover previews and a tally (33 vertical, 2 widescreen, 25 stills, measured from the files).
3. **Point of view:** portrait and manifesto.
4. **Wide lens. Deep craft.:** the skill groups as a tilted node graph, in the order work moves (production management → cinematography → post and motion → audio → final master). The software list is not shown.
5. **Seven years on set and in the suite:** the 10 roles as a list.
6. **Formed by the language of frames:** education and languages.
7. **Have a story in mind?:** direct details and the contact form.
8. Terms and footer on every route.

The page's surround is **lit by monitor spill**: three pools of light in the colours of the piece on screen drift across the grey (`suite/spill.ts`, `.surround` in `styles.css`), held to one luminance so text contrast never drops.

### Work page

A single list of all 60 pieces in archive order, placed as streaming masonry (`placeFrames` in `WorkPage.tsx`: shortest column, frames never move as batches arrive), with All / Films / Stills filters. Cards show the hosted thumb or the committed poster, and only hosted 6-second cuts as hover previews: a card never loads an original. The viewer is a portal dialog (page made inert) with the piece on the monitor, its own colour cloud, prev/next and Escape; `?open=N` deep links open a piece directly.

### Media rules

- Pieces are named only by number (01 to 60), with measured facts (kind, size, aspect, running time). Source file names carry client names and never reach the page; generated web files are named by number too.
- Colour samples, posters and frames are precomputed, so the cloud never depends on a host allowing canvas reads.
- Hosted web version → Dropbox original → honest error, in the hero film and the viewer.

### Contact form (client side)

A controlled form that posts JSON to `/api/contact`. Native `required`/`maxLength` give instant feedback; the server's validation is what counts. Idle/sending/sent/error states, a `role="status"` notice, and a hidden honeypot field.

---

## 6. Design system

See `DESIGN.md`. In short: a neutral grading-room console (graphite keys with LEDs, black monitor glass) over a surround lit by the work's own colours; Mona Sans (variable width) for statements and engraved legends, Martian Mono for measurements only; one orange (#f06d36) for the MB mark, selection and the primary action.

---

## 7. Content snapshot

- **Assets:** 60 in total, 35 videos and 25 stills. Videos and stills are interleaved by `updatePortfolioAssets.py`. Clients include Hamoud Boualem, Djezzy, OMO, Ottoman, Gharrafa and others.
- **CV:** 10 roles from 2019 to Sep 2026 in Algiers and Doha, 5 skill groups, and 3 languages (Arabic native; English and French proficient).

---

## 8. Observations & cleanup candidates

| # | Issue | Where |
|---|---|---|
| 1 | `fallbackCv.ts`, `mediaUrls.ts` and the three generator scripts are unused by the current UI. `fallbackCv.ts` is also out of date. | `client/src/` |
| 2 | Production media hosting is undecided: `portfolio-media/` is git-ignored, and the Dropbox links were disabled on 2026-10-20. Without hosted web versions, films in the viewer depend on Dropbox. | `scripts/prepare-media.mjs`, `.gitignore` |
| 3 | Re-running `npm run suite` regenerates the committed images without their embedded provenance; re-embed afterwards. | `client/public/suite/` |
| 4 | Vercel and Express differ: production has no `/api/health`, and `/api/cv` there never reads MongoDB. | `api/` vs `server/src/index.ts` |
| 5 | `@types/express` is v5 while `express` is v4. | `package.json` |
| 6 | The CV data gives EL Djazair N1 TV as "2019 - 2020"; the PDF gives "Sep 2019 – Feb 2020". | `server/src/data/cv.ts` |
| 7 | No tests, linting or CI config. (The project became a git repo on 2026-10-19, with `.gitattributes` keeping binary assets out of line-ending conversion.) | root |
