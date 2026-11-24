import { useEffect, useRef, useState } from 'react';
import { useVisionEngine, type FaceFrame } from '@/hooks/useVisionEngine';
import { defaultTransform, drawOverlay } from '@/lib/overlay';
import type { LiveSnapshot } from '@/lib/types';

interface CameraStageProps {
  active: boolean;
  onFrame: (f: FaceFrame) => void;
  snapshot: LiveSnapshot;
  engineError: string;
  engineStatus: string;
}

export function CameraStage({ active, onFrame, snapshot, engineError, engineStatus }: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camError, setCamError] = useState('');
  const [camReady, setCamReady] = useState(false);
  const frameCbRef = useRef(onFrame);
  frameCbRef.current = onFrame;

  const engine = useVisionEngine(videoRef, active);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => undefined);
          setCamReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setCamError(
            err instanceof Error && err.name === 'NotAllowedError'
              ? 'Camera access denied. Grant permission in your browser settings, or use Demo Mode below.'
              : 'No camera available on this device. Demo Mode delivers the full experience without one.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      const v = videoRef.current;
      if (v) v.srcObject = null;
      setCamReady(false);
      setCamError('');
    };
  }, [active]);

  useEffect(() => {
    if (engine.status !== 'ready' || !camReady || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    engine.startLoop((frame) => {
      const hasVideo = !!videoRef.current && videoRef.current.readyState >= 2;
      drawOverlay(canvas, frame.points, defaultTransform(), { mirrored: true });
      if (hasVideo && frameCbRef.current) frameCbRef.current(frame);
    });
    return () => {
      window.removeEventListener('resize', fit);
      engine.stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.status, camReady, active]);

  const error = camError || engine.error;
  const loading = engine.status === 'loading' || (!camReady && !camError && active);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-glass" style={{ aspectRatio: '4/3' }}>
      <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle scan-line sheen */}
      {active && !error && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <div className="h-1/3 w-full animate-scan-line bg-gradient-to-b from-transparent via-emerald-300/10 to-transparent" />
        </div>
      )}

      {/* Overlay chip: FPS-style status */}
      {active && !error && engine.status === 'ready' && camReady && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-ink-950/70 px-3 py-1.5 font-mono text-[11px] text-emerald-300 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          MESH LOCK · {snapshot.eye}% EYE
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
          <p className="font-mono text-xs text-slate-400">
            {engineStatus === 'loading' || engine.status === 'loading'
              ? 'Loading on-device face engine…'
              : 'Warming up camera…'}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink-950/90 p-6 text-center backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <svg className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376C8.24 19.542 10.03 20 12 20s3.76-.458 5.148-1.326m-8.69-12.912A48.6 48.6 0 0 1 12 5.25c2.385 0 4.647.183 6.788.53M2.666 15.9c0-4.543 3.204-9.058 8.587-10.34a.98.98 0 0 1 1.494 0c5.383 1.282 8.587 5.797 8.587 10.34a.98.98 0 0 1-.755.949A48.445 48.445 0 0 1 12 17.25a48.445 48.445 0 0 1-8.587-.401.98.98 0 0 1-.755-.949Z" />
            </svg>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-300">{error}</p>
          <p className="font-mono text-[11px] text-emerald-300/80">TIP → Run Instant Demo Simulation needs zero hardware</p>
        </div>
      )}
    </div>
  );
}
