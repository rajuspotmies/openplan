import * as THREE from "three";
import { DIM } from "./data";

// ---------- Procedural textures (no image assets) ----------

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

let solar: THREE.CanvasTexture | null = null;
// Monocrystalline cells: deep blue with silver busbars and fingers, a thin white gap between cells.
export function solarTexture() {
  if (solar) return solar;
  const { cols, rows } = DIM.solar;
  const cw = 64;
  const ch = 64;
  solar = canvasTexture(cols * cw, rows * ch, (ctx) => {
    ctx.fillStyle = "#cfd3d8";
    ctx.fillRect(0, 0, cols * cw, rows * ch);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = c * cw + 2;
        const y = r * ch + 2;
        const g = ctx.createLinearGradient(x, y, x + cw, y + ch);
        g.addColorStop(0, "#14306e");
        g.addColorStop(0.5, "#0d2257");
        g.addColorStop(1, "#173a80");
        ctx.fillStyle = g;
        // cells with clipped corners
        ctx.beginPath();
        const k = 6;
        ctx.moveTo(x + k, y);
        ctx.lineTo(x + cw - 4 - k, y);
        ctx.lineTo(x + cw - 4, y + k);
        ctx.lineTo(x + cw - 4, y + ch - 4 - k);
        ctx.lineTo(x + cw - 4 - k, y + ch - 4);
        ctx.lineTo(x + k, y + ch - 4);
        ctx.lineTo(x, y + ch - 4 - k);
        ctx.lineTo(x, y + k);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(200,210,225,0.35)";
        ctx.lineWidth = 0.6;
        for (let f = 1; f < 12; f++) {
          ctx.beginPath();
          ctx.moveTo(x + 2, y + (f * (ch - 4)) / 12);
          ctx.lineTo(x + cw - 6, y + (f * (ch - 4)) / 12);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(220,226,235,0.85)";
        for (const bx of [0.3, 0.7]) ctx.fillRect(x + bx * (cw - 4) - 1, y, 2, ch - 4);
      }
  });
  return solar;
}

// A cheap value noise for textures and terrain.
export function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x: number, y: number, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

function normalFromHeight(size: number, height: (x: number, y: number) => number, strength: number) {
  const data = new Uint8Array(size * size * 4);
  const h = (x: number, y: number) => height((x + size) % size, (y + size) % size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      data[i + 2] = (1 / len) * 0.5 * 255 + 127;
      data[i + 3] = 255;
    }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

let foil: THREE.DataTexture | null = null;
let foilMap: THREE.DataTexture | null = null;
let foilHeights: Float32Array | null = null;
const FOIL = 256;
// Crinkled multi-layer insulation: sharp facets from a few octaves of ridged noise.
function foilField() {
  if (foilHeights) return foilHeights;
  const size = FOIL;
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 1;
      let f = 6 / size;
      for (let o = 0; o < 4; o++) {
        v += amp * (1 - Math.abs(noise2(x * f + o * 17, y * f + o * 31) * 2 - 1));
        amp *= 0.5;
        f *= 2;
      }
      heights[y * size + x] = v;
    }
  foilHeights = heights;
  return heights;
}
export function foilNormal() {
  if (foil) return foil;
  const heights = foilField();
  foil = normalFromHeight(FOIL, (x, y) => heights[y * FOIL + x], 6);
  foil.repeat.set(3, 2);
  return foil;
}
// The foil's colour: deep amber in the folds, pale gold on the ridges, so it reads as gold under any light.
export function foilColor() {
  if (foilMap) return foilMap;
  const heights = foilField();
  let lo = Infinity;
  let hi = -Infinity;
  for (const h of heights) {
    lo = Math.min(lo, h);
    hi = Math.max(hi, h);
  }
  const deep = new THREE.Color("#7a5216");
  const pale = new THREE.Color("#f6d987");
  const c = new THREE.Color();
  const data = new Uint8Array(FOIL * FOIL * 4);
  heights.forEach((h, i) => {
    const t = Math.pow((h - lo) / (hi - lo), 1.4);
    c.copy(deep).lerp(pale, t);
    data.set([c.r * 255, c.g * 255, c.b * 255, 255], i * 4);
  });
  foilMap = new THREE.DataTexture(data, FOIL, FOIL);
  foilMap.colorSpace = THREE.SRGBColorSpace;
  foilMap.wrapS = foilMap.wrapT = THREE.RepeatWrapping;
  foilMap.repeat.set(3, 2);
  foilMap.needsUpdate = true;
  return foilMap;
}

