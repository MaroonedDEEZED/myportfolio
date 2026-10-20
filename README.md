# Marouane Bouakba Portfolio

MERN TypeScript portfolio site for Marouane Bouakba, built with React, Vite, Express, TypeScript and an optional MongoDB persistence layer. Live at https://marouanebouakba.vercel.app/.

The site is designed as a colourist's grading suite: each piece sits on a reference monitor beside a 3D colour cloud of its own pixels (raw WebGL2), and the page's light and accent colour follow whatever piece is on screen.

## Layout

- `client/`: the React app. `src/home/` and `src/work/` are the two pages, `src/suite/` holds the colour cloud, the fluid surround and the spill/accent logic, `src/styles.css` the whole design system.
- `api/`: Vercel serverless functions for production (`/api/cv`, `/api/contact`).
- `server/`: the Express API for local development, and the CV data (`server/src/data/cv.ts`).
- `scripts/`: the media build scripts described below.
- `email-templates/`: the HTML pasted into the EmailJS template for the contact confirmation email.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` for the Vite client. The API runs at `http://localhost:5000`.

MongoDB is optional. Set `MONGODB_URI` in `.env` to replace the bundled CV payload with a stored portfolio document.

## Media

The original films and stills stay out of git. Two scripts turn them into what the site serves; both need `ffmpeg` and `ffprobe` on the PATH.

1. Put the originals in `media/` (the unpacked "Work Portfolio" archive, or the two Dropbox folders).
2. `npm run media` writes small web versions to `client/public/portfolio-media/` (thumbnails, stills, six-second hover previews, and each film at 1080 px on its long side) and maps them in `client/src/mediaManifest.json`. Both are committed: the site serves every piece itself, so it never depends on Dropbox (whose shared links were disabled in October 2026). To read the originals from another folder, set `MEDIA_SOURCE`, e.g. `MEDIA_SOURCE="../originals" npm run media`.
3. `npm run suite` writes the home page's reference-monitor frames and the per-piece colour samples that the 3D colour cloud plots, into `client/public/suite/` and `client/src/suite/suiteData.json`. These are small and committed, so the home page and the colour cloud work on any host.
