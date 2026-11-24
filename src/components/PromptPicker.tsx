import { ChevronDown, Timer } from 'lucide-react';
import { PROMPTS } from '@/lib/constants';

interface PromptPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PromptPicker({ selectedId, onSelect }: PromptPickerProps) {
  const selected = PROMPTS.find((p) => p.id === selectedId) ?? PROMPTS[0];
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {PROMPTS.map((p) => {
        const isSel = p.id === selected.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`glass-hover rounded-xl border p-3 text-left transition-all ${
              isSel ? 'border-indigo-400/50 bg-indigo-400/10 shadow-glow-indigo' : 'border-white/5 bg-ink-950/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-semibold ${isSel ? 'text-indigo-200' : 'text-slate-300'}`}>{p.title}</span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-slate-500">
                <Timer className="h-3 w-3" />
                {p.seconds}s
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">{p.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

export function PromptHeader({ id }: { id: string }) {
  const p = PROMPTS.find((x) => x.id === id) ?? PROMPTS[0];
  return (
    <div className="flex items-center gap-2 text-sm">
      <ChevronDown className="h-4 w-4 text-slate-500" />
      <span className="font-display font-semibold text-white">{p.title}</span>
      <span className="text-xs text-slate-500">· {p.desc}</span>
    </div>
  );
}
