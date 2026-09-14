// Cloudinary delivery helpers for the portfolio feed.
//
// The registry stores full-size originals (some stills are >6 MB) and, for video,
// a 250 px-tall derived frame. Both are re-requested here at the size the layout
// actually renders, with c_fill + g_auto so the crop follows the subject instead
// of the centre of the frame.
//
// Every helper falls back to the URL it was given, so an unrecognised pattern
// degrades to the original asset rather than a broken image.

const VIDEO_FRAME = /\/video\/upload\/h_250,q_auto\//;
const IMAGE_UPLOAD = /\/image\/upload\//;

const fill = (width: number, height: number) => `c_fill,g_auto,w_${width},h_${height},q_auto,f_auto`;

// Downscale only — the frame keeps its own proportions.
const limit = (width: number) => `c_limit,w_${width},q_auto,f_auto`;

// Deliberately tiny and pre-blurred: ~350 bytes, so a tile can show its own
// colours while the real asset is still in flight.
const blur = (width: number, height: number) => `c_fill,g_auto,w_${width},h_${height},q_auto:low,e_blur:80`;

// A per-asset correction that runs before the sizing: a crop that removes
// letterbox bars, a start offset that skips a black opening, or both.
const lead = (transform?: string) => (transform ? `${transform},` : '');

/** A still, cropped to `width`x`height` and delivered as WebP/AVIF where supported. */
export function stillUrl(url: string, width: number, height: number) {
  return url.replace(IMAGE_UPLOAD, `/image/upload/${fill(width, height)}/`);
}

/** The frame Cloudinary derived from a video, cropped and sized like `stillUrl`. */
export function posterUrl(url: string | undefined, width: number, height: number, transform?: string) {
  if (!url) return undefined;
  return url.replace(VIDEO_FRAME, `/video/upload/${lead(transform)}${fill(width, height)}/`);
}

/**
 * Downscales a still or a video's derived frame to `width`, preserving the
 * frame's own aspect ratio. For surfaces whose layout depends on real
 * proportions — the masonry archive, where cropping would change the design.
 */
export function scaledUrl(url: string | undefined, width: number, transform?: string) {
  if (!url) return undefined;
  return url
    .replace(VIDEO_FRAME, `/video/upload/${lead(transform)}${limit(width)}/`)
    .replace(IMAGE_UPLOAD, `/image/upload/${limit(width)}/`);
}

/**
 * A blurred miniature of the same frame, for use as a loading placeholder.
 * Accepts either a still or a video's derived frame and returns undefined if
 * neither pattern matches, so a caller can skip the placeholder entirely.
 */
export function blurUrl(url: string | undefined, width = 24, height = 16, transform?: string) {
  if (!url) return undefined;
  const transformed = url
    .replace(VIDEO_FRAME, `/video/upload/${lead(transform)}${blur(width, height)}/`)
    .replace(IMAGE_UPLOAD, `/image/upload/${blur(width, height)}/`);
  return transformed === url ? undefined : transformed;
}