let sand: THREE.DataTexture | null = null;
export function sandNormal() {
  if (sand) return sand;
  const size = 256;
  sand = normalFromHeight(size, (x, y) => fbm(x / 9, y / 9, 3) + 0.4 * noise2(x / 2.2, y / 2.2) + 0.25 * Math.sin((x + fbm(x / 30, y / 30, 2) * 40) / 4.5), 2.4);
  sand.repeat.set(18, 18);
  return sand;
}

// ---------- Materials ----------

export type MatKey =
  | "paint"
  | "panel"
  | "gold"
  | "alu"
  | "titanium"
  | "anodized"
  | "black"
  | "rubber"
  | "copper"
  | "kapton"
  | "glass"
  | "solar"
  | "rtgCore"
  | "rtgFin"
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "chipWhite"
  | "chipBlack";

export type MaterialSet = Record<MatKey, THREE.MeshStandardMaterial>;

// Every assembly gets its own set, so hover, focus and x-ray can act on one assembly at a time.
export function makeMaterials(): MaterialSet {
  const std = (color: string, roughness: number, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const phys = (color: string, roughness: number, metalness: number, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness, metalness, ...extra });
  return {
    paint: phys("#ece9e2", 0.48, 0, { clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    panel: std("#d9d4c9", 0.62),
    gold: std("#ffffff", 0.36, 0.75, { map: foilColor(), normalMap: foilNormal(), normalScale: new THREE.Vector2(0.18, 0.18), envMapIntensity: 1.8 }),
    alu: std("#d3d8df", 0.3, 1, { envMapIntensity: 1.6 }),
    titanium: std("#bdb6ab", 0.36, 0.85, { envMapIntensity: 1.4 }),
    anodized: std("#2b2e35", 0.42, 0.65),
    black: std("#16171b", 0.55, 0.2),
    rubber: std("#101114", 0.85),
    copper: std("#c0703f", 0.3, 1),
    kapton: std("#c9732c", 0.45, 0.1),
    glass: phys("#070b18", 0.04, 0.2, { clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }),
    solar: phys("#ffffff", 0.3, 0.25, { map: solarTexture(), clearcoat: 0.5, clearcoatRoughness: 0.12, envMapIntensity: 0.7 }),
    rtgCore: std("#3b3c41", 0.45, 0.6, { emissive: new THREE.Color("#ff5a1f"), emissiveIntensity: 0 }),
    rtgFin: std("#45464c", 0.5, 0.55),
    red: std("#c8282e", 0.55),
    green: std("#2f9a4a", 0.55),
    blue: std("#2a55b8", 0.55),
    yellow: std("#e3b520", 0.55),
    chipWhite: std("#f2f2f0", 0.6),
    chipBlack: std("#121212", 0.7),
  };
}

// Store the base look once so highlight and x-ray can blend back to it.
export function rememberBase(set: MaterialSet) {
  for (const m of Object.values(set)) {
    m.userData.baseEmissive = m.emissive.clone();
    m.userData.baseEmissiveIntensity = m.emissiveIntensity;
  }
}

let track: THREE.CanvasTexture | null = null;
// A wheel's print in the sand: a pressed band with the chevron grousers stamped across it.
// White with alpha, so the trail's own colour and fade tint it.
export function trackTexture() {
  if (track) return track;
  track = canvasTexture(64, 128, (ctx) => {
    ctx.clearRect(0, 0, 64, 128);
    const band = ctx.createLinearGradient(0, 0, 64, 0);
    band.addColorStop(0, "rgba(255,255,255,0)");
    band.addColorStop(0.12, "rgba(255,255,255,0.62)");
    band.addColorStop(0.88, "rgba(255,255,255,0.62)");
    band.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, 64, 128);
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    // two chevrons per tile; the texture repeats along the trail
    for (const y of [32, 96]) {
      ctx.beginPath();
      ctx.moveTo(8, y + 14);
      ctx.lineTo(32, y - 10);
      ctx.lineTo(56, y + 14);
      ctx.stroke();
    }
  });
  track.wrapS = THREE.ClampToEdgeWrapping;
  track.wrapT = THREE.RepeatWrapping;
  return track;
}
