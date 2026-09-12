const fs = require('fs');
const path = require('path');

const cloudName = 'zsyvfq70';
const imageBase = `https://res.cloudinary.com/${cloudName}/image/upload/v1789235623/`;
const videoBase = `https://res.cloudinary.com/${cloudName}/video/upload/`;
const posterVideoBase = `https://res.cloudinary.com/${cloudName}/video/upload/h_250,q_auto/`;

const posterForVideoFile = (file) => {
  const publicId = file
    .replace(/\.mp4$/i, '')
    .replace(/\.mov$/i, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_');

  return `${posterVideoBase}${publicId}.jpg`;
};

const photosDir = path.resolve(__dirname, '../public/portfolio-media/Photos');
const videosDir = path.resolve(__dirname, '../public/portfolio-media/Videos and Ads');

const imageFiles = fs.readdirSync(photosDir)
  .filter((file) => file.toLowerCase().endsWith('.jpg'))
  .sort();

const videoFiles = fs.readdirSync(videosDir)
  .filter((file) => file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.mov'))
  .sort();

const encodeAssetName = (file) => encodeURIComponent(file);

const photoAssets = imageFiles.map((file) => ({
  title: file.replace(/\.jpg$/i, '').replace(/[_-]/g, ' '),
  kind: 'photo',
  year: '2025',
  location: 'Portfolio',
  summary: 'Portfolio work',
  asset: imageBase + encodeAssetName(file),
}));

const videoAssets = videoFiles.map((file) => ({
  title: file.replace(/\.mp4$/i, '').replace(/\.mov$/i, '').replace(/[_-]/g, ' '),
  kind: 'video',
  year: '2025',
  location: 'Portfolio',
  summary: 'Portfolio work',
  asset: videoBase + encodeAssetName(file),
  poster: posterForVideoFile(file),
}));

const assets = [...photoAssets, ...videoAssets];

const output = `export type PortfolioKind = 'photo' | 'video';\n` +
`export type PortfolioAsset = { title: string; kind: PortfolioKind; year: string; location: string; summary: string; asset: string; poster?: string; };\n` +
`export const portfolioAssets: PortfolioAsset[] = [\n` +
`${assets.map((asset) => {
  const lines = [
    `{ title: '${asset.title.replace(/'/g, "\\'")}',`,
    `kind: '${asset.kind}',`,
    `year: '${asset.year}',`,
    `location: '${asset.location.replace(/'/g, "\\'")}',`,
    `summary: '${asset.summary.replace(/'/g, "\\'")}',`,
    `asset: '${asset.asset.replace(/'/g, "\\'")}',`,
  ];

  if (asset.kind === 'video') {
    lines.push(`poster: '${asset.poster?.replace(/'/g, "\\'")}'`);
  }

  lines.push('},');

  return lines.join('\n  ');
}).join('\n')}\n` +
`];\n`;

fs.writeFileSync(path.resolve(__dirname, 'portfolioAssets.ts'), output);
console.log(`Generated portfolioAssets.ts with ${assets.length} entries`);
