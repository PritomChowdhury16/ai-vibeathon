export type SessionMode = 'live' | 'demo' | 'script';

export interface FrameSample {
  yaw: number; // -1..1 (negative = turned left)
  pitch: number; // -1..1 (negative = tilted up)
  blink: number; // 0..1
  smile: number; // 0..1
  brow: number; // 0..1
  jaw: number; // 0..1
}

export interface TelemetryPoint {
  t: number; // seconds since session start
  eye: number;
  eng: number;
  comp: number;
  wpm: number;
}

export interface LiveSnapshot {
  eye: number;
  eng: number;
  comp: number;
  wpm: number;
  words: number;
  fillers: number;
  blinks: number;
}

export interface FeedbackCard {
  tone: 'good' | 'warn' | 'bad';
  title: string;
  body: string;
}

export interface SessionReport {
  id: string;
  date: string;
  mode: SessionMode;
  promptTitle: string;
  durationSec: number;
  overall: number;
  eye: number;
  composure: number;
  pacing: number;
  clarity: number;
  wpm: number;
  words: number;
  fillers: number;
  blinks: number;
  hasSpeech: boolean;
  transcript: string;
  fillerBreakdown: Record<string, number>;
  telemetry: TelemetryPoint[];
}
