import { fbm, hash2, noise2 } from "./materials";
import { smooth } from "./data";

// One source for the ground, shared by the terrain mesh, the rocks and the drive physics.
export const GROUND_SIZE = 70;
// The rover can roam this far from the start before the edge of the world pushes back.
export const ROAM = 28;

// Dunes, flattened to a pad around the start so the rover stands level for the tour.
export function duneAt(x: number, z: number) {
  const keep = smooth((Math.hypot(x, z) - 2.6) / 5);
  const dunes = (fbm(x * 0.09, z * 0.09, 5) - 0.5) * 2.2 + Math.max(0, fbm(x * 0.03 + 7, z * 0.03, 3) - 0.45) * 7;
  return dunes * keep;
}
// The drawn surface also has a centimetre of grit on top.
export const heightAt = (x: number, z: number) => duneAt(x, z) + (noise2(x * 1.6, z * 1.6) - 0.5) * 0.025;

export interface Rock {
  x: number;
  z: number;
  y: number;
  s: number;
  sx: number;
  sz: number;
  rot: [number, number, number];
  tone: number;
}

export const ROCKS: Rock[] = Array.from({ length: 170 }, (_, i) => {
  const a = hash2(i, 1.3) * Math.PI * 2;
  const big = Math.pow(hash2(i, 3.1), 3);
  const r = 2.6 + big * 5 + Math.pow(hash2(i, 7.7), 1.6) * 20;
  const s = 0.05 + big * 0.55;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  return {
    x,
    z,
    y: duneAt(x, z) + s * 0.25,
    s,
    sx: s * (0.8 + hash2(i, 5) * 0.6),
    sz: s * (0.8 + hash2(i, 6) * 0.6),
    rot: [hash2(i, 2) * 0.6, hash2(i, 9) * Math.PI * 2, hash2(i, 4) * 0.6],
    tone: i % 4,
  };
});

// Each rock as a dome the wheels can climb: its footprint and how far its top stands above the sand.
export interface Bump {
  x: number;
  z: number;
  r: number;
  top: number;
  base: number;
}
export const BUMPS: Bump[] = ROCKS.map((rock) => ({ x: rock.x, z: rock.z, r: Math.max(rock.sx, rock.sz) * 0.95, top: rock.s * 0.9, base: duneAt(rock.x, rock.z) }));

// A rocker-bogie climbs about one wheel diameter; anything taller stops the rover.
export const CLIMBABLE = 0.42;
export const BLOCKERS = BUMPS.filter((b) => b.top > CLIMBABLE).map((b) => ({ x: b.x, z: b.z, r: b.r * 0.8 }));

// The surface a wheel rests on: the dune, or the rock on top of it.
export function groundAt(x: number, z: number) {
  let h = heightAt(x, z);
  for (const b of BUMPS) {
    const dx = x - b.x;
    if (dx > b.r || dx < -b.r) continue;
    const dz = z - b.z;
    const q = 1 - (dx * dx + dz * dz) / (b.r * b.r);
    if (q > 0) h = Math.max(h, b.base + b.top * Math.sqrt(q));
  }
  return h;
}
