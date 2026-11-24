import { useState } from 'react';
import { ExternalLink, KeyRound, X } from 'lucide-react';
import { getGeminiKey, setGeminiKey } from '@/lib/storage';

interface GeminiModalProps {
  open: boolean;
  onClose: () => void;
}

export function GeminiModal({ open, onClose }: GeminiModalProps) {
  const [key, setKey] = useState(getGeminiKey());
  const [status, setStatus] = useState<'idle' | 'saved' | 'testing' | 'error'>('idle');

  if (!open) return null;

  const save = () => {
    setGeminiKey(key.trim());
    setStatus('saved');
    setTimeout(onClose, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-lg animate-fade-up p-6">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-400/10">
            <KeyRound className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Supercharge with Gemini (optional)</h2>
            <p className="text-xs text-slate-500">Never required — everything else works fully offline.</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Paste a <strong className="text-white">free</strong> Google AI Studio key to unlock deeper, AI-written content
          critique of your transcript — argument strength, structure, and persuasiveness. The on-device vision, pacing,
          and filler analytics never depend on it, and your key is stored only in this browser.
        </p>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200"
        >
          Get a free key at Google AI Studio
          <ExternalLink className="h-3 w-3" />
        </a>

        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setStatus('idle');
          }}
          placeholder="AIza…"
          className="mt-4 w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-indigo-400/50 focus:outline-none"
        />

        <div className="mt-4 flex items-center justify-between">
          {key.trim() && (
            <button
              onClick={() => {
                setGeminiKey('');
                setKey('');
                setStatus('idle');
              }}
              className="text-xs text-slate-500 hover:text-red-300"
            >
              Remove saved key
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {status === 'saved' && <span className="text-xs text-emerald-300">Key saved locally</span>}
            <button onClick={save} disabled={!key.trim()} className="btn-primary px-4 py-2 text-xs">
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
