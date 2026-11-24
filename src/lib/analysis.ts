import { FILLER_BIGRAMS, FILLER_WORDS, WPM_MAX, WPM_MIN } from './constants';
import type { FeedbackCard, SessionReport } from './types';

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export interface FillerScan {
  count: number;
  breakdown: Record<string, number>;
  hits: number[]; // token indices that start a filler phrase
}

export function scanFillers(tokens: string[]): FillerScan {
  const breakdown: Record<string, number> = {};
  const hits: number[] = [];
  let count = 0;
  for (let i = 0; i < tokens.length; i++) {
    const bigram = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : '';
    if (FILLER_BIGRAMS.has(bigram)) {
      breakdown[bigram] = (breakdown[bigram] ?? 0) + 1;
      count++;
      hits.push(i);
      i++;
      continue;
    }
    if (FILLER_WORDS.has(tokens[i])) {
      breakdown[tokens[i]] = (breakdown[tokens[i]] ?? 0) + 1;
      count++;
      hits.push(i);
    }
  }
  return { count, breakdown, hits };
}

export function pacingScore(wpm: number): number {
  if (!wpm) return 0;
  if (wpm >= WPM_MIN && wpm <= WPM_MAX) return 100;
  const dist = wpm < WPM_MIN ? WPM_MIN - wpm : wpm - WPM_MAX;
  return Math.max(0, Math.round(100 - dist * 2.2));
}

export function clarityScore(fillerCount: number, words: number): number {
  if (!words) return 0;
  const ratio = fillerCount / words;
  return Math.max(0, Math.min(100, Math.round(100 - ratio * 1300)));
}

export function generateFeedback(report: SessionReport): FeedbackCard[] {
  const cards: FeedbackCard[] = [];

  if (!report.hasSpeech) {
    cards.push({
      tone: 'warn',
      title: 'No speech captured',
      body: 'We graded this run on visual delivery only. Allow microphone access or try Demo Mode to score pacing and clarity too.',
    });
  } else {
    if (report.wpm > WPM_MAX + 8) {
      cards.push({
        tone: 'bad',
        title: 'Slow your pace',
        body: `Your pace hit ${report.wpm} WPM — slow down slightly during technical explanations. The sweet spot is ${WPM_MIN}–${WPM_MAX} WPM; try a full silent beat at each comma.`,
      });
    } else if (report.wpm < WPM_MIN - 8) {
      cards.push({
        tone: 'warn',
        title: 'Pick up the tempo',
        body: `At ${report.wpm} WPM you risk losing the room. Rehearse the opening line until it rolls out confidently — momentum is contagious.`,
      });
    } else {
      cards.push({
        tone: 'good',
        title: 'Excellent pacing',
        body: `${report.wpm} WPM lands right in the ${WPM_MIN}–${WPM_MAX} target zone. Listeners can absorb every word.`,
      });
    }

    if (report.fillers >= 3) {
      const worst = Object.entries(report.fillerBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0];
      cards.push({
        tone: 'bad',
        title: `Detected ${report.fillers} filler words`,
        body: `Pause silently instead of saying "${worst ?? 'um'}". A silent pause reads as confidence; a filler reads as doubt.`,
      });
    } else if (report.words > 15) {
      cards.push({
        tone: 'good',
        title: 'Crisp, filler-free delivery',
        body: 'Barely any fillers detected. Your sentences carried real weight — keep that discipline.',
      });
    }
  }

  if (report.eye >= 75) {
    cards.push({
      tone: 'good',
      title: 'Strong eye contact',
      body: `${report.eye}% eye contact. You held the lens like a hiring manager sitting across the desk.`,
    });
  } else if (report.eye > 0 && report.eye < 60) {
    cards.push({
      tone: 'bad',
      title: 'Eyes drifted off-camera',
      body: `Eye contact dipped to ${report.eye}%. Look at the lens, not your own video preview — tape an arrow next to it if you have to.`,
    });
  }

  if (report.composure > 0 && report.composure < 60) {
    cards.push({
      tone: 'warn',
      title: 'Steady the head movement',
      body: `Your head jittered more than the ideal. Ground your elbows, breathe out slowly before you start, and let gestures come from stillness.`,
    });
  } else if (report.composure >= 80) {
    cards.push({
      tone: 'good',
      title: 'Rock-steady composure',
      body: 'Minimal head jitter under pressure — that reads as executive presence on video calls.',
    });
  }

  if (report.overall >= 80) {
    cards.push({
      tone: 'good',
      title: 'Interview-ready',
      body: `An overall readiness score of ${report.overall}/100 puts you in the top tier. Run it once more and try to beat it.`,
    });
  }

  return cards.slice(0, 5);
}

export function gradeLabel(score: number): string {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Promising';
  if (score >= 40) return 'Needs reps';
  return 'Keep practicing';
}
