import type { FrameSample } from './types';

const MIN = (a: number, b: number) => Math.min(a, b);
const MAX = (a: number, b: number) => Math.max(a, b);
const clamp01 = (v: number) => MAX(0, MIN(1, v));

export interface EyeContactResult {
  score: number;
  yaw: number;
  pitch: number;
  blink: number;
}

/**
 * Eye-contact score: penalize head turned away from the lens, softened during
 * natural blinks so a blink never reads as lost eye contact.
 */
export function eyeContactSample(blend: Map<string, number>, yaw: number, pitch: number): EyeContactResult {
  const blink = MAX(blend.get('eyeBlinkLeft') ?? 0, blend.get('eyeBlinkRight') ?? 0);
  const gazePenalty = clamp01((Math.abs(yaw) - 0.08) / 0.35) * 55 + clamp01((Math.abs(pitch) - 0.1) / 0.35) * 45;
  const softBlink = blink > 0.55 ? 0 : blink * 10;
  const score = clamp01(1 - (gazePenalty + softBlink) / 100) * 100;
  return { score, yaw, pitch, blink };
}

/** Expressive engagement from smile, brow raise, and jaw openness. */
export function engagementScore(blend: Map<string, number>): number {
  const smile = MAX(blend.get('mouthSmileLeft') ?? 0, blend.get('mouthSmileRight') ?? 0);
  const brow = blend.get('browInnerUp') ?? 0;
  const jaw = clamp01((blend.get('jawOpen') ?? 0) * 2.5);
  const expressiveness = clamp01(smile * 1.1 + brow * 0.55 + jaw * 0.4);
  const idlePenalty = expressiveness < 0.12 ? (0.12 - expressiveness) * 2.2 : 0;
  return clamp01(expressiveness * 1.35 - idlePenalty) * 100;
}

export class ComposureTracker {
  private samples: Array<{ yaw: number; pitch: number }> = [];
  private readonly window = 45;

  /** Penalize erratic head jitter over a rolling window. */
  push(yaw: number, pitch: number): number {
    this.samples.push({ yaw, pitch });
    if (this.samples.length > this.window) this.samples.shift();
    if (this.samples.length < 8) return 100;
    let jitter = 0;
    for (let i = 1; i < this.samples.length; i++) {
      jitter += Math.abs(yaw - this.samples[i - 1].yaw) + Math.abs(pitch - this.samples[i - 1].pitch);
    }
    jitter /= this.samples.length - 1;
    return clamp01(1 - jitter * 12) * 100;
  }
}

export interface LandmarkPoint {
  x: number;
  y: number;
}

/** Sanity-check the geometry of a landmark frame (guards against NaN/degenerate data). */
export function landmarksValid(points: LandmarkPoint[]): boolean {
  return Array.isArray(points) && points.length >= 468 && Number.isFinite(points[0]?.x);
}

export function isValidFrameSample(s: FrameSample): boolean {
  return [s.yaw, s.pitch, s.blink, s.smile, s.brow, s.jaw].every((v) => Number.isFinite(v));
}
