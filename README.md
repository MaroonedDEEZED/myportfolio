# Marouane Bouakba Portfolio

MERN TypeScript portfolio site for Marouane Bouakba, built with React, Vite, Express, TypeScript and an optional MongoDB persistence layer.

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
2. `npm run media` writes small web versions to `client/public/portfolio-media/` and maps them in `client/src/mediaManifest.json`. Both are git-ignored. Without them, every piece falls back to its Dropbox link.
3. `npm run suite` writes the home page's reference-monitor frames and the per-piece colour samples that the 3D colour cloud plots, into `client/public/suite/` and `client/src/suite/suiteData.json`. These are small and committed, so the home page and the colour cloud work on any host.
