---
name: Marouane Bouakba Portfolio
description: The Grading Suite. A calibrated reference monitor, its frame's own colour cloud in 3D, graphite console chrome without hue, and a surround lit by the picture on screen.
colors:
  signal: "#ff977c"
  signal-ink: "#141414"
  surround: "#474747"
  console: "#2a2a2a"
  console-raised: "#343434"
  console-lit: "#3c3c3c"
  key-latched: "#232323"
  field-well: "#1c1c1c"
  bezel: "#161616"
  glass: "#060606"
  ink: "#f2f2f2"
  ink-2: "#d2d2d2"
  ink-3: "#a8a8a8"
  hairline: "rgba(255, 255, 255, 0.12)"
  hairline-strong: "rgba(255, 255, 255, 0.22)"
typography:
  display:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(46px, min(5.6vw, 9.4vh), 84px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  display-page:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(44px, 6vw, 88px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.3vw, 60px)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.032em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(20px, 2vw, 26px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 108"
  lead:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(21px, 2.05vw, 28px)"
    fontWeight: 400
    lineHeight: 1.36
    letterSpacing: "-0.012em"
  lede:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.35vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  legend:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.09em"
    fontVariation: "'wdth' 125"
  data:
    fontFamily: "Martian Mono, ui-monospace, Cascadia Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.01em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 87.5"
rounded:
  glass: "2px"
  clip: "3px"
  frame: "4px"
  key: "6px"
  bezel: "9px"
  node: "10px"
  panel: "12px"
  phone: "16px"
  round: "50%"
spacing:
  gutter: "clamp(14px, 2.4vw, 36px)"
  max: "1920px"
  section-y: "clamp(56px, 7vw, 100px)"
  head-gap: "clamp(40px, 5vw, 68px)"
  bay-gap: "clamp(16px, 2vw, 28px)"
  strip-gap: "8px"
  key-gap: "8px"
  form-gap: "18px"
components:
  key:
    backgroundColor: "{colors.console-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.legend}"
    rounded: "{rounded.key}"
    padding: "0 18px"
    height: "44px"
  key-hover:
    backgroundColor: "{colors.console-lit}"
  key-latched:
    backgroundColor: "{colors.key-latched}"
    textColor: "{colors.ink}"
  key-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.legend}"
    rounded: "{rounded.key}"
    padding: "0 18px"
    height: "44px"
  key-signal-hover:
    backgroundColor: "{colors.signal}"
  key-large:
    padding: "0 22px"
    height: "52px"
  key-small:
    padding: "0 12px"
    height: "32px"
  console-bar:
    backgroundColor: "{colors.console}"
    textColor: "{colors.ink}"
    height: "64px"
    padding: "0 clamp(14px, 2.4vw, 36px)"
  monitor-bezel:
    backgroundColor: "{colors.bezel}"
    rounded: "{rounded.bezel}"
  monitor-glass:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.glass}"
  console-panel:
    backgroundColor: "{colors.console}"
    rounded: "{rounded.panel}"
    padding: "clamp(20px, 3vw, 36px)"
  node:
    backgroundColor: "{colors.console}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.node}"
    padding: "16px 16px 18px"
  field-input:
    backgroundColor: "{colors.field-well}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.key}"
    padding: "12px 14px"
---

# Design System: Marouane Bouakba Portfolio

## Overview

**Creative North Star: "The Grading Suite"**

The site is a colourist's suite with the lights down. Marouane's work sits on a calibrated reference monitor: true-black glass in a dark bezel, corner frame lines on the picture's own edges, and a status chin that reads only measured facts. Beside it hangs the colour cloud: every sampled pixel of the frame on screen, plotted in 3D as an RGB cube, an extruded vectorscope or a waveform, which the visitor can turn. Everything else is the room. Graphite console panels carry engraved, wide uppercase legends. Physical keys light their LEDs when latched. The surround takes on the light of whatever piece is on the monitor.

The chrome has no hue. Colour belongs to the work, its colour cloud and scope traces, and to the soft spill the picture throws on the walls. One accent is allowed into the room, and only for three jobs: the MB mark, selection (latched LEDs, the selected-frame outline, the focus ring) and the primary action. The accent is lent by the piece on screen: its strongest hue, held to one luminance, fading with the room's light at every cut (amber under the candlelit dinner, teal under the screen-lit portrait). Depth is physical and quiet: keys and panels are lit from above and cast a soft shadow below, and real perspective appears on the pipeline node graph, the portrait glass and the lightbox frames.

