// The colour cloud: every sampled pixel of a frame, plotted in 3D.
//
// Raw WebGL2 rather than three.js: one point cloud and a few graticule lines do not
// justify ~150 KB of library on a recruiter's phone. Positions are never stored. Each
// point carries only its colour, and the vertex shader places it in all three scope
// spaces at once, blending by mode weight, so a mode change and a cut between frames
// are both just uniforms moving.
//
//   cube    RGB, stood on its black corner so the neutral axis runs straight up
//   vector  Rec.709 YCbCr: Cb across, Cr into depth, luma up. Seen from above it
//           is the vectorscope; tilted, it shows how bright each hue sits
//   wave    the luma waveform: pixel column across, luma up, chroma as depth

export type ScopeMode = 'cube' | 'vector' | 'wave';

export type ScopeOptions = {
  canvas: HTMLCanvasElement;
  labels: HTMLElement;
  grid: number;
  reducedMotion: boolean;
  /** Called once if the GPU drops the context; the caller rebuilds on a fresh canvas. */
  onLost?: () => void;
};

export type Scope = {
  setSamples(samples: Uint8Array): void;
  setMode(mode: ScopeMode): void;
  orbit(dYaw: number, dPitch: number): void;
  /** The idle turn of the cube; off holds the cloud still at its current angle. */
  setAutoTurn(enabled: boolean): void;
  setVisible(visible: boolean): void;
  resize(): void;
  destroy(): void;
};

const MODES: ScopeMode[] = ['cube', 'vector', 'wave'];
const LUMA = [0.2126, 0.7152, 0.0722] as const;
const CHROMA_SCALE = 2.4;
const CUBE_SCALE = 1.0;
const WAVE_WIDTH = 1.7;
const WAVE_HEIGHT = 1.2;
const WIDE_LENS = (34 * Math.PI) / 180;
const LONG_LENS = (13 * Math.PI) / 180;

// Where the camera settles for each mode. Cube keeps whatever yaw it has.
const PRESET: Record<ScopeMode, { pitch: number; yaw: number | null }> = {
  cube: { pitch: 0.36, yaw: null },
  vector: { pitch: 1.5695, yaw: 0 },
  wave: { pitch: 0, yaw: 0 },
};

// --- Shaders ---------------------------------------------------------------------

const SPACES = /* glsl */ `
const vec3 LUMA = vec3(${LUMA.join(', ')});
uniform vec3 uWeights;
uniform mat3 uStand;

vec3 cubePos(vec3 c) { return uStand * (c - 0.5) * ${CUBE_SCALE.toFixed(3)}; }

vec3 vectorPos(vec3 c) {
  float y = dot(c, LUMA);
  float cb = (c.b - y) / 1.8556;
  float cr = (c.r - y) / 1.5748;
  return vec3(cb * ${CHROMA_SCALE.toFixed(2)}, (y - 0.5) * ${WAVE_HEIGHT.toFixed(2)}, -cr * ${CHROMA_SCALE.toFixed(2)});
}

vec3 wavePos(vec3 c, float column) {
  float y = dot(c, LUMA);
  float cb = (c.b - y) / 1.8556;
  float cr = (c.r - y) / 1.5748;
  return vec3((column - 0.5) * ${WAVE_WIDTH.toFixed(2)}, (y - 0.5) * ${WAVE_HEIGHT.toFixed(2)}, -length(vec2(cb, cr)) * ${(CHROMA_SCALE * 0.5).toFixed(2)});
}

vec3 place(vec3 c, float column) {
  return uWeights.x * cubePos(c) + uWeights.y * vectorPos(c) + uWeights.z * wavePos(c, column);
}
`;

