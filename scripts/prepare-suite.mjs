// Builds the grading suite's own media from the web versions of the portfolio.
//
//   npm run suite
//
// Run it after `npm run media`, which writes client/public/portfolio-media/ and
// client/src/mediaManifest.json. This script then writes, all small enough to ship
// with the site:
//
//   client/public/suite/frames/   the reference-monitor frames for the home page,
//                                 at 320, 800 and 1600 px wide, as WebP
//   client/public/suite/posters/  a small poster for every piece (480 px wide),
//                                 so no card ever has to load an original
//   client/public/suite/samples/  an 80 x 80 grid of real pixels from every piece,
//                                 as raw RGB bytes; the 3D colour cloud plots these
//   client/src/suite/suiteData.json  what was written, read by the site, with each
//                                 piece's tone, the colours it spills on the room and
//                                 the interface accent it lends the page
//
// Every file is named by the piece's number in the registry (01 to 60), never by its
// source file name: those carry client names, and the work stays unattributed. The
// name also carries a hash of the file's contents, so a file can be cached for good:
// if a piece changes or the registry is reordered, its URL changes with it.
//
// The samples are taken here rather than in the browser so the colour cloud never
// depends on a media host allowing canvas reads (Dropbox does not). Each sample is
// point-sampled (nearest neighbour), so every point is a pixel that exists in the
// frame, not an average of several. Needs ffmpeg on the PATH.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'client', 'public');
const outDir = path.join(publicDir, 'suite');
const dataPath = path.join(root, 'client', 'src', 'suite', 'suiteData.json');

// Edge length of the sample grid: 80 x 80 = 6,400 points per piece, 19.2 KB.
const GRID = 80;

// The frames that rotate on the home page's reference monitor, in showing order.
// Landscape pieces only, because the monitor is 16:9; consecutive frames are
// picked to sit far apart in colour, so the cloud visibly travels between them.
const HERO = ['PH1', 'PH13', 'PH8', 'PH15', 'PH6', 'PH11', 'PH7', 'AMNM QND V1 1 1'];

// --- Inputs -------------------------------------------------------------------

const registry = readFileSync(path.join(root, 'client', 'src', 'portfolioAssets.ts'), 'utf8');
const assets = [...registry.matchAll(/title: '((?:[^'\\]|\\.)*)', kind: '(photo|video)'/g)].map((match, index) => ({
  title: match[1].replace(/\\'/g, "'"),
  kind: match[2],
  number: index + 1,
}));

