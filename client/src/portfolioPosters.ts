// Generated once by sampling every video poster through a canvas.
//
// Two causes of black cards in the archive, fixed per asset:
//   1. Letterboxed sources: a wide picture inside black bars, which the card shows
//      because it reserves the frame's own aspect ratio. Cropped to the measured
//      picture band. The cropped dimensions are carried here so the reserved box
//      matches what is actually delivered.
//   2. Films that genuinely open on black: given a start offset that lands on a lit
//      frame, so neither the poster nor the blurred placeholder shows black.
//
// Keyed by asset title. Anything absent needs no adjustment.

export type PosterAdjustment = { transform: string; w: number; h: number };

export const posterAdjustments: Record<string, PosterAdjustment> = {
  "BEAT TEASER 1 FINAL 1": { transform: 'c_crop,x_0,y_378,w_1080,h_1164', w: 1080, h: 1164 },
  "Djezzy Commercial 1 1": { transform: 'c_crop,x_0,y_97,w_1280,h_526', w: 1280, h: 526 },
  "Frames Brett": { transform: 'c_crop,x_0,y_18,w_1080,h_1404,so_20p', w: 1080, h: 1404 },
  "Hamoud boualem Ad 1 1": { transform: 'c_crop,x_0,y_552,w_720,h_716,so_5p', w: 720, h: 716 },
  "Hamoud boualem ad 3": { transform: 'c_crop,x_0,y_372,w_720,h_536', w: 720, h: 536 },
  "Night vibes with Football  Ottoman": { transform: 'c_crop,x_0,y_528,w_1080,h_1314,so_5p', w: 1080, h: 1314 },
  "OMO ad ": { transform: 'c_crop,x_0,y_678,w_1080,h_564', w: 1080, h: 564 },
  "ottoman mw": { transform: 'c_crop,x_0,y_18,w_1080,h_1524', w: 1080, h: 1524 },
  "Video Idea 4": { transform: 'c_crop,x_0,y_18,w_1080,h_1644', w: 1080, h: 1644 },
};
