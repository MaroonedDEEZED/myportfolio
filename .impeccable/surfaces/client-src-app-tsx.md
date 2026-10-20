---
version: 1
slug: "client-src-app-tsx"
primary_target: "client/src/App.tsx"
related_targets: ["client/src/styles.css"]
---

# Surface brief: portfolio site, 3D remake as The Grading Suite (`/` the suite, `/portfolio` the lightbox)

## Scope and mode
Whole site, both routes plus shared chrome. Mode: Experience (the work leads from the first viewport), with one Persuade duty: Download CV and a way to make contact are on screen at every scroll position and every width.

## Audience, job, action
Recruiters and hiring managers in Doha and the GCC, often on a phone from LinkedIn or an application, deciding fast whether to interview. They must see real frames within seconds, believe the image quality, understand that one person covers camera through final mix, and get the CV without learning a 3D control.

## Confirmed by the user (2026-10-20)
- "i want to fully remake the design in 3d style". Form of 3D: Hybrid, one real-time 3D centrepiece on the landing view plus real depth everywhere else.
- Fresh look: keep only the name, the rotated orange MB monogram, the first-person voice and "Doha · Algiers · Everywhere".
- Feels wrong if: slow on phones, gimmicky or game-like, the work gets buried, hard to navigate. All four are binding.
- Direction round: the user chose The Grading Suite (Impeccable's pick) over the rolled Master Timeline.
- After the first build (2026-10-20): "remove the timeline in the exp section and make the grey bg animated". The experience section is the role list only; the surround animates.
- Then: "remove the software part and animate the bg i don't like the simple grey". The software list is gone from the pipeline; the surround is no longer plain grey but lit by monitor spill in the colours of the piece on screen.
- An earlier, separate attempt (Rooftop Set, a full 3D world) lives in `../New folder/myportfolio-main`; this build starts from the pre-redesign snapshot and reuses only its media pipeline.

## Direction contract
THESIS: The site is Marouane's grading suite: his work sits on a calibrated reference monitor, and beside it that frame's own pixels hang as a live 3D colour cloud the visitor can turn. It refuses the showreel hero over a thumbnail grid, and the black void of floating 3D cards.
OWN-WORLD: A D65 suite with the lights down. The surround is lit by the monitor: soft pools of light in the colours of whatever piece is on screen drift across the grey and fade to the next piece's colours at each cut, under a slow field of shadow and a fine film grain (user, 2026-10-20). The chrome itself stays without hue: true-black monitor glass, graphite console panels with engraved Mona Sans legends at expanded width, Martian Mono numerals for every measurement, hairline scope graticules. Colour lives only in the footage, its colour cloud and scope traces, plus one orange: the MB mark, the selection outline and the primary action.
STORY: The recruiter sees a real frame within a second, reads who he is, turns the frame's colour in 3D, steps through clips, sees camera-to-master as one person's node graph, then downloads the CV or writes.
FIRST VIEWPORT: Desktop: console bar (MB mark and name, orange Download CV, nothing else). Statement row: "Stories with signal." at display scale left, intro and a See all 60 pieces key right. Below: reference monitor at about 60% width, with frame lines on the picture and a status line of measured facts in its bezel chin, beside the WebGL colour cloud at about 40%; an eight-frame clip strip under the monitor. Phone: headline, actions, monitor full width, cloud beneath.
FORM: The Grading Suite, my first-ranked grounded candidate (Impeccable's pick card), chosen by the user over the rolled Master Timeline; seed key 38e144bd.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion
The colour cloud: every sampled pixel of the frame on the monitor, plotted in 3D. Drag (or arrow keys) to orbit; switch between RGB cube and YCbCr (a vectorscope extruded by luma) and the points travel between spaces; pick another clip and the monitor cuts while the cloud flows to the new frame's colours. Idle, it turns slowly. Reduced motion: no auto-rotation, cuts instead of flows. No WebGL: a 2D vectorscope from the same samples.
Depth elsewhere is physical and quiet: perspective on the pipeline node graph, monitor-glass layering, a slight pointer tilt on lightbox frames for hover-capable pointers only.

## Decisions recorded
- Grading-room colour discipline: the interface is achromatic; colour belongs to the work.
- No section kickers or numbers; headings carry themselves. Mono is used only for measurement (timecode, sizes, counts, dates).
- Colour samples are precomputed per asset at build time, so the 3D cloud never depends on a media host's CORS policy.
- The lightbox numbers every piece (its place in the registry, 01 to 60) and shows only measured facts: kind, frame size, running time. Source file names carry client names, so they never reach the page.
- Portrait moves from the hero to the point-of-view section.
- The console bar holds only the MB mark (home) and Download CV (user, 2026-10-20: "keep only the download cv in the banner"); there is no nav or menu. The console bar's Download CV is the only CV link on the site (user, 2026-10-20: "remove the extra download cv button keep only the one in the top"). Earlier: nav read Home / Work / Contact, not Studio / Lightbox / Contact: plain words over world vocabulary, because "hard to navigate" is a binding failure for this audience. The world lives in the visuals, never in what a recruiter must decode.
- The clip strip sits under the monitor only: it drives the monitor, and the cloud follows the monitor. Under both, it would shorten the scope for no reading gain.
- Experience is the role list only (user, 2026-10-20). The career ruler was removed.
- The surround is lit by monitor spill (user, 2026-10-20: "i don't like the simple grey"). Each piece's three strongest hues are precomputed at build time and held to one relative luminance (0.10), so text contrast over the spill never drops below 4.5:1 for secondary text whatever the frame; black-and-white pieces throw neutral light. The home monitor and the work viewer set it (suite/spill.ts); transforms and colour transitions only; held still and cut, not faded, under reduced motion. Bands darken the surround rather than cover it; the body is transparent so nothing covers the lit layer.
- The software list is not shown (user, 2026-10-20); it remains in the CV data and the PDF.
- Colour changes flow (user, 2026-10-20: "make a fluid animation when the colors changes"). The surround is a low-resolution WebGL fluid (suite/fluidSurround.ts): domain-warped pools of the current spill colours that move like liquid, and at each change the new colours pour out from the monitor (or the viewer's frame) as a turbulent front over 2.2 s. Its own lazy chunk (about 2.3 KB gzip), an eighth of screen resolution, 30 fps at most, paused in hidden tabs; a still image with instant changes under reduced motion. The CSS pools remain as the fallback when WebGL is missing or lost.
- One Hold key in the scope stops both the monitor's cycling and the cloud's turn; turn keys give a single-pointer alternative to dragging.
- Every web file is named by piece number, never by source name.
- The accent follows the piece (user, 2026-10-20: "change the orange color and make change like the bg"). Each piece lends its strongest hue, held to luminance 0.45 at build time (fading in Oklab), to the MB mark, the primary keys, LEDs, outlines and focus; it fades with the room's light. Black-and-white pieces keep the brand orange at that luminance. PRODUCT.md still names an orange MB monogram as a brand commitment; the favicon keeps it, and the user should confirm whether the on-page mark may follow the accent.

## Unresolved
- Production hosting for generated web media (Dropbox shared links were returning "Link Temporarily Disabled" on 2026-10-20).
- Per-piece titles, years and credits remain unknown.
