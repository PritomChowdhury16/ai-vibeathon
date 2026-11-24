import { Github, ShieldCheck, Sparkles } from 'lucide-react';

export function Header({ onOpenGemini, hasGeminiKey }: { onOpenGemini: () => void; hasGeminiKey: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 shadow-glow-indigo">
            <Sparkles className="h-5 w-5 text-ink-950" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-white">
              PitchPulse <span className="text-emerald-300">AI</span>
            </h1>
            <p className="hidden text-[11px] text-slate-400 sm:block">On-Device Interview & Presentation Coach</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11px] font-medium text-emerald-300">
              Powered by Google MediaPipe On-Device AI — 100% Private, Zero Cloud Video Upload
            </span>
          </div>
          <button onClick={onOpenGemini} className="btn-ghost px-3 py-1.5 text-xs">
            {hasGeminiKey ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Gemini connected
              </span>
            ) : (
              'Supercharge with Gemini'
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-white/5 bg-emerald-400/5 py-1.5 md:hidden">
        <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-300" />
        <span className="text-[10px] leading-none text-emerald-300">
          Powered by Google MediaPipe On-Device AI — 100% Private, Zero Cloud Video Upload
        </span>
      </div>
    </header>
  );
}

export function FooterBadge() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>
            All computer vision runs on-device via Google MediaPipe. No video, audio, or transcript ever leaves this
            browser.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-600">PitchPulse AI · $0 · keyless · on-device</span>
      </div>
    </footer>
  );
}
