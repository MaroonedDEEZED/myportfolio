// Monitor spill: in a dark suite the walls take on the colour of whatever is on
// the monitor. The page's surround does the same, and the interface accent (keys,
// LEDs, outlines, the MB mark) takes the piece's strongest hue. Whoever puts a
// piece on screen (the home monitor, the work viewer) calls setSpill with that
// piece's colours, its accent and where the picture sits, and the surround flows
// to them from there.
//
// Two renderers share this: the fluid (suite/fluidSurround.ts, WebGL) when it is
// running, and the CSS pools in styles.css (.surround .spill), which read the
// custom properties below and stay as the fallback. The colours are precomputed per
// piece by scripts/prepare-suite.mjs at one luminance and a capped saturation, so
// text over the surround keeps its contrast whatever the frame.

import type { Fluid } from './fluidSurround';

const NAMES = ['--spill-a', '--spill-b', '--spill-c'];

let fluid: Fluid | null = null;
let last: { colours: string[]; origin?: [number, number] } | null = null;

export function setSpill(colours?: string[], origin?: [number, number], accent?: string) {
  if (!colours?.length || typeof document === 'undefined') return;
  last = { colours, origin };
  const root = document.documentElement;
  NAMES.forEach((name, i) => root.style.setProperty(name, colours[i] ?? colours[0]));
  // Registered as a colour in styles.css, so it fades with the room's light.
  if (accent) root.style.setProperty('--signal', oklabReady(accent));
  fluid?.setPalette(colours, origin);
}

/**
 * The accent as color(srgb ...) rather than hex. Between two hex (legacy) colours
 * the browser interpolates in gamma sRGB, where two equally bright hues pass
 * through a dimmer middle; with a non-legacy endpoint it interpolates in Oklab and
 * the luminance the build held them to holds through the fade.
 */
function oklabReady(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(value)) return hex;
  const channel = (shift: number) => (((value >> shift) & 255) / 255).toFixed(4);
  return `color(srgb ${channel(16)} ${channel(8)} ${channel(0)})`;
}

/** The fluid renderer, once it is running (or null when it stops); it picks up the current colours. */
export function useFluid(next: Fluid | null) {
  fluid = next;
  if (fluid && last) fluid.setPalette(last.colours, last.origin);
}

/** Where an element's centre sits on screen, as the fluid reads it: 0 to 1 across, 0 to 1 up. */
export function originOf(element: Element | null | undefined): [number, number] | undefined {
  if (!element) return undefined;
  const box = element.getBoundingClientRect();
  return [(box.left + box.width / 2) / window.innerWidth, 1 - (box.top + box.height / 2) / window.innerHeight];
}