const POINT_VERTEX = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aFrom;
layout(location = 1) in vec3 aTo;
uniform mat4 uViewProj;
uniform float uCut;
uniform float uGrid;
uniform float uPointSize;
out vec3 vColor;
${SPACES}
void main() {
  float index = float(gl_VertexID);
  float row = floor(index / uGrid);
  float column = (index - row * uGrid) / (uGrid - 1.0);
  // The cut sweeps down the frame a row at a time, like a wipe.
  float t = clamp(uCut * 1.6 - (row / (uGrid - 1.0)) * 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 color = mix(aFrom, aTo, t);
  gl_Position = uViewProj * vec4(place(color, column), 1.0);
  gl_PointSize = max(1.0, uPointSize / gl_Position.w);
  vColor = color;
}`;

const POINT_FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
in vec3 vColor;
uniform float uFloor;
uniform float uAlpha;
out vec4 outColor;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  // Near-black pixels would vanish against the scope's black glass. Lift their
  // brightness to a floor without touching hue or saturation.
  float peak = max(max(vColor.r, vColor.g), vColor.b);
  vec3 color = peak < uFloor ? (peak > 0.0001 ? vColor * (uFloor / peak) : vec3(uFloor)) : vColor;
  outColor = vec4(color, uAlpha * smoothstep(0.25, 0.1, r));
}`;

// Lines whose vertices are colours (the RGB cube's edges and its neutral axis).
// They travel through the same spaces as the points, so in the vectorscope the
// cube's edges flatten into the gamut hexagon, exactly as the maths says.
const COLOUR_LINE_VERTEX = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aColor;
uniform mat4 uViewProj;
${SPACES}
void main() {
  gl_Position = uViewProj * vec4(place(aColor, 0.5), 1.0);
}`;

// Lines that belong to one mode only (targets, skin line, IRE scale), faded by
// that mode's weight.
const WORLD_LINE_VERTEX = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in float aMode;
uniform mat4 uViewProj;
uniform vec3 uWeights;
out float vWeight;
void main() {
  vWeight = aMode < 0.5 ? uWeights.x : (aMode < 1.5 ? uWeights.y : uWeights.z);
  gl_Position = uViewProj * vec4(aPosition, 1.0);
}`;

const LINE_FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
uniform float uAlpha;
uniform vec3 uColor;
in float vWeight;
out vec4 outColor;
void main() { outColor = vec4(uColor, uAlpha * vWeight); }`;

const COLOUR_LINE_FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
uniform float uAlpha;
uniform vec3 uColor;
out vec4 outColor;
void main() { outColor = vec4(uColor, uAlpha); }`;

// --- Small matrix kit (column-major, as WebGL expects) ---------------------------

type Vec3 = [number, number, number];
type Mat4 = Float32Array;

function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

function lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const z = normalize(sub(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[column * 4 + k];
      out[column * 4 + row] = sum;
    }
  }
  return out;
}

/** Rotation that carries the cube's neutral diagonal (1,1,1) onto straight up. */
function standOnCorner(): Float32Array {
  const from = normalize([1, 1, 1]);
  const to: Vec3 = [0, 1, 0];
  const axis = normalize(cross(from, to));
  const angle = Math.acos(dot(from, to));
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  const [x, y, z] = axis;
  // Rodrigues' rotation, written column-major for a GLSL mat3.
  return new Float32Array([
    t * x * x + c, t * x * y + s * z, t * x * z - s * y,
    t * x * y - s * z, t * y * y + c, t * y * z + s * x,
    t * x * z + s * y, t * y * z - s * x, t * z * z + c,
  ]);
}

// The same placement the shaders do, on the CPU, for the label anchors.
function placeOnCpu(stand: Float32Array, color: Vec3, weights: Vec3, column = 0.5): Vec3 {
  const centred: Vec3 = [color[0] - 0.5, color[1] - 0.5, color[2] - 0.5];
  const cube: Vec3 = [
    (stand[0] * centred[0] + stand[3] * centred[1] + stand[6] * centred[2]) * CUBE_SCALE,
    (stand[1] * centred[0] + stand[4] * centred[1] + stand[7] * centred[2]) * CUBE_SCALE,
    (stand[2] * centred[0] + stand[5] * centred[1] + stand[8] * centred[2]) * CUBE_SCALE,
  ];
  const y = color[0] * LUMA[0] + color[1] * LUMA[1] + color[2] * LUMA[2];
  const cb = (color[2] - y) / 1.8556;
  const cr = (color[0] - y) / 1.5748;
  const vector: Vec3 = [cb * CHROMA_SCALE, (y - 0.5) * WAVE_HEIGHT, -cr * CHROMA_SCALE];
  const wave: Vec3 = [(column - 0.5) * WAVE_WIDTH, (y - 0.5) * WAVE_HEIGHT, -Math.hypot(cb, cr) * CHROMA_SCALE * 0.5];
  return [0, 1, 2].map((axis) => weights[0] * cube[axis] + weights[1] * vector[axis] + weights[2] * wave[axis]) as Vec3;
}

