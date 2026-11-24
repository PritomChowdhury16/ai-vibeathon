import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { ComposureTracker, engagementScore, eyeContactSample } from '@/lib/vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface FaceFrame {
  points: Array<{ x: number; y: number }>;
  blend: Map<string, number>;
  eye: number;
  eng: number;
  comp: number;
}

interface EngineState {
  status: EngineStatus;
  error: string;
}

export function useVisionEngine(video: React.RefObject<HTMLVideoElement>, active: boolean) {
  const [state, setState] = useState<EngineState>({ status: 'idle', error: '' });
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const composureRef = useRef(new ComposureTracker());
  const rafRef = useRef<number | null>(null);
  const frameCbRef = useRef<((f: FaceFrame) => void) | null>(null);
  const lastTsRef = useRef(-1);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setState({ status: 'loading', error: '' });

    (async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setState({ status: 'ready', error: '' });
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Unknown initialization failure';
        setState({ status: 'error', error: `Face engine failed to load: ${msg}` });
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      setState({ status: 'idle', error: '' });
    };
  }, [active]);

  const processOnce = (now: number): FaceFrame | null => {
    const landmarker = landmarkerRef.current;
    const videoEl = video.current;
    if (!landmarker || !videoEl || videoEl.readyState < 2) return null;
    let result: FaceLandmarkerResult;
    try {
      result = landmarker.detectForVideo(videoEl, now);
    } catch {
      return null;
    }
    const face = result.faceLandmarks?.[0];
    const blendRaw = result.faceBlendshapes?.[0];
    if (!face || face.length < 468 || !blendRaw) return null;

    const blend = new Map<string, number>();
    for (const c of blendRaw.categories) blend.set(c.categoryName, c.score);

    // Head orientation from key mesh points (normalized space)
    const nose = face[1];
    const left = face[234];
    const right = face[454];
    const forehead = face[10];
    const chin = face[152];
    const yaw = (nose.x - (left.x + right.x) / 2) / Math.max(0.05, Math.abs(right.x - left.x) / 2);
    const pitch = (nose.y - (forehead.y + chin.y) / 2) / Math.max(0.05, Math.abs(chin.y - forehead.y) / 2);

    const eye = eyeContactSample(blend, yaw, pitch);
    const eng = engagementScore(blend);
    const comp = composureRef.current.push(yaw, pitch);

    return {
      points: face.map((p) => ({ x: p.x, y: p.y })),
      blend,
      eye: eye.score,
      eng,
      comp,
    };
  };

  /** Continuous render loop while live mode is active. */
  const startLoop = (onFrame: (f: FaceFrame) => void) => {
    frameCbRef.current = onFrame;
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (now === lastTsRef.current) return;
      lastTsRef.current = now;
      const frame = processOnce(now);
      if (frame && frameCbRef.current) frameCbRef.current(frame);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    frameCbRef.current = null;
    composureRef.current = new ComposureTracker();
  };

  return { ...state, startLoop, stopLoop, processOnce };
}
