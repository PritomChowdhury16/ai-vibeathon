import { useCallback, useEffect, useRef, useState } from 'react';
import { scanFillers, tokenize } from '@/lib/analysis';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): RecognitionCtor | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as RecognitionCtor | null;
}

export interface SpeechState {
  supported: boolean;
  finalText: string;
  interimText: string;
  listening: boolean;
}

/**
 * Wraps the browser's Web Speech API. Accumulates a final transcript and a
 * live interim one. `stop()` resolves with the complete transcript.
 */
export function useSpeechRecognition(lang = 'en-US') {
  const [state, setState] = useState<SpeechState>({
    supported: !!getCtor(),
    finalText: '',
    interimText: '',
    listening: false,
  });
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const wantRunningRef = useRef(false);
  const manualStopRef = useRef(false);

  const build = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: SpeechEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript ?? '';
        if (res.isFinal) {
          finalRef.current += (finalRef.current ? ' ' : '') + text.trim();
        } else {
          interim += text;
        }
      }
      setState((s) => ({ ...s, finalText: finalRef.current, interimText: interim }));
    };
    rec.onerror = (e: { error: string }) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wantRunningRef.current = false;
        setState((s) => ({ ...s, listening: false }));
      }
    };
    // Chrome kills long sessions periodically; restart while the user still wants to listen.
    rec.onend = () => {
      if (wantRunningRef.current && !manualStopRef.current) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
        return;
      }
      setState((s) => ({ ...s, listening: false }));
    };
    return rec;
  }, [lang]);

  const start = useCallback(() => {
    if (recRef.current) return;
    const rec = build();
    if (!rec) return;
    manualStopRef.current = false;
    wantRunningRef.current = true;
    recRef.current = rec;
    try {
      rec.start();
      setState((s) => ({ ...s, listening: true }));
    } catch {
      recRef.current = null;
    }
  }, [build]);

  const stop = useCallback((): string => {
    manualStopRef.current = true;
    wantRunningRef.current = false;
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
      recRef.current = null;
    }
    const text = (finalRef.current + ' ' + (state.interimText || '')).trim();
    setState((s) => ({ ...s, listening: false, interimText: '' }));
    return text;
  }, [state.interimText]);

  const reset = useCallback(() => {
    finalRef.current = '';
    setState((s) => ({ ...s, finalText: '', interimText: '' }));
  }, []);

  useEffect(
    () => () => {
      wantRunningRef.current = false;
      manualStopRef.current = true;
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    },
    [],
  );

  return { ...state, start, stop, reset };
}

export interface TranscriptToken {
  text: string;
  filler: boolean;
}

/** Tokenizes a transcript and flags filler words for badge highlighting. */
export function highlightTokens(text: string): TranscriptToken[] {
  if (!text.trim()) return [];
  const tokens = tokenize(text);
  const { hits } = scanFillers(tokens);
  const hitSet = new Set(hits);
  return tokens.map((text, i) => ({ text, filler: hitSet.has(i) }));
}