// --- Graticules ------------------------------------------------------------------

const CORNERS: Vec3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1],
];

// Each cube edge joins corners that differ in exactly one channel.
function cubeEdges(): number[] {
  const out: number[] = [];
  CORNERS.forEach((a, i) => CORNERS.forEach((b, j) => {
    if (j <= i) return;
    const differences = a.reduce((count, value, axis) => count + (value !== b[axis] ? 1 : 0), 0);
    if (differences === 1) out.push(...a, ...b);
  }));
  // The neutral axis, black to white: where every grey in the frame sits.
  out.push(0, 0, 0, 1, 1, 1);
  return out;
}

const vectorPoint = (color: Vec3): Vec3 => placeOnCpu(new Float32Array(9), color, [0, 1, 0]);

function worldLines(): number[] {
  const out: number[] = [];
  const line = (a: Vec3, b: Vec3, mode: number) => out.push(...a, mode, ...b, mode);
  const floor = -0.5 * WAVE_HEIGHT;

  // Vectorscope: 75% targets for the six primaries and secondaries, drawn as
  // small boxes on the floor plane, plus the skin-tone line and a 100% ring.
  const targets: Vec3[] = [[0.75, 0, 0], [0.75, 0, 0.75], [0, 0, 0.75], [0, 0.75, 0.75], [0, 0.75, 0], [0.75, 0.75, 0]];
  for (const target of targets) {
    const [x, , z] = vectorPoint(target);
    const size = 0.035;
    const corners: Vec3[] = [[x - size, floor, z - size], [x + size, floor, z - size], [x + size, floor, z + size], [x - size, floor, z + size]];
    corners.forEach((corner, i) => line(corner, corners[(i + 1) % 4], 1));
  }
  const ring = vectorPoint([1, 0, 0]);
  const radius = Math.hypot(ring[0], ring[2]);
  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2;
    const b = ((i + 1) / 72) * Math.PI * 2;
    line([Math.cos(a) * radius, floor, Math.sin(a) * radius], [Math.cos(b) * radius, floor, Math.sin(b) * radius], 1);
  }
  // Skin tones of every complexion fall close to one line, at about 123° on the
  // scope (Cb across, Cr up).
  const skin = (123 * Math.PI) / 180;
  line([0, floor, 0], [Math.cos(skin) * radius, floor, -Math.sin(skin) * radius], 1);
  line([-radius, floor, 0], [radius, floor, 0], 1);
  line([0, floor, -radius], [0, floor, radius], 1);

  // Waveform: the IRE scale, 0 to 100 in quarters.
  for (let step = 0; step <= 4; step += 1) {
    const y = (step / 4 - 0.5) * WAVE_HEIGHT;
    line([-WAVE_WIDTH / 2, y, 0], [WAVE_WIDTH / 2, y, 0], 2);
  }
  return out;
}

type Label = { text: string; mode: number; at: (stand: Float32Array, weights: Vec3) => Vec3 };

