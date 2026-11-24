import { useCallback, useEffect, useState } from 'react';
import { Camera, ClipboardPaste, History, Play, Zap } from 'lucide-react';
import { FooterBadge, Header } from '@/components/Layout';
import { GeminiModal } from '@/components/GeminiModal';
import { HistoryPanel } from '@/components/HistoryPanel';
import { PromptPicker } from '@/components/PromptPicker';
import { ReportView } from '@/components/ReportView';
import { SessionRunner } from '@/components/SessionRunner';
import { generateFeedback } from '@/lib/analysis';
import { PROMPTS } from '@/lib/constants';
import { reportToText } from '@/lib/recorder';
import { clearHistory, downloadFile, getGeminiKey, loadHistory, saveReport } from '@/lib/storage';
import type { FeedbackCard, SessionMode, SessionReport } from '@/lib/types';

type Screen = 'home' | 'session' | 'report';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<SessionMode>('live');
  const [promptId, setPromptId] = useState(PROMPTS[0].id);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [feedback, setFeedback] = useState<FeedbackCard[]>([]);
  const [history, setHistory] = useState<SessionReport[]>([]);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setHasGeminiKey(!!getGeminiKey());
  }, []);

  const start = (m: SessionMode) => {
    setMode(m);
    setReport(null);
    setScreen('session');
  };

  const finish = useCallback((r: SessionReport) => {
    setFeedback(generateFeedback(r));
    setReport(r);
    setHistory(saveReport(r));
    setScreen('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openReport = (r: SessionReport) => {
    setFeedback(generateFeedback(r));
    setReport(r);
    setScreen('report');
    window.scrollTo({ top: 0 });
  };

  const download = (format: 'txt' | 'json') => {
    if (!report) return;
    const slug = report.promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    if (format === 'txt') {
      downloadFile(`pitchpulse-${slug}.txt`, reportToText(report));
    } else {
      downloadFile(`pitchpulse-${slug}.json`, JSON.stringify(report, null, 2), 'application/json');
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        onOpenGemini={() => setGeminiOpen(true)}
        hasGeminiKey={hasGeminiKey}
        key={hasGeminiKey ? 'k' : 'n'}
      />
      <main>
        {screen === 'home' && (
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
            {/* Hero */}
            <section className="animate-fade-up text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <Zap className="h-3.5 w-3.5" />
                Real-time coaching · zero cloud upload · $0 always
              </span>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                Nail the pitch,{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent">
                  before the interview
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
                PitchPulse watches your eyes, your composure, and your words — all on-device through your browser.
                Get a full readiness scorecard in the time it takes to deliver one pitch.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => start('live')} className="btn-primary px-6">
                  <Camera className="h-4 w-4" />
                  Start Live Coaching
                </button>
                <button onClick={() => start('demo')} className="btn-emerald px-6">
                  <Play className="h-4 w-4" />
                  Run Instant Demo Simulation
                </button>
                <button onClick={() => start('script')} className="btn-ghost px-5">
                  <ClipboardPaste className="h-4 w-4" />
                  Practice with a Script
                </button>
              </div>
            </section>

            {/* Prompt selection */}
            <section className="animate-fade-up">
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
                Choose your practice prompt
              </h3>
              <PromptPicker selectedId={promptId} onSelect={setPromptId} />
            </section>

            <HistoryPanel history={history} onOpen={openReport} onClear={() => { clearHistory(); setHistory([]); }} />
          </div>
        )}

        {screen === 'session' && (
          <SessionRunner
            key={`${mode}-${promptId}-${Date.now()}`}
            mode={mode}
            promptId={promptId}
            onFinish={finish}
            onAbort={() => setScreen('home')}
          />
        )}

        {screen === 'report' && report && (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <ReportView
              report={report}
              feedback={feedback}
              onDownload={download}
              onClose={() => setScreen('home')}
            />
          </div>
        )}
      </main>
      <FooterBadge />
      <GeminiModal open={geminiOpen} onClose={() => { setGeminiOpen(false); setHasGeminiKey(!!getGeminiKey()); }} />
    </div>
  );
}
