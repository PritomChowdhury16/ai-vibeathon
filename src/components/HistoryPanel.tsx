import { History, Trash2 } from 'lucide-react';
import type { SessionReport } from '@/lib/types';
import { gradeLabel } from '@/lib/analysis';

interface HistoryPanelProps {
  history: SessionReport[];
  onOpen: (r: SessionReport) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onOpen, onClear }: HistoryPanelProps) {
  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
          <History className="h-4 w-4 text-indigo-300" />
          Session History
          <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">{history.length}</span>
        </h3>
        {history.length > 0 && (
          <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-500">
          No sessions yet. Finish a live run, demo, or script practice and your scorecard lands here so you can track
          improvement across attempts.
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpen(r)}
              className="glass-hover flex w-full items-center gap-4 rounded-xl border border-white/5 bg-ink-950/50 p-3 text-left"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold"
                style={{
                  background: r.overall >= 70 ? 'rgba(16,185,129,0.12)' : r.overall >= 50 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                  color: r.overall >= 70 ? '#34d399' : r.overall >= 50 ? '#fbbf24' : '#f87171',
                }}
              >
                {r.overall}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{r.promptTitle}</p>
                <p className="text-xs text-slate-500">
                  {gradeLabel(r.overall)} · {r.mode === 'demo' ? 'Demo' : r.mode === 'script' ? 'Script' : 'Live'} ·{' '}
                  {new Date(r.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
              <div className="hidden gap-4 font-mono text-[11px] text-slate-400 sm:flex">
                <span>{r.wpm || '—'} WPM</span>
                <span>{r.fillers} fillers</span>
                <span className="text-emerald-300">{r.eye}% eye</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