function labelSet(): Label[] {
  const atColor = (color: Vec3, mode: number) => (stand: Float32Array, weights: Vec3) => (mode === 0 ? placeOnCpu(stand, color, weights) : placeOnCpu(stand, color, [0, 1, 0]));
  const floorTarget = (color: Vec3): Vec3 => {
    const [x, , z] = vectorPoint(color);
    return [x * 1.18, -0.5 * WAVE_HEIGHT, z * 1.18];
  };
  return [
    { text: 'R', mode: 0, at: atColor([1, 0, 0], 0) },
    { text: 'G', mode: 0, at: atColor([0, 1, 0], 0) },
    { text: 'B', mode: 0, at: atColor([0, 0, 1], 0) },
    { text: 'White', mode: 0, at: atColor([1, 1, 1], 0) },
    { text: 'Black', mode: 0, at: atColor([0, 0, 0], 0) },
    ...(['R', 'Mg', 'B', 'Cy', 'G', 'Yl'] as const).map((text, i) => {
      const target: Vec3 = ([[1, 0, 0], [1, 0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 0], [1, 1, 0]] as Vec3[])[i];
      return { text, mode: 1, at: () => floorTarget(target) };
    }),
    { text: 'Skin', mode: 1, at: () => [Math.cos((123 * Math.PI) / 180) * 1.05, -0.5 * WAVE_HEIGHT, -Math.sin((123 * Math.PI) / 180) * 1.05] as Vec3 },
    ...[0, 25, 50, 75, 100].map((ire) => ({ text: String(ire), mode: 2, at: () => [-WAVE_WIDTH / 2 - 0.08, (ire / 100 - 0.5) * WAVE_HEIGHT, 0] as Vec3 })),
  ];
}

// --- GL plumbing -----------------------------------------------------------------

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader failed');
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed');
  const uniforms = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program, name));
    return uniforms.get(name) ?? null;
  };
  return { program, u };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Returns null when WebGL2 is unavailable, so the caller can draw its 2D fallback. */
