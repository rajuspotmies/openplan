// Shared by the scroll-scrubbed heroes: maps linear scroll progress to a
// timeline position, slowing down around points where something needs
// time to read (e.g. a callout label).

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export interface TimeMap {
  s: number[];
  t: number[];
}

// Builds a lookup table mapping linear scroll-progress (0..1) to timeline
// time (0..duration), where the mapping's slope is reduced around each slow
// point. A shallower slope means more scroll input is needed to advance
// the same amount of time, so the camera dwells there.
export function buildTimeMap(duration: number, points: number[], width: number, strength: number): TimeMap {
  const SAMPLES = 600;
  const minSpeed = clamp(1 - strength, 0.05, 1);
  const tSamples: number[] = [];
  const speedSamples: number[] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * duration;
    let speed = 1;
    for (const p of points) {
      const d = t - p;
      speed -= (1 - minSpeed) * Math.exp(-(d * d) / (2 * width * width));
    }
    tSamples.push(t);
    speedSamples.push(Math.max(speed, minSpeed));
  }

  const sSamples: number[] = [0];
  for (let i = 1; i <= SAMPLES; i++) {
    const dt = tSamples[i] - tSamples[i - 1];
    const avgInvSpeed = (1 / speedSamples[i] + 1 / speedSamples[i - 1]) / 2;
    sSamples.push(sSamples[i - 1] + avgInvSpeed * dt);
  }
  const total = sSamples[sSamples.length - 1] || 1;
  for (let i = 0; i < sSamples.length; i++) sSamples[i] /= total;

  return { s: sSamples, t: tSamples };
}

export function progressToTime(progress: number, map: TimeMap | null) {
  if (!map) return 0;
  const { s, t } = map;
  if (progress <= 0) return t[0];
  if (progress >= 1) return t[t.length - 1];

  let lo = 0;
  let hi = s.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid] < progress) lo = mid;
    else hi = mid;
  }
  const s0 = s[lo];
  const s1 = s[hi];
  const frac = s1 === s0 ? 0 : (progress - s0) / (s1 - s0);
  return t[lo] + frac * (t[hi] - t[lo]);
}