const manifestPath = path.join(root, 'client', 'src', 'mediaManifest.json');
if (!existsSync(manifestPath)) {
  console.error('client/src/mediaManifest.json is missing. Run `npm run media` first.');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const posters = readFileSync(path.join(root, 'client', 'src', 'portfolioPosters.ts'), 'utf8');
const offsets = Object.fromEntries([...posters.matchAll(/"([^"]+)": \{ transform: '[^']*so_(\d+)p/g)].map((match) => [match[1], Number(match[2])]));

const numbered = (asset) => String(asset.number).padStart(2, '0');
const local = (url) => path.join(publicDir, ...url.split('/').filter(Boolean));
const web = (...parts) => `/suite/${parts.join('/')}`;

// --- Helpers ------------------------------------------------------------------

function ffmpeg(args, { capture = false } = {}) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    encoding: capture ? 'buffer' : 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${String(result.stderr).split('\n').slice(-4).join(' ')}`);
  return result.stdout;
}

const hex = (value) => Math.round(value).toString(16).padStart(2, '0');

const hashOf = (bytes) => createHash('sha1').update(bytes).digest('hex').slice(0, 8);

/** Renames a written file to carry its content hash; returns the new base name. */
function hashed(file) {
  const { dir, name, ext } = path.parse(file);
  const base = `${name}-${hashOf(readFileSync(file))}${ext}`;
  renameSync(file, path.join(dir, base));
  return base;
}

/** Mean colour of a sample, as a CSS hex: the placeholder a piece shows before it paints. */
function toneOf(bytes) {
  const sum = [0, 0, 0];
  for (let i = 0; i < bytes.length; i += 3) {
    sum[0] += bytes[i];
    sum[1] += bytes[i + 1];
    sum[2] += bytes[i + 2];
  }
  const count = bytes.length / 3;
  return `#${hex(sum[0] / count)}${hex(sum[1] / count)}${hex(sum[2] / count)}`;
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

/**
 * The colour with its hue and saturation kept and its relative luminance set to
 * `target`. Equal HSL lightness is not equal brightness (a cyan reads far brighter
 * than an amber), so the spill is held by luminance, which is what text contrast
 * is measured against.
 */
function atLuminance([r, g, b], target) {
  const luminance = ([lr, lg, lb]) => 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const linear = [r, g, b].map(toLinear);
  const y = luminance(linear);
  // One factor for every channel, capped where the brightest one would clip, so the
  // channels keep their ratios and the hue holds (a violet stays violet).
  const k = y > 0 ? Math.min(target / y, 1 / Math.max(...linear)) : 0;
  let scaled = linear.map((v) => v * k);
  // A saturated blue cannot reach a high luminance on its own channels; what the
  // cap held back is made up by moving toward white, so the target always holds.
  const reached = luminance(scaled);
  if (reached < target) {
    const t = (target - reached) / (1 - reached);
    scaled = scaled.map((v) => v + (1 - v) * t);
  }
  return `#${scaled.map((v) => hex(toGamma(v) * 255)).join('')}`;
}

// The light a piece throws on the room around the monitor: its three strongest
// hues at a capped saturation and one fixed luminance, so whatever the frame, the
// page's text keeps its contrast over it. A frame without real colour (a black and
// white still) throws neutral light.
const SPILL_LUMINANCE = 0.1;
const SPILL_SATURATION = 0.62;
const NEUTRAL_SPILL = ['#595959', '#3a3a3a', '#4f4f4f'];

/** The frame's hues, strongest first, as twelve 30-degree bins; null for a frame without real colour. */
function huesOf(bytes) {
  const bins = Array.from({ length: 12 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < bytes.length; i += 3) {
    const r = bytes[i] / 255;
    const g = bytes[i + 1] / 255;
    const b = bytes[i + 2] / 255;
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.08 || l < 0.06 || l > 0.94) continue;
    const weight = s * (1 - Math.abs(2 * l - 1));
    const bin = bins[Math.floor(h / 30) % 12];
    bin.weight += weight;
    bin.r += r * weight;
    bin.g += g * weight;
    bin.b += b * weight;
  }
  const ranked = bins.filter((bin) => bin.weight > 0).sort((a, b) => b.weight - a.weight);
  const strong = ranked.filter((bin) => bin.weight >= (ranked[0]?.weight ?? 0) * 0.12).slice(0, 3);
  if (!strong.length || strong[0].weight < (bytes.length / 3) * 0.006) return null;
  return strong;
}

function spillOf(bytes) {
  const strong = huesOf(bytes);
  if (!strong) return NEUTRAL_SPILL;
  const colours = strong.map((bin) => {
    const [h, s] = rgbToHsl(bin.r / bin.weight, bin.g / bin.weight, bin.b / bin.weight);
    return atLuminance(hslToRgb(h, Math.min(SPILL_SATURATION, s * 1.15), 0.5), SPILL_LUMINANCE);
  });
  while (colours.length < 3) colours.push(colours[colours.length - 1]);
  return colours;
}

// The interface accent for a piece: its strongest hue, vivid, held to one high
// luminance. At 0.45 the accent keeps dark key text at 8.7:1 and stays above 3:1
// against the lit surround behind it, film grain included, whatever the hue. A frame without
// real colour keeps the brand's own orange hue, held to the same luminance.
const ACCENT_LUMINANCE = 0.45;
const BRAND_ACCENT = atLuminance([0xf0 / 255, 0x6d / 255, 0x36 / 255], ACCENT_LUMINANCE);

function accentOf(bytes) {
  const strong = huesOf(bytes);
  if (!strong) return BRAND_ACCENT;
  const [top] = strong;
  const [h, s] = rgbToHsl(top.r / top.weight, top.g / top.weight, top.b / top.weight);
  return atLuminance(hslToRgb(h, Math.max(0.72, Math.min(0.9, s * 1.6)), 0.5), ACCENT_LUMINANCE);
}

// --- Build --------------------------------------------------------------------

// Rebuilt from scratch each run, so a renamed or removed piece leaves nothing behind.
for (const folder of ['frames', 'posters', 'samples']) {
  rmSync(path.join(outDir, folder), { recursive: true, force: true });
  mkdirSync(path.join(outDir, folder), { recursive: true });
}
mkdirSync(path.dirname(dataPath), { recursive: true });

const data = { grid: GRID, hero: [], pieces: {} };
const missing = [];

for (const asset of assets) {
  const media = manifest.assets[asset.title];
  if (!media?.thumb || !existsSync(local(media.thumb))) {
    missing.push(asset.title);
    continue;
  }
  const name = numbered(asset);
  const bytes = ffmpeg(['-i', local(media.thumb), '-vf', `scale=${GRID}:${GRID}:flags=neighbor`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { capture: true });
  if (bytes.length !== GRID * GRID * 3) throw new Error(`${asset.title}: expected ${GRID * GRID * 3} sample bytes, got ${bytes.length}`);
  const sampleName = `${name}-${hashOf(bytes)}.bin`;
  writeFileSync(path.join(outDir, 'samples', sampleName), bytes);
  // The thumb is already cut to the picture band and, for a film, its rest frame.
  const posterFile = path.join(outDir, 'posters', `${name}.webp`);
  ffmpeg(['-i', local(media.thumb), '-vf', "scale=w='min(480,iw)':h=-2", '-c:v', 'libwebp', '-quality', '72', posterFile]);
  data.pieces[asset.title] = { samples: web('samples', sampleName), poster: web('posters', hashed(posterFile)), tone: toneOf(bytes), spill: spillOf(bytes), accent: accentOf(bytes) };
}

for (const title of HERO) {
  const asset = assets.find((item) => item.title === title);
  const media = manifest.assets[title];
  if (!asset || !media?.full || !existsSync(local(media.full))) {
    missing.push(`${title} (hero frame)`);
    continue;
  }
  const name = numbered(asset);
  const source = local(media.full);
  // A film shows the frame it rests on everywhere else on the site: its measured
  // start offset, or its middle.
  const seek = asset.kind === 'video' ? ['-ss', String(((offsets[title] ?? 50) / 100) * media.duration)] : [];
  const frames = {};
  for (const width of [320, 800, 1600]) {
    const file = path.join(outDir, 'frames', `${name}-${width}.webp`);
    ffmpeg([...seek, '-i', source, '-frames:v', '1', '-vf', `scale=w='min(${width},iw)':h=-2`, '-c:v', 'libwebp', '-quality', width > 800 ? '78' : '80', file]);
    frames[width] = web('frames', hashed(file));
  }
  data.hero.push({
    title,
    number: asset.number,
    kind: asset.kind,
    width: media.width,
    height: media.height,
    duration: media.duration,
    frameSmall: frames[320],
    frame: frames[800],
    frameLarge: frames[1600],
  });
}

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${Object.keys(data.pieces).length} colour samples and posters, and ${data.hero.length} monitor frames to ${path.relative(root, dataPath)}`);
if (missing.length) console.log(`Skipped, no web version found (${missing.length}): ${missing.join(', ')}`);
