import { Download, MessageSquareText, Sparkles } from 'lucide-react';
import type { FeedbackCard, SessionReport, TelemetryPoint } from '@/lib/types';
import { gradeLabel } from '@/lib/analysis';

interface ReportViewProps {
  report: SessionReport;
  feedback: FeedbackCard[];
  onDownload: (format: 'txt' | 'json') => void;
  onClose: () => void;
}

function ScoreDial({ score }: { score: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = c * (score / 100);
  const accent = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: `drop-shadow(0 0 8px ${accent}66)`, transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold text-white tabular-nums">{score}</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {gradeLabel(score)}
        </span>
      </div>
    </div>
  );
}

function SubBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-mono font-semibold text-white tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 10px ${color}55` }}
        />
      </div>
    </div>
  );
}

function Timeline({ telemetry }: { telemetry: TelemetryPoint[] }) {
  const W = 720;
  const H = 200;
  const pts = telemetry.length ? telemetry : [{ t: 0, eye: 0, eng: 0, comp: 0, wpm: 0 }];
  const maxT = Math.max(1, pts[pts.length - 1].t);
  const toX = (t: number) => (t / maxT) * W;
  const toY = (v: number) => H - (Math.max(0, Math.min(100, v)) / 100) * H;
  const path = (key: 'eye' | 'eng' | 'comp') =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p[key]).toFixed(1)}`).join(' ');

  const wpmPts = pts.filter((p) => p.wpm > 0);
  const wpmPath = wpmPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${(H - (Math.min(200, p.wpm) / 200) * H).toFixed(1)}`)
    .join(' ');

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-ink-950/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-4 px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Eye Contact</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" />Confidence</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-300" />Composure</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-300" />WPM (÷2 scale)</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 200 }}>
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" x2={W} y1={(y / 100) * H} y2={(y / 100) * H} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />
        ))}
        <path d={path('eye')} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={path('eng')} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={path('comp')} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" />
        {wpmPath && <path d={wpmPath} fill="none" stroke="#fcd34d" strokeWidth="2" strokeDasharray="5 4" />}
      </svg>
      <div className="mt-1 flex justify-between px-1 font-mono text-[10px] text-slate-500">
        <span>0:00</span>
        <span>{Math.floor(maxT / 60)}:{String(Math.round(maxT % 60)).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

const TONE_STYLES = {
  good: { border: 'border-emerald-400/25', bg: 'bg-emerald-400/5', text: 'text-emerald-300', badge: 'Strength' },
  warn: { border: 'border-amber-400/25', bg: 'bg-amber-400/5', text: 'text-amber-300', badge: 'Watch' },
  bad: { border: 'border-red-400/25', bg: 'bg-red-400/5', text: 'text-red-300', badge: 'Fix' },
} as const;

function FeedbackRow({ card }: { card: FeedbackCard }) {
  const s = TONE_STYLES[card.tone];
  return (
    <div className={`animate-fade-up rounded-xl border ${s.border} ${s.bg} p-4`}>
      <span className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${s.text}`}>{s.badge}</span>
      <h4 className="mt-1 font-display text-sm font-semibold text-white">{card.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{card.body}</p>
    </div>
  );
}

export function ReportView({ report, feedback, onDownload, onClose }: ReportViewProps) {
  const time = new Date(report.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <div className="space-y-5">
      <div className="glass animate-fade-up flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center">
        <ScoreDial score={report.overall} />
        <div className="flex-1 space-y-3" style={{ minWidth: 220 }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2.5 py-0.5 font-mono text-[11px] text-indigo-300">
              {report.mode === 'demo' ? 'DEMO SIMULATION' : report.mode === 'script' ? 'SCRIPT PRACTICE' : 'LIVE SESSION'}
            </span>
            <span className="text-xs text-slate-500">{time}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white">{report.promptTitle}</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <SubBar label="Eye Contact" value={report.eye} color="#34d399" />
            <SubBar label="Composure" value={report.composure} color="#22d3ee" />
            <SubBar label="Pacing" value={report.pacing} color="#fbbf24" />
            <SubBar label="Clarity" value={report.clarity} color="#818cf8" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-slate-400">
            <span className="rounded-md bg-white/5 px-2 py-1">{report.wpm || '—'} WPM</span>
            <span className="rounded-md bg-white/5 px-2 py-1">{report.words} words</span>
            <span className="rounded-md bg-white/5 px-2 py-1">{report.fillers} fillers</span>
            <span className="rounded-md bg-white/5 px-2 py-1">{Math.round(report.durationSec)}s</span>
            <span className="rounded-md bg-white/5 px-2 py-1">{report.blinks} blinks</span>
          </div>
        </div>
      </div>

      <div className="glass animate-fade-up p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Delivery Timeline
        </h3>
        <Timeline telemetry={report.telemetry} />
      </div>

      <div className="grid gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
          <MessageSquareText className="h-4 w-4 text-emerald-300" />
          Personalized Coaching
        </h3>
        {feedback.length ? (
          feedback.map((c, i) => <FeedbackRow key={i} card={c} />)
        ) : (
          <p className="text-sm text-slate-500">Not enough data for coaching — try a longer run.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onDownload('txt')} className="btn-primary">
          <Download className="h-4 w-4" />
          Download Report (.txt)
        </button>
        <button onClick={() => onDownload('json')} className="btn-ghost">
          <Download className="h-4 w-4" />
          Raw Data (.json)
        </button>
        <button onClick={onClose} className="btn-ghost">Close</button>
      </div>
    </div>
  );
}
