import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { portfolioAssets, type PortfolioAsset } from './portfolioAssets';
import { posterAdjustments } from './portfolioPosters';
import { intrinsicSizes } from './portfolioSizes';
import suiteData from './suite/suiteData.json';

/** The downloadable CV, the site's lead action on every route. */
export const CV_PDF = '/Marouane_Bouakba_Content_Producer_CV.pdf';

// --- Where each piece is served from ------------------------------------------

type LocalAsset = { thumb?: string; full?: string; preview?: string; duration?: number; width?: number; height?: number };
type Manifest = { assets: Record<string, LocalAsset> };

// Written by `npm run media` (scripts/prepare-media.mjs) and git-ignored, like the
// files it points at. It maps each piece to small web versions hosted with the site;
// without it every piece falls back to its original Dropbox link.
const generated = import.meta.glob<Manifest>('./mediaManifest.json', { eager: true, import: 'default' });
const manifest: Manifest | null = Object.values(generated)[0] ?? null;

export type SuitePiece = { samples: string; poster: string; tone: string; spill: string[]; accent: string };
export type HeroFrame = (typeof suiteData.hero)[number];

/** Edge length of every colour sample grid (see scripts/prepare-suite.mjs). */
export const SAMPLE_GRID = suiteData.grid;
export const HERO_FRAMES: HeroFrame[] = suiteData.hero;
const pieces = suiteData.pieces as Record<string, SuitePiece | undefined>;

export const FILMS = portfolioAssets.filter((asset) => asset.kind === 'video');
export const STILLS = portfolioAssets.filter((asset) => asset.kind === 'photo');

const numbers = new Map(portfolioAssets.map((asset, index) => [asset.title, index + 1]));

/**
 * A piece's place in the archive, 1 to 60. It is the only name a piece is given on
 * the page: source file names carry client names, and the work stays unattributed.
 */
export const pieceNumber = (asset: PortfolioAsset) => numbers.get(asset.title) ?? 0;
export const pad = (value: number, size = 2) => String(value).padStart(size, '0');
export const byNumber = (number: number) => portfolioAssets[number - 1];

/** Every file the site knows for one piece, best first. */
export function mediaFor(asset: PortfolioAsset) {
  const local = manifest?.assets[asset.title];
  const suite = pieces[asset.title];
  return {
    full: local?.full ?? asset.asset,
    /** The original, for when a hosted web version fails to load. */
    original: asset.asset,
    /** A small image to show on a card: the hosted thumb, else the committed poster. */
    thumb: local?.thumb ?? suite?.poster,
    preview: local?.preview,
    duration: local?.duration,
    samples: suite?.samples,
    tone: suite?.tone ?? '#1b1b1b',
    /** The colours this piece throws on the room around the monitor. */
    spill: suite?.spill,
    /** The interface accent this piece lends the page while it is on screen. */
    accent: suite?.accent,
    local: !!local,
  };
}

/**
 * The frame's shape as delivered. A letterboxed film is delivered cropped, so the
 * crop's dimensions win over the source frame's.
 */
export function frameSize(asset: PortfolioAsset) {
  return posterAdjustments[asset.title] ?? intrinsicSizes[asset.title];
}

// --- Measurements, written the way a suite writes them --------------------------

