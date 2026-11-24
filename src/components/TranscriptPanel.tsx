import { Mic, MicOff } from 'lucide-react';
import { highlightTokens } from '@/hooks/useSpeechRecognition';

interface TranscriptPanelProps {
  finalText: string;
  interimText: string;
  listening: boolean;
  supported: boolean;
}

export function TranscriptPanel({ finalText, interimText, listening, supported }: TranscriptPanelProps) {
  const finalTokens = highlightTokens(finalText);
  const interimTokens = highlightTokens(interimText);

  return (
    <div className="glass flex h-full min-h-[220px] flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Mic className="h-4 w-4 text-indigo-300" />
          Live Transcript
        </h3>
        {listening ? (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            LISTENING
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-slate-400">
            <MicOff className="h-3 w-3" />
            IDLE
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-ink-950/60 p-3 text-sm leading-relaxed">
        {!supported && (
          <p className="text-slate-500">
            This browser doesn't support live transcription. Use Chrome or Edge, or switch to Demo Mode — pacing and
            clarity will be simulated there.
          </p>
        )}
        {supported && !finalTokens.length && !interimTokens.length && (
          <p className="text-slate-500">Speech will appear here word-by-word as you speak. Filler words get flagged in red automatically.</p>
        )}
        <p className="text-slate-200">
          {finalTokens.map((t, i) =>
            t.filler ? (
              <span key={i} className="mr-1 inline-flex items-center rounded border border-red-400/40 bg-red-500/15 px-1.5 py-0.5 font-medium text-red-300">
                {t.text}
              </span>
            ) : (
              <span key={i} className="mr-1">{t.text}</span>
            ),
          )}
          <span className="text-slate-400">{interimTokens.map((t, i) => (t.filler ? ` [${t.text}] ` : ` ${t.text} `)).join('')}</span>
          {listening && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse-soft bg-emerald-400 align-middle" />}
        </p>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        Flagged words: <span className="text-red-300">um</span> · <span className="text-red-300">uh</span> ·{' '}
        <span className="text-red-300">like</span> · <span className="text-red-300">actually</span> ·{' '}
        <span className="text-red-300">basically</span> · <span className="text-red-300">you know</span>
      </p>
    </div>
  );
}
