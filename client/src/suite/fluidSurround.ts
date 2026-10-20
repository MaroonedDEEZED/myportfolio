// The lit surround as a fluid: slow, domain-warped pools of the current piece's
// spill colours, and, when the piece changes, the new colours pouring out from the
// monitor with a turbulent front, like ink spreading through water.
//
// One full-screen quad in WebGL1. The field is soft by nature, so it renders at a
// eighth of the screen's resolution and the browser scales it up; it ticks at 30 fps
// at most and stops while the tab is hidden. Every spill colour is held to one
// luminance at build time and the shader only mixes them with the grey, so the
// result never gets brighter than the colours themselves and text contrast holds.

type Rgb = [number, number, number];

export type Fluid = {
  /** Flow to new colours, spreading from `origin` (0 to 1 across, 0 to 1 up the screen). */
  setPalette(colours: string[], origin?: [number, number]): void;
  destroy(): void;
};

const SCALE = 8;
const FRAME_MS = 1000 / 30;
const FLOW_MS = 2200;

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform vec2 uOrigin;
uniform vec3 uBase;
uniform vec3 uFrom0;
uniform vec3 uFrom1;
uniform vec3 uFrom2;
uniform vec3 uTo0;
uniform vec3 uTo1;
uniform vec3 uTo2;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

// Three pools of light, warped through each other so they move like liquid.
vec3 room(vec2 p, vec3 c0, vec3 c1, vec3 c2, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.05)), fbm(p + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.03), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.035));
  float f = fbm(p + 3.0 * r);
  vec3 colour = uBase;
  colour = mix(colour, c0, smoothstep(0.26, 0.82, f) * 0.85);
  colour = mix(colour, c1, smoothstep(0.28, 0.8, r.x) * 0.7);
  colour = mix(colour, c2, smoothstep(0.36, 0.88, q.y) * 0.55);
  // Pockets of shadow where the light thins out.
  return colour * mix(0.84, 1.0, smoothstep(0.12, 0.7, f));
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  // Broad pools: a low spatial frequency, so the field reads as light, not texture.
  vec2 field = p * 1.05;
  vec3 next = room(field, uTo0, uTo1, uTo2, uTime);
  if (uProgress >= 1.0) {
    gl_FragColor = vec4(next, 1.0);
    return;
  }
  vec3 previous = room(field, uFrom0, uFrom1, uFrom2, uTime);
  // The new light spreads out from the monitor; its edge is torn by the same noise.
  vec2 origin = vec2(uOrigin.x * aspect, uOrigin.y);
  float distance = length(p - origin) + (fbm(p * 3.0 + uTime * 0.2) - 0.5) * 0.45;
  float reach = uProgress * (aspect + 1.6);
  float still = smoothstep(reach - 0.32, reach, distance);
  gl_FragColor = vec4(mix(next, previous, still), 1.0);
}`;

const toRgb = (hex: string): Rgb => {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Returns null when WebGL is unavailable; the CSS pools then stay as the surround. */
export function createFluid(canvas: HTMLCanvasElement, base: string, reducedMotion: boolean): Fluid | null {
  const context = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader failed');
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed');
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform3fv(u('uBase'), toRgb(base));

  let from: Rgb[] = [toRgb(base), toRgb(base), toRgb(base)];
  let to: Rgb[] = from;
  let progress = 1;
  let flowStart = 0;
  let origin: [number, number] = [0.5, 0.75];
  let frame = 0;
  let lastDraw = 0;
  let lost = false;
  const started = performance.now();

  function resize() {
    canvas.width = Math.max(1, Math.ceil(window.innerWidth / SCALE));
    canvas.height = Math.max(1, Math.ceil(window.innerHeight / SCALE));
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (reducedMotion) draw(performance.now());
  }

  function draw(now: number) {
    if (lost) return;
    if (flowStart) {
      const t = Math.min(1, (now - flowStart) / FLOW_MS);
      progress = easeInOut(t);
      if (t >= 1) flowStart = 0;
    }
    // Held still for reduced motion: the field keeps one shape.
    gl.uniform1f(u('uTime'), reducedMotion ? 12 : (now - started) / 1000);
    gl.uniform2f(u('uRes'), canvas.width, canvas.height);
    gl.uniform1f(u('uProgress'), progress);
    gl.uniform2f(u('uOrigin'), origin[0], origin[1]);
    from.forEach((colour, i) => gl.uniform3fv(u(`uFrom${i}`), colour));
    to.forEach((colour, i) => gl.uniform3fv(u(`uTo${i}`), colour));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function tick(now: number) {
    frame = 0;
    if (document.visibilityState !== 'visible' || lost) return;
    if (now - lastDraw >= FRAME_MS) {
      lastDraw = now;
      draw(now);
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion) {
      draw(performance.now());
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }

  const onVisibility = () => start();
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    canvas.dispatchEvent(new CustomEvent('fluidlost'));
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', resize);
  canvas.addEventListener('webglcontextlost', onLost);
  resize();
  start();

  return {
    setPalette(colours, at) {
      if (!colours.length || lost) return;
      const next = [0, 1, 2].map((i) => toRgb(colours[i] ?? colours[0]));
      // A change mid-flow starts from roughly where the room is now.
      const current = to.map((colour, i) => colour.map((value, c) => from[i][c] + (value - from[i][c]) * progress) as Rgb);
      from = progress >= 1 ? to : current;
      to = next;
      if (at) origin = at;
      if (reducedMotion) {
        progress = 1;
        draw(performance.now());
        return;
      }
      progress = 0;
      flowStart = performance.now();
      start();
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
