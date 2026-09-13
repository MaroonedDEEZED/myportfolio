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

/** A still, cropped to `width`x`height` and delivered as WebP/AVIF where supported. */
export function stillUrl(url: string, width: number, height: number) {
  return url.replace(IMAGE_UPLOAD, `/image/upload/${fill(width, height)}/`);
}

/** The frame Cloudinary derived from a video, cropped and sized like `stillUrl`. */
export function posterUrl(url: string | undefined, width: number, height: number) {
  if (!url) return undefined;
  return url.replace(VIDEO_FRAME, `/video/upload/${fill(width, height)}/`);
}
