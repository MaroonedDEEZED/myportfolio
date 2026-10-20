// Builds the web versions of the portfolio media from the original files.
//
//   npm run media
//
// Reads the originals from media/ (git-ignored: the unpacked "Work Portfolio"
// archive, or the Dropbox folders), or from the folder named by MEDIA_SOURCE, and
// writes small, fast versions into client/public/portfolio-media/, plus
// client/src/mediaManifest.json. Both are committed: the site serves every piece
// itself and the Dropbox links are only a last resort. Safe to re-run: existing
// outputs are kept. Needs ffmpeg and ffprobe on the PATH.
//
//   MEDIA_SOURCE="../New folder/myportfolio-main/media" npm run media

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = process.env.MEDIA_SOURCE ? path.resolve(root, process.env.MEDIA_SOURCE) : path.join(root, 'media');
const outDir = path.join(root, 'client', 'public', 'portfolio-media');
const publicBase = '/portfolio-media';
const manifestPath = path.join(root, 'client', 'src', 'mediaManifest.json');

const SEGMENT = 6;   // seconds per hover preview

// --- Registry ---------------------------------------------------------------

const registry = readFileSync(path.join(root, 'client', 'src', 'portfolioAssets.ts'), 'utf8');
const assets = [...registry.matchAll(/title: '((?:[^'\\]|\\.)*)', kind: '(photo|video)'[^}]*?asset: '([^']+)'/g)].map((match, index) => ({
  title: match[1].replace(/\\'/g, "'"),
  kind: match[2],
  file: decodeURIComponent(match[3].split('?')[0].split('/').pop()),
  number: index + 1,
}));

const posters = readFileSync(path.join(root, 'client', 'src', 'portfolioPosters.ts'), 'utf8');
const adjustments = Object.fromEntries([...posters.matchAll(/"([^"]+)": \{ transform: '([^']+)'/g)].map((match) => [match[1], match[2]]));

// Files are named by the piece's number, never its source name: source names carry
// client names, and a browser offers the file name when a visitor saves a film.
const numbered = (asset) => String(asset.number).padStart(2, '0');

// --- Helpers ----------------------------------------------------------------

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || '').split('\n').slice(-4).join(' ')}`);
  return result.stdout;
}

function probe(file) {
  const data = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_entries', 'format=duration:stream=width,height,codec_type', file]));
  const video = data.streams.find((stream) => stream.codec_type === 'video') ?? {};
  return { duration: Number(data.format?.duration) || 0, width: video.width ?? 0, height: video.height ?? 0 };
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const ffmpeg = (args, out) => {
  if (existsSync(out)) return;
  mkdirSync(path.dirname(out), { recursive: true });
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args, out]);
};

/** The letterbox crop measured for this film (portfolioPosters.ts), as an ffmpeg filter. */
function cropFilter(title) {
  const match = adjustments[title]?.match(/c_crop,x_(\d+),y_(\d+),w_(\d+),h_(\d+)/);
  return match ? `crop=${match[3]}:${match[4]}:${match[1]}:${match[2]},` : '';
}

/** Where a film rests: its measured start offset, or the middle, as on the site. */
function restTime(title, duration) {
  const offset = adjustments[title]?.match(/so_(\d+)p/);
  return offset ? (duration * Number(offset[1])) / 100 : duration / 2;
}

const windowStart = (title, duration) => Math.max(0, Math.min(restTime(title, duration) - SEGMENT / 2, duration - SEGMENT));
const fitBox = (size) => `scale=w='min(${size},iw)':h='min(${size},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`;
const web = (url) => `${publicBase}/${url}`;

// --- Build ------------------------------------------------------------------

// Originals come from more than one source (the Dropbox folders, the "Work
// Portfolio" archive) whose filenames drift: "CQ1.mov" vs "CQ1_1.mp4", "OMO ad .mp4"
// vs "OMO ad-.mp4". Match on the name reduced to lowercase letters and digits,
// exactly first, then by unique prefix in either direction.
const key = (name) => name.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// The same file can sit in media/ twice (an unpacked archive beside a copied
// folder); a name-and-size pair counts once.
const seen = new Set();
const sources = walk(sourceDir).filter((file) => /\.(jpe?g|png|mp4|mov)$/i.test(file)).filter((file) => {
  const id = `${path.basename(file)}:${statSync(file).size}`;
  if (seen.has(id)) return false;
  seen.add(id);
  return true;
});
const used = new Set();
function findSource(fileName) {
  const want = key(fileName);
  const exact = sources.filter((file) => key(path.basename(file)) === want);
  const loose = exact.length ? exact : sources.filter((file) => {
    const have = key(path.basename(file));
    return have.length > 2 && (want.startsWith(have) || have.startsWith(want));
  });
  const free = loose.filter((file) => !used.has(file));
  if (free.length !== 1) return undefined;
  used.add(free[0]);
  return free[0];
}
const files = { get: findSource };
const manifest = { generated: new Date().toISOString(), assets: {} };
const missing = [];

for (const [index, asset] of assets.entries()) {
  const source = files.get(asset.file);
  if (!source) {
    missing.push(asset.file);
    continue;
  }
  const name = numbered(asset);
  const info = probe(source);
  process.stdout.write(`[${index + 1}/${assets.length}] ${asset.kind} ${asset.file}\n`);

  if (asset.kind === 'photo') {
    ffmpeg(['-i', source, '-vf', fitBox(720), '-q:v', '4'], path.join(outDir, 'thumbs', `${name}.jpg`));
    ffmpeg(['-i', source, '-vf', fitBox(2000), '-q:v', '3'], path.join(outDir, 'stills', `${name}.jpg`));
    manifest.assets[asset.title] = { thumb: web(`thumbs/${name}.jpg`), full: web(`stills/${name}.jpg`), width: info.width, height: info.height };
    continue;
  }

  const crop = cropFilter(asset.title);
  const start = windowStart(asset.title, info.duration);
  ffmpeg(['-ss', String(restTime(asset.title, info.duration)), '-i', source, '-frames:v', '1', '-vf', `${crop}${fitBox(720)}`, '-q:v', '4'], path.join(outDir, 'thumbs', `${name}.jpg`));
  ffmpeg(['-ss', String(start), '-t', String(SEGMENT), '-i', source, '-an', '-vf', `${crop}${fitBox(720)}`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], path.join(outDir, 'previews', `${name}.mp4`));
  // The film itself: 1080 on its long side, which fills the viewer on any screen
  // short of a large retina display, at a quality and size the site can host.
  ffmpeg(['-i', source, '-vf', fitBox(1080), '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-maxrate', '2000k', '-bufsize', '4000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart'], path.join(outDir, 'films', `${name}.mp4`));

  manifest.assets[asset.title] = {
    thumb: web(`thumbs/${name}.jpg`),
    preview: web(`previews/${name}.mp4`),
    full: web(`films/${name}.mp4`),
    duration: Math.round(info.duration * 10) / 10,
    width: info.width,
    height: info.height,
  };
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nWrote ${Object.keys(manifest.assets).length} assets to ${path.relative(root, manifestPath)}`);
if (missing.length) console.log(`Not found in media/ (${missing.length}): ${missing.join(', ')}`);
const unused = sources.filter((file) => !used.has(file)).map((file) => path.relative(sourceDir, file));
if (unused.length) console.log(`In media/ but not in the registry (${unused.length}): ${unused.join(', ')}`);
