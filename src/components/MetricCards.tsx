import { Activity, Eye, Gauge, Smile, Waves } from 'lucide-react';
import type { LiveSnapshot } from '@/lib/types';

interface MetricCardsProps {
  snapshot: LiveSnapshot;
}

function ScoreRing({ value, accent }: { value: number; accent: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-white">
        {Math.round(value)}
      </span>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  ring,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  ring?: React.ReactNode;
}) {
  return (
    <div className="glass glass-hover animate-fade-up p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Icon className="h-4 w-4" style={{ color: accent }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        </div>
        {ring}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function MetricCards({ snapshot }: MetricCardsProps) {
  const wpmInZone = snapshot.wpm >= 120 && snapshot.wpm <= 150;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
      <Card
        icon={Eye}
        label="Eye Contact"
        value={`${Math.round(snapshot.eye)}%`}
        accent="#34d399"
        ring={<ScoreRing value={snapshot.eye} accent="#34d399" />}
        sub="Gaze stability + blink dynamics"
      />
      <Card
        icon={Smile}
        label="Engagement"
        value={`${Math.round(snapshot.eng)}%`}
        accent="#818cf8"
        ring={<ScoreRing value={snapshot.eng} accent="#818cf8" />}
        sub="Expressive facial movement"
      />
      <Card
        icon={Waves}
        label="Composure"
        value={`${Math.round(snapshot.comp)}%`}
        accent="#22d3ee"
        ring={<ScoreRing value={snapshot.comp} accent="#22d3ee" />}
        sub="Head-stability under pressure"
      />
      <Card
        icon={Gauge}
        label="Pace"
        value={snapshot.wpm ? `${snapshot.wpm}` : '—'}
        accent={wpmInZone ? '#34d399' : '#fbbf24'}
        sub={wpmInZone ? 'In target zone (120–150)' : snapshot.wpm ? 'Outside 120–150 zone' : 'Waiting for speech…'}
      />
      <Card
        icon={Activity}
        label="Words"
        value={`${snapshot.words}`}
        accent="#a5b4fc"
        sub={`${snapshot.blinks} blinks tracked`}
      />
      <Card
        icon={Activity}
        label="Fillers"
        value={`${snapshot.fillers}`}
        accent={snapshot.fillers > 4 ? '#f87171' : '#fbbf24'}
        sub="um · uh · like · basically"
      />
    </div>
  );
}