The system rejects the showreel hero over a thumbnail grid, and the black void of floating 3D cards. Motion is slow and compositor-only. Under reduced motion it holds still and cuts instead of flowing.

**Key Characteristics:**
- An achromatic interface: graphite console, black glass, grey surround; colour comes only from the footage
- A surround lit by monitor spill: slow pools of the piece's own luminance-held hues that flow out from the monitor at every cut, under a fine film grain
- Mona Sans at variable width: expanded engraved legends, wide display, normal-width prose
- Martian Mono for measurements only (timecode, frame size, counts, dates)
- Keys with LEDs, sunk when latched; panels lifted by a top-edge highlight and a soft under-shadow
- One accent with three roles, and never a fourth; its hue comes from the piece on screen

## Colors

A graphite-and-glass palette with no hue of its own, one vivid accent, and colour borrowed live from the work: both the surround's light and the accent take their hue from the piece on screen.

### Primary
- **Signal** (the accent; default #ff977c, the brand orange held to luminance 0.45): the only interface colour, and it changes with the piece on screen. Each piece's accent is its strongest hue at saturation 0.72 to 0.9, held to relative luminance 0.45 at build time (`accentOf` in scripts/prepare-suite.mjs); a frame without real colour keeps the brand orange at that luminance. It fades over 2.2s with the room's light, interpolated in Oklab (the accent is set as color(srgb ...), so its brightness holds through the fade), and instantly under reduced motion. It has three roles. (1) The rotated MB monogram. (2) Selection: the lit LED of a latched key or the current page, the 2px outline on the selected clip and on hovered or focused lightbox and phone frames, the focus ring, the input focus border and caret, and text selection. (3) The primary action: the single Download CV key in the console bar (the only CV link on any page), the Send message key, and the skip link.
- **Signal hover**: a primary-action key lightens on hover with a 20% white wash over the accent, never a second colour, so the key keeps fading in step with the MB mark. **Signal Glow** (the accent at 60%) lights an LED; browsers without color-mix() drop the glow and keep the solid LED.
- **Signal Ink** (#141414): text on any accent fill (the mark, primary keys, selection). At luminance 0.45 every accent keeps it at 8.7:1 or better, including mid-fade.

### Neutral
- **Surround** (#474747): the room's base grey, painted on `html` and under the spill layer. The body is transparent so nothing covers the lit surround.
- **Console** (#2a2a2a): the console bar, contact panel, pipeline nodes, lightbox shell and footer.
- **Console Raised** (#343434): an unlatched key at rest. **Console Lit** (#3c3c3c) is its hover. **Key Latched** (#232323) is a pressed key sunk into the panel.
- **Field Well** (#1c1c1c): the recessed well of text inputs.
- **Bezel** (#161616): monitor, phone and portrait bezels.
- **Glass** (#060606): monitor glass, scope glass, clip and frame placeholders, the viewer's picture area.
- **Ink** (#f2f2f2): primary text and headings. **Ink 2** (#d2d2d2): secondary text, ledes, body copy and readouts. **Ink 3** (#a8a8a8): tertiary text, only on console and glass (on the surround it falls under 4.5:1).
- **Hairline** (white at 12%) and **Hairline Strong** (white at 22%): dividers, the clip edge, rule tops of the role list and education facts, and link underlines at rest.

### State
- **Errors carry no hue.** The accent can take any hue, so no error colour could stay distinct from it: an error is its copy in full Ink, led by a filled Ink alert mark ("!" in console grey), on the form note and the viewer's load-failure state.

### Monitor Spill (dynamic)
Spill colours are not tokens; each piece carries its own. At build time the three strongest hues of every piece are taken from its samples, capped at 0.62 saturation and set to relative luminance 0.10. Black-and-white pieces throw neutral light (#595959, #3a3a3a, #4f4f4f), which are also the resting values. Only the pieces that own the monitor set the spill: the home monitor and the work viewer.

### Named Rules
**The Three Accent Roles Rule.** The accent is the MB mark, selection (a latched LED, the selected outline, focus) and the primary action. It never appears as decoration, a heading accent, a divider, a section label or a large surface.

**The Lent Accent Rule.** The accent always comes from the piece on screen through the same luminance hold (0.45), never a raw sampled colour and never a fixed hue in code, so dark text on it stays at 8.7:1 and it stays at 3:1 or better against the lit surround, film grain and mid-fade included, whatever the frame. The favicon alone keeps the fixed brand orange (#f06d36).

**The Hueless Chrome Rule.** Console, bezel, glass, keys and type carry no hue. Colour enters the page only from the work: the footage, its colour cloud and scope traces, and the spill it throws on the surround.

**The Held Spill Rule.** Every spill colour is held to relative luminance 0.10 at build time, so secondary text (Ink 2) over the lit surround stays at 4.5:1 or above whatever the frame. A new spill source must go through the same luminance hold, never a raw sampled colour. Bands darken the surround (black at 14%) rather than cover it.

## Typography

**Display and Body Font:** Mona Sans (self-hosted, variable wdth 75 to 125, wght 300 to 800; ui-sans-serif, system-ui fallback)
**Measurement Font:** Martian Mono (self-hosted, variable wdth 75 to 112.5, wght 300 to 500; ui-monospace fallback)

**Character:** One sans at several widths does all the talking. Expanded and heavy, it is the console's engraved hardware. At normal width it is a calm voice for prose. Martian Mono, slightly condensed, is the instrument readout.

### Hierarchy
- **Display** (700, clamp(46px, min(5.6vw, 9.4vh), 84px) on the suite, 0.95, -0.04em): the home statement. It splits into a quiet half (300, normal width, Ink 2) and a loud half (800, wdth 125, -0.035em). The Work page masthead uses the page size (clamp(44px, 6vw, 88px)).
- **Headline** (720, wdth 112, clamp(32px, 4.3vw, 60px), 1.02, -0.032em, balanced): section headings. They carry themselves, with no label above.
- **Title** (700, wdth 108, clamp(20px, 2vw, 26px), 1.15): company names in the role list. Node titles use 650, wdth 112, 15.5px.
- **Lead** (400, clamp(21px, 2.05vw, 28px), 1.36, max 30ch): the point-of-view statement.
- **Lede** (400, clamp(17px, 1.35vw, 20px), 1.5, Ink 2, max 46ch): the line beside each section headline.
- **Body** (400, 16px, 1.6; body copy at 1.7, max 54ch, Ink 2): prose, the intro (15.5px, max 68ch) and the role bullets (15px, max 70ch).
- **Legend** (650, wdth 125, 12px, 0.09em, uppercase): key labels, field labels, fact and contact terms, status labels. Small keys drop to 10.5px; scope keys narrow to wdth 108.
- **Data** (Martian Mono 400, wdth 87.5, 12px, tabular figures): timecode, frame size, aspect, piece numbers, counts and dates. 11px in readouts and keys, 10px for scope graticule labels.

### Named Rules
**The Mono-For-Measurement Rule.** Martian Mono sets only what was measured or counted: timecode, frame size, aspect, piece numbers, counts, dates, IRE steps. Prose, headings and labels are never mono.

**The Engraved Legend Rule.** Every control label is Mona Sans at full expanded width, heavy, tracked and uppercase. That is the console speaking. Headlines are never set this way.

## Layout

Content sits in a centred column (max 1920px, so up to that width it aligns with the console bar) with a slim fluid gutter (clamp(14px, 2.4vw, 36px)). Sections pad clamp(56px, 7vw, 100px) vertically. A section head is a two-column grid (1.1fr headline : 0.9fr lede, aligned to the baseline end), followed by clamp(40px, 5vw, 68px) of space. Darker bands run full bleed with a 100vmax box-shadow and clip-path, without leaving the column.

The first viewport is the suite. A statement row puts the display line on the left (0.92fr) and the byline, intro and a single See all 60 pieces key on the right (1.08fr); the CV is only in the console bar. The bay below holds the reference monitor (1.5fr) beside the scope column (min 300px, 1fr), with an eight-frame clip strip under the monitor only. The formats rail stays inside the page margins and sizes its phone frames so a whole number fills the row exactly (2 on phones, up to all 10 on wide screens), balanced on both sides; the rest scroll with snap, a full row per page, and the paging keys appear only when there is more to see. The pipeline is a five-node graph in perspective. The work page is a JS-placed masonry of 4:5 frames, and the viewer is the monitor on the left with a scope sidebar of clamp(300px, 27vw, 400px).

Breakpoints: 1180px (graph to 3 columns, flat), 1100px (suite and viewer to one column; scope 16:10), 860px (all two-column heads and grids collapse; graph goes vertical), 760px (clip strip scrolls; scope square; viewer full-screen), 520px (action keys full width, label left, icon right), 400px (CV key shortens).

## Elevation & Depth

Depth is physical, as if the room is lit from above. Raised hardware catches a 1px highlight on its top edge and casts a soft, offset shadow below. A latched key sinks with an inset shadow. Glass is recessed. Real 3D perspective is used sparingly: the pipeline graph tilts back 14deg, the portrait glass turns 9deg, lightbox and phone frames tilt slightly toward the pointer (hover-capable pointers only), nodes rise 28px in Z on hover, and the viewer rises from -140px Z. The monitor carries the one white glow in the room: a D65 bias light behind it (white at 12%).

### Shadow Vocabulary
- **Lift** (`inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 0 rgba(0,0,0,0.55), 0 10px 20px -12px rgba(0,0,0,0.75)`): keys at rest.
- **Lift High** (`inset 0 1px 0 rgba(255,255,255,0.09), 0 2px 0 rgba(0,0,0,0.45), 0 34px 60px -30px rgba(0,0,0,0.9)`): bezels, scope glass, nodes, panels and work frames.
- **Sunk** (`inset 0 2px 5px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)`): latched keys.
- **Well** (`inset 0 2px 5px rgba(0,0,0,0.5)`): text inputs.
- **Viewer** (`0 60px 120px -40px rgba(0,0,0,0.95)`): the lightbox shell over a 90% near-black backdrop.

### Named Rules
**The Lit-From-Above Rule.** Every raised surface has a top-edge highlight and a soft shadow offset downward. Nothing glows except the white bias light, a lit LED and the monitor tally.

## Shapes

Corners are small and hardware-like, and the radius grows with the object: glass and picture edges (2px), clip thumbnails (3px), work frames (4px), keys and fields (6px), bezels and scope glass (9px), nodes (10px), panels and the viewer (12px), phone bezels (16px). LEDs, ports and the tally are circles. The MB mark is a 2px-cornered square rotated -8deg. Lines are hairlines: dividers, the node wire (2px, white at 30%), and corner frame lines (14px arms, 1px, white at 55%, inset 8px) drawn on the picture's own edges. A fine graticule tick (1px every 32px) tops the role list and education facts.

## Components

### Keys
Physical console keys with an LED.
- **Shape:** 6px corners, 44px tall (52px large, 32px small, 44px square icon key).
- **Default:** Console Raised fill, Ink legend, Lift shadow. On hover the fill becomes Console Lit. On press the key drops 1px and its shadow collapses (0.14s, cubic-bezier(0.3, 0, 0.2, 1)).
- **Latched** (`aria-pressed`): sunk to Key Latched with the Sunk shadow, and the 6px LED lights in the accent with a 7px glow.
- **Primary action:** Signal (accent) fill with Signal Ink legend and a stronger top highlight; hover is a 20% white wash; the focus ring turns Ink so it reads against the accent.
- **Icons:** inline SVG line icons (Download, Play, arrows) at 14 to 17px, after or before the legend.

### Navigation (Console Bar)
A sticky 64px graphite bar (60px at 760px and below) with an inset bottom edge and a soft under-shadow. It holds only two things: the rotated MB mark (in the accent) with its two-line expanded uppercase name (a link home), and the Download CV key in the accent, which shortens to "CV" at 400px and below. There are no navigation links in the bar: the pages link to each other in place (See all 60 pieces and the films rail on home, Back home on the work page, the contact section at the end of home).

### Reference Monitor (signature)
A Bezel frame (9px corners, Lift High) around 16:9 Glass, with the white bias light behind. Corner frame lines mark the picture's real edges inside the glass. The status chin reads in order: the piece number (`07 / 60`, the total in Ink 3), a Film or Still legend, a white tally light, then frame size, aspect and running time in Data. A small Play key sits bottom-left on films. Under it, the clip strip of eight 16:9 thumbnails (66% opacity at rest, full on hover or selection) marks the selected clip with a 2px orange outline and its number in Data.

### Colour Cloud (signature)
Raw WebGL2 point cloud in Glass (9px corners, Lift High), beside the monitor. Three keys switch the space: Colour cube, Vectorscope (YCbCr extruded by luma) and Waveform; points travel between spaces, and the cloud flows to the new frame's colours when the monitor cuts. Graticule lines are white at low alpha (the gamut hexagon quieter than the graticule), and labels are Martian Mono 10px at white 60 to 72%. Points keep their own colour, lifted to a 0.16 floor so near-black pixels stay visible. Drag or arrow keys orbit it; it turns slowly when idle; a Hold key stops both the turn and the monitor's cycling, and turn keys give a single-pointer alternative. Without WebGL it draws a 2D vectorscope from the same samples. Under reduced motion it does not auto-rotate and cuts instead of flowing.

### Surround and Monitor Spill (signature)
The room behind every page, lit by whatever piece is on the monitor. Slow, flowing pools of light in that piece's three spill colours move across the grey surround, under a fine film grain. When the piece changes, the new colours flow out from the monitor's position like a liquid front over about two seconds and settle back into the slow drift; the light visibly comes from the picture, never from nowhere. Where WebGL is unavailable, the same colours sit in slowly drifting soft pools. The surround never takes pointer events, never covers content and never carries a hue that did not come from the work. Under reduced motion it holds still and colour changes are instant.

### Phone Frames and Work Frames
Phone frames are 9:16 Bezel glass (16px corners, 5px bezel, 11px inner corners) with a hairline edge and a faint top-lit sheen, in a snap rail. Work frames are 4:5 tiles (4px) with Lift High, filled with the piece's own tone until media paints (0.6s fade). Both tilt toward the pointer on hover-capable devices and take a 2px accent outline on hover or focus. On the home rail a Data readout beneath each frame shows the piece number (Ink) and running time. Work-page frames carry no readout at all: the picture alone, evenly spaced, with a play mark on films; the viewer's header shows frame size, aspect and running time. The piece's number and kind always remain in its accessible name. The work page's way back is a small Back home key above the page title.

### Pipeline Node Graph
Console nodes (10px, Lift High) in a row, joined by 2px wires and round ports, tilted back 14deg in perspective. Each node has a hairline-divided head with an ordinal and a title, and its stages are separated by middle dots. The final node is outlined in white at 55%. On hover a node rises in Z.

### Inputs / Fields
Field Well background, 1px white-at-14% border (24% on hover), 6px corners, Well shadow, 16px Ink text, accent caret, placeholder #8f8f8f. On focus the border and a 1px outline turn to the accent. Labels are Legends in Ink 3; "optional" is normal-case 12px.

### Viewer (Lightbox)
A Console shell (12px) that rises out of depth over a 90% near-black backdrop. The bar holds the readout and the Prev / count / Next / Close keys. The body is a Glass monitor area beside a scope sidebar. It goes full-screen and single-column on phones.

## Do's and Don'ts

### Do:
- **Do** keep every piece of chrome achromatic: graphite (#2a2a2a to #3c3c3c), bezel (#161616), glass (#060606), inks (#f2f2f2, #d2d2d2, #a8a8a8).
- **Do** limit the accent to the MB mark, selection (a latched LED, the selected outline, focus) and the primary action, and take it only from the piece on screen.
- **Do** derive any new spill colour at build time, hold it to relative luminance 0.10, and let black-and-white work throw neutral light.
- **Do** set every measurement in Martian Mono with tabular figures, and every control label as an expanded uppercase Mona Sans legend.
- **Do** name pieces only by their registry number (01 to 60) with measured facts: kind, frame size, aspect, running time.
- **Do** light raised hardware from above (Lift, Lift High) and sink latched keys (Sunk).
- **Do** keep ambient motion slow and cheap, and hold it still (with instant colour changes) under reduced motion.
- **Do** keep Ink 3 on console and glass only; over the surround use Ink 2 or Ink.

### Don't:
- **Don't** put a kicker, eyebrow or section number above a headline. Headings carry themselves.
- **Don't** add a second accent or tint the chrome. Colour belongs to the work.
- **Don't** use Martian Mono for prose, headings or labels.
- **Don't** show source file names, client names or invented titles for a piece.
- **Don't** cover the lit surround with an opaque body or band; bands darken it (black at 14%).
- **Don't** add glows beyond the white bias light, lit LEDs and the tally.
- **Don't** tilt frames toward the pointer on touch devices.