export function createScope({ canvas, labels, grid, reducedMotion, onLost: reportLost }: ScopeOptions): Scope | null {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return null;

  const count = grid * grid;
  const stand = standOnCorner();
  const points = compile(gl, POINT_VERTEX, POINT_FRAGMENT);
  const colourLines = compile(gl, COLOUR_LINE_VERTEX, COLOUR_LINE_FRAGMENT);
  const modeLines = compile(gl, WORLD_LINE_VERTEX, LINE_FRAGMENT);

  // Points: two colour buffers, the frame being left and the frame arriving.
  const from = new Uint8Array(count * 3);
  const to = new Uint8Array(count * 3);
  const pointVao = gl.createVertexArray()!;
  gl.bindVertexArray(pointVao);
  const fromBuffer = gl.createBuffer()!;
  const toBuffer = gl.createBuffer()!;
  for (const [location, buffer, data] of [[0, fromBuffer, from], [1, toBuffer, to]] as const) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.UNSIGNED_BYTE, true, 0, 0);
  }

  const edgeData = new Float32Array(cubeEdges());
  const edgeVao = gl.createVertexArray()!;
  gl.bindVertexArray(edgeVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, edgeData, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  const worldData = new Float32Array(worldLines());
  const worldVao = gl.createVertexArray()!;
  gl.bindVertexArray(worldVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, worldData, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
  gl.bindVertexArray(null);

  // Labels are DOM, positioned from the same projection each frame.
  const anchors = labelSet();
  const labelNodes = anchors.map((anchor) => {
    const node = document.createElement('span');
    node.className = `scope-label scope-label--${MODES[anchor.mode]}`;
    node.textContent = anchor.text;
    labels.appendChild(node);
    return node;
  });

  // --- State ---
  let weights: Vec3 = [1, 0, 0];
  let weightsFrom: Vec3 = [1, 0, 0];
  let weightsTo: Vec3 = [1, 0, 0];
  let modeStart = -1;
  // A mode change tweens the weights and the camera together. Grabbing the cloud
  // mid-tween hands the camera to the visitor, but the weights still finish, so the
  // cloud never rests halfway between two spaces.
  let cameraTween = false;
  let yaw = -0.6;
  let pitch = PRESET.cube.pitch;
  let yawFrom = yaw;
  let pitchFrom = pitch;
  let yawTo = yaw;
  let pitchTo = pitch;
  let mode: ScopeMode = 'cube';
  let cut = 1;
  let cutStart = -1;
  let hasSamples = false;
  let lastInteraction = -Infinity;
  let autoTurn = true;
  let lost = false;
  let visible = true;
  let frameRequest = 0;
  let lastTime = 0;
  let width = 1;
  let height = 1;
  let dpr = 1;

  const MODE_MS = reducedMotion ? 0 : 950;
  const CUT_MS = reducedMotion ? 0 : 1250;
  const INTRO_MS = reducedMotion ? 0 : 1900;
  let cutDuration = INTRO_MS;

  const animating = (now: number) => (modeStart >= 0 && now - modeStart < MODE_MS) || (cutStart >= 0 && now - cutStart < cutDuration);
  const autoTurning = (now: number) => autoTurn && !reducedMotion && mode === 'cube' && now - lastInteraction > 3500;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    request();
  }

  function draw(now: number) {
    frameRequest = 0;
    if (lost) return;
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;

    if (modeStart >= 0) {
      const t = MODE_MS ? Math.min(1, (now - modeStart) / MODE_MS) : 1;
      const e = easeInOut(t);
      weights = [0, 1, 2].map((i) => weightsFrom[i] + (weightsTo[i] - weightsFrom[i]) * e) as Vec3;
      if (cameraTween) {
        yaw = yawFrom + (yawTo - yawFrom) * e;
        pitch = pitchFrom + (pitchTo - pitchFrom) * e;
      }
      if (t >= 1) {
        modeStart = -1;
        cameraTween = false;
      }
    }
    if (cutStart >= 0) {
      const t = cutDuration ? Math.min(1, (now - cutStart) / cutDuration) : 1;
      cut = easeOut(t);
      if (t >= 1) cutStart = -1;
    }
    if (autoTurning(now) && modeStart < 0) yaw += dt * 0.16;

    // The cube is seen through a wide lens, for depth. The two scopes are read as
    // flat charts, so the camera dollies back while the lens lengthens (a dolly
    // zoom): the framing holds and the perspective drains out of the picture.
    const aspect = width / height;
    const fov = LONG_LENS + (WIDE_LENS - LONG_LENS) * weights[0];
    // The vectorscope's 100% ring is wider than the cube, so it is framed a little looser.
    const framing = (aspect < 0.9 ? 4.2 : 3.4) * (weights[0] + weights[1] * 1.32 + weights[2]);
    const distance = (framing * Math.tan(WIDE_LENS / 2)) / Math.tan(fov / 2);
    const eye: Vec3 = [
      Math.sin(yaw) * Math.cos(pitch) * distance,
      Math.sin(pitch) * distance,
      Math.cos(yaw) * Math.cos(pitch) * distance,
    ];
    const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
    const projection = perspective(fov, aspect, 0.1, 40);
    const viewProj = multiply(projection, view);

    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.clearColor(0.024, 0.024, 0.024, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.enable(gl!.BLEND);

    // Graticules first, quietly.
    gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(colourLines.program);
    gl!.uniformMatrix4fv(colourLines.u('uViewProj'), false, viewProj);
    gl!.uniformMatrix3fv(colourLines.u('uStand'), false, stand);
    gl!.uniform3fv(colourLines.u('uWeights'), weights);
    gl!.uniform3f(colourLines.u('uColor'), 1, 1, 1);
    // In the vectorscope the cube's edges become the gamut hexagon: kept, but quieter than the graticule.
    gl!.uniform1f(colourLines.u('uAlpha'), 0.2 * weights[0] + 0.08 * weights[1]);
    gl!.bindVertexArray(edgeVao);
    gl!.drawArrays(gl!.LINES, 0, edgeData.length / 3);

    gl!.useProgram(modeLines.program);
    gl!.uniformMatrix4fv(modeLines.u('uViewProj'), false, viewProj);
    gl!.uniform3fv(modeLines.u('uWeights'), [0, weights[1], weights[2]]);
    gl!.uniform3f(modeLines.u('uColor'), 1, 1, 1);
    gl!.uniform1f(modeLines.u('uAlpha'), 0.24);
    gl!.bindVertexArray(worldVao);
    gl!.drawArrays(gl!.LINES, 0, worldData.length / 4);

    // Points add light like a scope trace: where many pixels share a colour, it glows.
    if (hasSamples) {
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE);
      gl!.useProgram(points.program);
      gl!.uniformMatrix4fv(points.u('uViewProj'), false, viewProj);
      gl!.uniformMatrix3fv(points.u('uStand'), false, stand);
      gl!.uniform3fv(points.u('uWeights'), weights);
      gl!.uniform1f(points.u('uCut'), cut);
      gl!.uniform1f(points.u('uGrid'), grid);
      gl!.uniform1f(points.u('uPointSize'), (width < 420 ? 2.8 : 3.4) * dpr * distance);
      gl!.uniform1f(points.u('uFloor'), 0.16);
      gl!.uniform1f(points.u('uAlpha'), 0.78 * weights[0] + 0.5 * weights[1] + 0.55 * weights[2]);
      gl!.bindVertexArray(pointVao);
      gl!.drawArrays(gl!.POINTS, 0, count);
    }
    gl!.bindVertexArray(null);

    // Labels, from the same projection.
    anchors.forEach((anchor, i) => {
      const [x, y, z] = anchor.at(stand, weights);
      const clipX = viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12];
      const clipY = viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13];
      const clipW = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
      const node = labelNodes[i];
      const weight = weights[anchor.mode];
      if (clipW <= 0 || weight < 0.02) {
        node.style.opacity = '0';
        return;
      }
      const sx = ((clipX / clipW) * 0.5 + 0.5) * width;
      const sy = (1 - ((clipY / clipW) * 0.5 + 0.5)) * height;
      node.style.opacity = String(Math.min(1, weight * 1.2));
      node.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -50%)`;
    });

    if (visible && (animating(now) || autoTurning(now))) request();
    else lastTime = 0;
  }

  function request() {
    if (!frameRequest && visible && !lost) frameRequest = requestAnimationFrame(draw);
  }

  function setSamples(samples: Uint8Array) {
    if (lost || samples.length !== count * 3) return;
    const now = performance.now();
    if (!hasSamples) {
      // First frame: every point rises out of black to its colour.
      from.fill(0);
      cutDuration = INTRO_MS;
    } else {
      // Freeze wherever the points are right now, so an interrupted cut never jumps.
      for (let i = 0; i < count; i += 1) {
        const row = Math.floor(i / grid) / (grid - 1);
        let t = Math.min(1, Math.max(0, cut * 1.6 - row * 0.6));
        t = t * t * (3 - 2 * t);
        for (let c = 0; c < 3; c += 1) from[i * 3 + c] = Math.round(from[i * 3 + c] + (to[i * 3 + c] - from[i * 3 + c]) * t);
      }
      cutDuration = CUT_MS;
    }
    to.set(samples);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, fromBuffer);
    gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, from);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, toBuffer);
    gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, to);
    hasSamples = true;
    cut = cutDuration ? 0 : 1;
    cutStart = now;
    request();
  }

  function setMode(next: ScopeMode) {
    if (next === mode && modeStart < 0) return;
    mode = next;
    weightsFrom = weights;
    weightsTo = MODES.map((name) => (name === next ? 1 : 0)) as Vec3;
    yawFrom = yaw;
    pitchFrom = pitch;
    const preset = PRESET[next];
    pitchTo = preset.pitch;
    if (preset.yaw === null) {
      yawTo = yaw;
    } else {
      // Settle by the shortest way round.
      const turns = Math.round((yaw - preset.yaw) / (Math.PI * 2));
      yawTo = preset.yaw + turns * Math.PI * 2;
    }
    modeStart = performance.now();
    cameraTween = true;
    request();
  }

  function orbit(dYaw: number, dPitch: number) {
    lastInteraction = performance.now();
    cameraTween = false;
    yaw += dYaw;
    pitch = Math.max(-1.2, Math.min(1.5695, pitch + dPitch));
    request();
  }

  function setAutoTurn(enabled: boolean) {
    autoTurn = enabled;
    request();
  }

  function setVisible(next: boolean) {
    visible = next;
    if (visible) request();
  }

  // Mobile browsers drop WebGL contexts under memory pressure or in a background
  // tab. Everything this renderer built dies with the context, so it stops for good
  // and tells its owner, which mounts a fresh canvas and a fresh renderer.
  const onLost = (event: Event) => {
    event.preventDefault();
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    lost = true;
    reportLost?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  resize();

  return {
    setSamples,
    setMode,
    orbit,
    setAutoTurn,
    setVisible,
    resize,
    destroy() {
      if (frameRequest) cancelAnimationFrame(frameRequest);
      canvas.removeEventListener('webglcontextlost', onLost);
      labelNodes.forEach((node) => node.remove());
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
