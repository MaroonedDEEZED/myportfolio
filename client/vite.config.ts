import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// The home page preloads the first monitor frame from index.html. Its file name
// carries a content hash (scripts/prepare-suite.mjs), so the href is filled in from
// the generated suite data on every serve and build rather than written by hand.
function heroFramePreload(): Plugin {
  const dataPath = fileURLToPath(new URL('./src/suite/suiteData.json', import.meta.url));
  return {
    name: 'hero-frame-preload',
    transformIndexHtml(html) {
      const [first] = JSON.parse(readFileSync(dataPath, 'utf8')).hero;
      return html.replaceAll('%HERO_FRAME_LARGE%', first.frameLarge).replaceAll('%HERO_FRAME%', first.frame);
    },
  };
}

export default defineConfig({
  plugins: [react(), heroFramePreload()],
  root: 'client',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
});
