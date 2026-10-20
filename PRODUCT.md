# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: employers and recruiters.** They are hiring a full-time content producer, director of photography or video editor, mostly in Doha and the wider GCC. They arrive from a job application, a LinkedIn profile or a shared link. In a short visit they need to decide whether Marouane is worth an interview: is the craft strong, is the experience real and relevant, and can they get the CV.

**Secondary (not prioritised):** brands, agencies and production houses who want to commission work. They use the contact form, but design decisions should favour the hiring visitor when the two pull apart.

## Product Purpose

This is a personal portfolio and CV site for Marouane Bouakba, a content producer, video editor and director of photography based in Doha, Qatar. It shows his moving-image and still work next to a full experience record, so a hiring decision-maker can judge craft and track record in one place.

Success means the visitor leaves convinced enough to take the next step: they download the CV, send a message through the contact form, or invite him to interview.

## Positioning

Three things set Marouane apart, and future work must keep them visible:

1. **The full pipeline in one person.** He takes a project from brief to final master alone: camera, edit, colour grade, motion graphics, sound design, mixing and original music. Most candidates cover one or two of these.
2. **A cinematic eye.** He is a director of photography first, so framing, light and image quality lead. The work itself is the main evidence.
3. **Breadth of formats.** He has 7 years of work across advertising, broadcast, documentary, TV series and branded social content, in both Algeria and Qatar.

## Operating Context

- Visitors usually check the site while weighing a candidate, often on a phone straight from an application or a message.
- There are two routes: `/` (studio home: intro, a feed preview, point of view, experience archive, toolkit, education, contact) and `/portfolio` (the full archive of 60 pieces in streaming masonry with a lightbox).
- A downloadable PDF CV is a primary artefact (`client/public/Marouane_Bouakba_Content_Producer_CV.pdf`).
- Enquiries go through the contact form. The visitor gets a branded confirmation email (EmailJS template in `email-templates/`) and the studio inbox is CC'd.

## Capabilities and Constraints

- **Stack (existing):** React 19 + Vite + TypeScript client. Express API for local dev, Vercel serverless functions in production. Optional MongoDB override of the CV payload.
- **Media:** all portfolio media is served straight from two shared Dropbox folders ("Photos" and "Videos and Ads") through `raw=1` links. The original Cloudinary account (`zsyvfq70`) stopped serving in Oct 2026 (HTTP 401 on every asset). Dropbox does no resizing, so stills load at full size (some over 6 MB), and videos (some 4K) show their own middle frame instead of a generated poster. The Cloudinary helpers in `mediaUrls.ts` remain and take over again if the media moves back to an image CDN.
- **CV data:** comes from `server/src/data/cv.ts`, served via `/api/cv`, with a bundled fallback.
- **Contact:** validation, honeypot and rate limiting run server-side only. The EmailJS private key must never reach the browser.
- **Languages:** Marouane speaks native Arabic and proficient English and French. The site is English-only, and there is no decision yet to localise it.
- **Open decision:** portfolio pieces have no real titles, years, locations or summaries. The registry holds raw filenames and placeholder text. Future work must not invent project facts to fill these.

## Brand Commitments

- **Name and mark:** "Marouane Bouakba", with the rotated orange "MB" monogram.
- **Voice:** first person, calm and crafted, with cinematic metaphor used sparingly. Examples: "Stories with signal.", "The frame is only the beginning.", "Have a story in mind?". The confirmation email continues this voice ("Your story is in my inbox.").
- **Footer line:** "Doha · Algiers · Everywhere".

## Evidence on Hand

- **Portfolio:** 60 pieces of real work (35 videos, 25 stills) hosted in shared Dropbox folders and registered in `client/src/portfolioAssets.ts`.
- **Experience:** 10 roles from 2019 to Sep 2026. They include an institutional film for Air Algérie, the documentary "Maybe One Day", the sitcom "Aziz and Lynda", the series "Leyam" and "Bent Leblad", and Al Asmakh residential campaigns (`server/src/data/cv.ts`).
- **Education:** Bachelor's in Visual Arts, ISMAS, Algiers.
- **Assets:** a portrait photo (`client/public/myimage.jpeg`) and the PDF CV.
- **Absent, and must not be fabricated:** testimonials, client logos, awards, press, view or reach metrics, rates, and per-project credits or captions.

## Product Principles

1. **The work is the argument.** Real footage and stills carry the case. Interface, copy and decoration support the work and never compete with it.
2. **Prove the whole pipeline.** Wherever the site describes capability, show that one person covers camera through final audio, not just a single discipline.
3. **Respect client ownership.** Work stays unattributed: no client names, captions or implied endorsement next to pieces, and the rights notice stays on every route.
4. **Make the hiring next step effortless.** The CV and a way to make contact are always within reach, on every route and every screen size.
5. **Fast on real connections.** Heavy media must never block first paint or shift layout. A recruiter on a phone sees work within seconds.

## Accessibility & Inclusion

- Respect `prefers-reduced-motion`: there are no hover-driven video previews, and ambient motion is held still when it's set.
- Every interactive tile and viewer must be keyboard-reachable, and the lightbox must close on Escape.
