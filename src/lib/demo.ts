import type { FrameSample } from './types';

/**
 * Deterministic pseudo-random generator so the demo telemetry looks organic
 * but stays smooth and reproducible.
 */
function wave(t: number, speed: number, offset = 0): number {
  return Math.sin(t * speed + offset) * 0.5 + Math.sin(t * speed * 1.7 + offset * 2.3) * 0.5;
}

export interface DemoFrame {
  sample: FrameSample;
  yaw: number;
  pitch: number;
  t: number;
}

/** Synthetic face frame for demo mode — smooth, natural-looking motion. */
export function demoFaceFrame(t: number): DemoFrame {
  const yaw = wave(t, 0.9) * 0.13 + wave(t, 0.31, 1.5) * 0.08;
  const pitch = wave(t, 0.7, 0.9) * 0.1;
  const blinkEnvelope = wave(t, 1.1, 4.2);
  const blink = blinkEnvelope > 0.965 ? clamp(blinkEnvelope + 0.1) : 0.02 + Math.max(0, wave(t, 0.5, 2)) * 0.05;
  const smile = 0.25 + Math.max(0, wave(t, 0.6, 3.1)) * 0.55;
  const brow = 0.2 + Math.max(0, wave(t, 0.8, 1.2)) * 0.5;
  const jaw = 0.15 + Math.max(0, wave(t, 1.4, 2.6)) * 0.65;
  return {
    t,
    yaw,
    pitch,
    sample: { yaw, pitch, blink, smile, brow, jaw },
  };
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}

export interface DemoLandmark {
  x: number;
  y: number;
}

/**
 * A stylized 478-point synthetic face mesh (head silhouette + facial feature
 * rings + connection web) laid out in normalized [0,1] space. Precomputed once.
 */
export function buildDemoLandmarks(): DemoLandmark[] {
  const pts: DemoLandmark[] = [];
  const cx = 0.5;
  const cy = 0.52;

  const ring = (rx: number, ry: number, cyOff: number, n: number, squash = 1) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push({ x: cx + Math.cos(a) * rx, y: cy + cyOff + Math.sin(a) * ry * squash });
    }
  };

  // Head silhouette + cheek structure
  ring(0.30, 0.42, 0.0, 68, 1.08);
  ring(0.24, 0.34, 0.02, 44);
  // Brow line
  ring(0.16, 0.05, -0.14, 20);
  // Eyes
  ring(0.055, 0.028, -0.12, 14);
  ring(0.055, 0.028, -0.12, 14);
  // Nose
  for (let i = 0; i < 10; i++) {
    pts.push({ x: cx + Math.sin(i) * 0.02, y: cy - 0.06 + i * 0.016 });
  }
  ring(0.035, 0.016, 0.03, 10);
  // Mouth
  ring(0.09, 0.035, 0.14, 22);
  ring(0.06, 0.018, 0.14, 16);
  // Jaw + chin mesh web
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a) * 0.2, y: cy + 0.22 + Math.sin(a) * 0.16 });
  }
  // Forehead fill
  for (let i = 0; i < 22; i++) {
    pts.push({ x: cx + wave(i, 1) * 0.16, y: cy - 0.28 - (i % 6) * 0.028 });
  }
  return pts.slice(0, 478);
}
