import { clarityScore, pacingScore, scanFillers, tokenize } from './analysis';
import type { SessionMode, SessionReport, TelemetryPoint } from './types';

/**
 * Accumulates per-second telemetry for a session and produces the final
 * SessionReport. Shared by live, demo, and script modes.
 */
export class SessionRecorder {
  telemetry: TelemetryPoint[] = [];
  blinks = 0;
  private wordMarks: Array<{ t: number; words: number }> = [];
  private lastWpm = 0;

  push(t: number, eye: number, eng: number, comp: number, words: number): number {
    this.wordMarks.push({ t, words });
    while (this.wordMarks.length > 1 && t - this.wordMarks[0].t > 10) this.wordMarks.shift();
    const first = this.wordMarks[0];
    const dt = t - first.t;
    const wpm = dt >= 2 ? Math.round((words - first.words) / (dt / 60)) : this.lastWpm;
    this.lastWpm = wpm;
    this.telemetry.push({ t, eye, eng, comp, wpm });
    return wpm;
  }

  finish(opts: {
    mode: SessionMode;
    promptTitle: string;
    durationSec: number;
    transcript: string;
  }): SessionReport {
    const { mode, promptTitle, durationSec, transcript } = opts;
    const tokens = tokenize(transcript);
    const fillerScan = scanFillers(tokens);
    const n = this.telemetry.length || 1;
    const avg = (key: 'eye' | 'eng' | 'comp') =>
      Math.round(this.telemetry.reduce((s, p) => s + p[key], 0) / n);

    const eye = avg('eye');
    const eng = avg('eng');
    const comp = avg('comp');
    const wpmSamples = this.telemetry.filter((p) => p.wpm > 0).map((p) => p.wpm);
    const wpm = wpmSamples.length
      ? Math.round(wpmSamples.reduce((s, v) => s + v, 0) / wpmSamples.length)
      : 0;
    const hasSpeech = tokens.length > 8;
    const pacing = hasSpeech ? pacingScore(wpm || 140) : 0;
    const clarity = hasSpeech ? clarityScore(fillerScan.count, tokens.length) : 0;

    const overall = hasSpeech
      ? Math.round(eye * 0.3 + comp * 0.2 + pacing * 0.25 + clarity * 0.25)
      : Math.round(eye * 0.6 + comp * 0.4);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      mode,
      promptTitle,
      durationSec,
      overall: Math.max(0, Math.min(100, overall)),
      eye,
      composure: comp,
      pacing,
      clarity,
      wpm,
      words: tokens.length,
      fillers: fillerScan.count,
      blinks: this.blinks,
      hasSpeech,
      transcript: transcript.trim(),
      fillerBreakdown: fillerScan.breakdown,
      telemetry: this.telemetry,
    };
  }
}

export function reportToText(report: SessionReport): string {
  const lines = [
    'PITCHPULSE AI — COACHING REPORT',
    '===============================',
    `Prompt: ${report.promptTitle}`,
    `Mode: ${report.mode.toUpperCase()}`,
    `Date: ${new Date(report.date).toLocaleString()}`,
    `Duration: ${Math.round(report.durationSec)}s`,
    '',
    `OVERALL READINESS: ${report.overall}/100`,
    `Eye Contact: ${report.eye}%`,
    `Composure: ${report.composure}%`,
    `Pacing: ${report.pacing}/100 (${report.wpm || '—'} WPM, target 120–150)`,
    `Clarity: ${report.clarity}/100 (${report.fillers} filler words in ${report.words})`,
    `Blinks tracked: ${report.blinks}`,
  ];
  if (Object.keys(report.fillerBreakdown).length) {
    lines.push('', 'Filler breakdown:');
    for (const [word, count] of Object.entries(report.fillerBreakdown)) {
      lines.push(`  "${word}" x${count}`);
    }
  }
  if (report.transcript) {
    lines.push('', 'Transcript:', report.transcript);
  }
  return lines.join('\n');
}