/** Running time as people read it: 0:42, 1:06, 12:30. */
export function runtime(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return '';
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${pad(whole % 60)}`;
}

/** Frame size as "3394 × 2120". */
export const dimensions = (size?: { w: number; h: number }) => (size ? `${size.w} × ${size.h}` : '');

/** Aspect ratio the way the trade names it: 16:9, 9:16, 2.39:1, 1:1. */
export function aspectName(size?: { w: number; h: number }) {
  if (!size) return '';
  const ratio = size.w / size.h;
  const named: [number, string][] = [[16 / 9, '16:9'], [9 / 16, '9:16'], [1, '1:1'], [4 / 5, '4:5'], [2.39, '2.39:1'], [1.85, '1.85:1'], [4 / 3, '4:3']];
  const match = named.find(([value]) => Math.abs(value - ratio) / value < 0.025);
  return match ? match[1] : ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;
}

/**
 * The frame as the file holds it, letterbox and all: what a film plays at in the
 * viewer. Falls back to the delivered shape when the source size is unknown.
 */
export function sourceSize(asset: PortfolioAsset) {
  return intrinsicSizes[asset.title] ?? frameSize(asset);
}

// What a piece shows, for people who cannot see it. Description only: no titles,
// clients or credits, which the site does not have and must not invent. Pieces not
// listed here fall back to their number.
const DESCRIPTIONS: Record<string, string> = {
  PH1: 'A candlelit dinner: an older man and two others at a table in warm, low light.',
  PH13: 'A young man in profile in the dark, lit cyan by a screen.',
  PH8: 'A woman smiling across a table in soft light.',
  PH15: 'Hands working the faders of a mixing desk under blue light.',
  PH6: 'A pink armchair standing alone in the aisle of a church, between wooden pews.',
  PH11: 'A lamp-lit room seen through a doorway, framed icons on the wall.',
  PH7: 'A man sitting on a tiled floor against a wall, in cold blue light.',
  'AMNM QND V1 1 1': 'A doctor in a white coat working at a desk in a clinic.',
};

export const describe = (asset: PortfolioAsset) => DESCRIPTIONS[asset.title];

/** "Still 14" or "Film 09": the only name a piece is given. */
export const pieceLabel = (asset: PortfolioAsset) => `${asset.kind === 'video' ? 'Film' : 'Still'} ${pad(pieceNumber(asset))}`;

/** True for a frame made for a phone held upright. */
export const isVertical = (asset: PortfolioAsset) => {
  const size = frameSize(asset);
  return !!size && size.h > size.w * 1.05;
};

// --- Playback ---------------------------------------------------------------------

export const prefersReducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Previewing on intent needs a pointer that can hover and a visitor who has not
// asked for reduced motion. Without both, pieces stay as stills.
export const previewsOnHover = () => typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

/**
 * Where a film rests when it is not playing: the measured start offset (`so_Np` in
 * portfolioPosters.ts) where one exists, otherwise its middle. Zero until the
 * duration is known.
 */
export function restTime(duration: number, transform?: string) {
  if (!Number.isFinite(duration)) return 0;
  const offset = transform?.match(/so_(\d+)p/);
  return offset ? (duration * Number(offset[1])) / 100 : duration / 2;
}

export const transformOf = (asset: PortfolioAsset) => posterAdjustments[asset.title]?.transform;

/** Seeks an original, uncut film to its rest frame once its metadata arrives. */
export const seekToRest = (transform?: string) => (event: SyntheticEvent<HTMLVideoElement>) => {
  const element = event.currentTarget;
  element.currentTime = restTime(element.duration, transform);
};

/**
 * Plays a film's preview while the pointer or keyboard focus is on it, and rewinds
 * on exit. A hosted preview is already cut to its best six seconds, so it rewinds to
 * the start; an original rewinds to its rest frame.
 */
export function useHoverPreview(enabled: boolean, transform?: string, cut = false) {
  const video = useRef<HTMLVideoElement>(null);

  const start = () => {
    if (!enabled || !previewsOnHover()) return;
    void video.current?.play().catch(() => {});
  };

  const stop = () => {
    const element = video.current;
    if (!element) return;
    element.pause();
    element.currentTime = cut ? 0 : restTime(element.duration, transform);
  };

  return { video, start, stop };
}

/** True once the element comes within `margin` of the viewport, so heavy work starts on approach. */
export function useNearViewport<T extends Element>(margin = '480px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: margin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [near, margin]);

  return { ref, near };
}

/** Matches a media query and follows it as the window changes. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

// --- Colour samples ---------------------------------------------------------------

const sampleCache = new Map<string, Promise<Uint8Array | null>>();

/** One piece's sample grid as raw RGB bytes, fetched once and shared. Null if unavailable. */
export function loadSamples(url?: string): Promise<Uint8Array | null> {
  if (!url) return Promise.resolve(null);
  let pending = sampleCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .then((buffer) => (buffer && buffer.byteLength === SAMPLE_GRID * SAMPLE_GRID * 3 ? new Uint8Array(buffer) : null))
      .catch(() => null);
    sampleCache.set(url, pending);
  }
  return pending;
}
