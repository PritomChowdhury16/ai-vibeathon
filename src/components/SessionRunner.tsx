import { useEffect, useMemo, useRef, useState } from 'react';
import { Flag, Square } from 'lucide-react';
import { CameraStage } from './CameraStage';
import { MetricCards } from './MetricCards';
import { TranscriptPanel } from './TranscriptPanel';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { buildDemoLandmarks, demoFaceFrame } from '@/lib/demo';
import { drawDemoOverlay } from '@/lib/overlay';
import { SessionRecorder } from '@/lib/recorder';
import { PROMPTS } from '@/lib/constants';
import { scanFillers, tokenize } from '@/lib/analysis';
import { engagementScore, eyeContactSample, ComposureTracker as CT, type ComposureTracker } from '@/lib/vision';
import type { FaceFrame } from '@/hooks/useVisionEngine';
import type { LiveSnapshot, SessionMode, SessionReport } from '@/lib/types';

interface SessionRunnerProps {
  mode: SessionMode;
  promptId: string;
  onFinish: (report: SessionReport) => void;
  onAbort: () => void;
}

const ZERO_SNAPSHOT: LiveSnapshot = { eye: 0, eng: 0, comp: 0, wpm: 0, words: 0, fillers: 0, blinks: 0 };

export function SessionRunner({ mode, promptId, onFinish, onAbort }: SessionRunnerProps) {
  const prompt = PROMPTS.find((p) => p.id === promptId) ?? PROMPTS[0];
  const [phase, setPhase] = useState<'countdown' | 'running'>('countdown');
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [snapshot, setSnapshot] = useState<LiveSnapshot>(ZERO_SNAPSHOT);
  const [scriptText, setScriptText] = useState('');
  const [engineStatus, setEngineStatus] = useState('');

  const speech = useSpeechRecognition();
  const recorderRef = useRef(new SessionRecorder());
  const composureRef = useRef<ComposureTracker>(new CT());
  const liveRef = useRef({ eye: 0, eng: 0, comp: 0 });
  const wordsRef = useRef(0);
  const prevBlinkRef = useRef(0);
  const [demoTranscript, setDemoTranscript] = useState('');
  const demoTranscriptRef = useRef('');
  const demoLineRef = useRef(0);
  const finishedRef = useRef(false);
  const demoCanvasRef = useRef<HTMLCanvasElement>(null);
  const finishRef = useRef<() => void>(() => {});
  const demoLandmarks = useMemo(() => buildDemoLandmarks(), []);

  const isDemo = mode === 'demo';
  const isScript = mode === 'script';
  const liveTranscript = isDemo ? demoTranscript : isScript ? scriptText : speech.finalText;
  const interim = isDemo || isScript ? '' : speech.interimText;

  useEffect(() => {
    const phrase = `${prompt.title} — ${prompt.desc}`;
    setEngineStatus(phrase);
  }, [prompt]);

  // Countdown, then start the session
  useEffect(() => {
    if (count <= 0) {
      if (!isDemo && !isScript) speech.start();
      setPhase('running');
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    let transcript = '';
    if (isDemo) {
      transcript = demoTranscriptRef.current;
    } else if (isScript) {
      transcript = scriptText;
    } else {
      transcript = speech.stop();
    }
    const report = recorderRef.current.finish({
      mode,
      promptTitle: prompt.title,
      durationSec: Math.max(prompt.seconds, elapsed),
      transcript,
    });
    onFinish(report);
  };
  finishRef.current = finish;

  // Master per-second tick: telemetry + auto-finish
  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        const wpm = recorderRef.current.push(next, liveRef.current.eye, liveRef.current.eng, liveRef.current.comp, wordsRef.current);
        setSnapshot((s) => ({
          ...s,
          eye: liveRef.current.eye,
          eng: liveRef.current.eng,
          comp: liveRef.current.comp,
          wpm,
          words: wordsRef.current,
          fillers: 0,
          blinks: recorderRef.current.blinks,
        }));
        if (next >= prompt.seconds) {
          // let state settle before unmounting the tree
          setTimeout(() => finishRef.current(), 0);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Live face-frame ingestion
  const onCameraFrame = (frame: FaceFrame) => {
    liveRef.current = { eye: frame.eye, eng: frame.eng, comp: frame.comp };
    const blink = frame.blend.get('eyeBlinkLeft') ?? frame.blend.get('eyeBlinkRight') ?? 0;
    if (blink > 0.6 && prevBlinkRef.current <= 0.6) recorderRef.current.blinks++;
    prevBlinkRef.current = blink;
  };

  // Demo simulation loop (rAF canvas + synthetic telemetry)
  useEffect(() => {
    if (!isDemo || phase !== 'running') return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      const { sample } = demoFaceFrame(t);

      const blend = new Map<string, number>([
        ['eyeBlinkLeft', sample.blink],
        ['eyeBlinkRight', sample.blink],
        ['mouthSmileLeft', sample.smile],
        ['mouthSmileRight', sample.smile],
        ['browInnerUp', sample.brow],
        ['jawOpen', sample.jaw],
      ]);
      const eye = eyeContactSample(blend, sample.yaw, sample.pitch);
      const eng = engagementScore(blend);
      const comp = composureRef.current.push(sample.yaw, sample.pitch);
      liveRef.current = { eye: eye.score, eng, comp };

      if (sample.blink > 0.6 && prevBlinkRef.current <= 0.6) recorderRef.current.blinks++;
      prevBlinkRef.current = sample.blink;

      const lineIdx = Math.min(Math.floor(t / 3.4), DEMO_LINES.length - 1);
      if (lineIdx > demoLineRef.current) {
        demoLineRef.current = lineIdx;
        demoTranscriptRef.current += (demoTranscriptRef.current ? ' ' : '') + DEMO_LINES[lineIdx];
        setDemoTranscript(demoTranscriptRef.current);
      }

      const canvas = demoCanvasRef.current;
      if (canvas) {
        if (canvas.width !== canvas.clientWidth) canvas.width = canvas.clientWidth;
        if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;
        drawDemoOverlay(canvas, demoLandmarks, t);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, phase]);

  // Keep word + filler counts fresh for the live cards
  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      const tokens = tokenize(liveTranscript);
      wordsRef.current = tokens.length;
      setSnapshot((s) => ({ ...s, words: tokens.length, fillers: scanFillers(tokens).count }));
    }, 500);
    return () => clearInterval(id);
  }, [phase, liveTranscript]);

  const remaining = Math.max(0, prompt.seconds - elapsed);
  const progress = Math.min(100, (elapsed / prompt.seconds) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top bar: prompt, timer, end */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-300">
            {isDemo ? 'Demo Simulation' : isScript ? 'Script Practice' : 'Live Session'}
          </p>
          <h2 className="truncate font-display text-lg font-bold text-white">{prompt.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-2xl font-bold tabular-nums text-white">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </p>
            <p className="text-[11px] text-slate-500">remaining</p>
          </div>
          <button onClick={finish} className="btn-emerald px-4 py-2.5 text-xs" disabled={finishedRef.current}>
            <Flag className="h-4 w-4" />
            {isScript ? 'Finish & Grade' : 'End & Grade'}
          </button>
          <button onClick={onAbort} className="btn-ghost px-3 py-2.5 text-xs">
            <Square className="h-3.5 w-3.5" />
            Abort
          </button>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      {phase === 'countdown' && (
        <div className="glass flex flex-col items-center justify-center gap-3 py-14">
          <p className="font-display text-7xl font-bold text-emerald-300" key={count}>{count > 0 ? count : 'GO'}</p>
          <p className="text-sm text-slate-400">{prompt.desc}</p>
          <p className="font-mono text-xs text-slate-500">
            {isScript ? 'Reading your script aloud counts — mic optional here.' : 'Speak your pitch out loud after the countdown.'}
          </p>
        </div>
      )}

      {phase === 'running' && (
        <div className={`grid gap-5 ${isDemo ? '' : 'lg:grid-cols-[1.1fr_1fr]'}`}>
          {isDemo ? (
            <div className="space-y-4">
              <div className="relative w-full overflow-hidden rounded-2xl border border-emerald-400/20 bg-ink-950 shadow-glass" style={{ aspectRatio: '4/3' }}>
                <canvas ref={demoCanvasRef} className="absolute inset-0 h-full w-full" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
                  <div className="h-1/3 w-full animate-scan-line bg-gradient-to-b from-transparent via-emerald-300/10 to-transparent" />
                </div>
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-ink-950/70 px-3 py-1.5 font-mono text-[11px] text-emerald-300 backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                  SIMULATED MESH · 478 PTS
                </div>
              </div>
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-400/5 p-3 text-center text-xs text-indigo-200">
                Demo Mode — a synthetic presenter is driving every metric so you can verify the full pipeline without a webcam.
              </div>
            </div>
          ) : (
            <CameraStage
              active
              onFrame={onCameraFrame}
              snapshot={snapshot}
              engineError=""
              engineStatus={engineStatus}
            />
          )}

          <div className="space-y-4">
            <MetricCards snapshot={snapshot} />
            {!isScript && (
              <TranscriptPanel
                finalText={liveTranscript}
                interimText={interim}
                listening={isDemo || speech.listening}
                supported={isDemo || speech.supported}
              />
            )}
            {isScript && (
              <div className="glass flex h-full min-h-[220px] flex-col p-4">
                <h3 className="mb-3 font-display text-sm font-semibold text-white">Your Script</h3>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste or type the script you're practicing. Read it aloud — your delivery is graded, not your writing."
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-ink-950/60 p-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-slate-500">{scriptText.trim() ? `${scriptText.trim().split(/\s+/).length} words` : 'Empty — grading will be visual-only.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const DEMO_LINES = [
  'So, um, our team built PitchPulse after bombing, like, five interviews in a row.',
  'Basically it runs a full face mesh right in your browser with nothing uploaded anywhere.',
  'We track eye contact, pacing, and filler words in real time.',
  'And honestly, the whole thing costs zero dollars to run.',
  'You know, most coaching tools charge thirty dollars a month.',
  'Actually, judges can hit demo mode and verify everything in seconds.',
  'So we think this is the most accessible interview coach ever shipped.',
  'Thank you — we would love your feedback on the scorecard.',
];
