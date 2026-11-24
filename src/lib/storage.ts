import type { SessionReport } from './types';

const HISTORY_KEY = 'pitchpulse.history.v1';
const GEMINI_KEY = 'pitchpulse.gemini.key';

export function loadHistory(): SessionReport[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReport(report: SessionReport): SessionReport[] {
  const history = [report, ...loadHistory()].slice(0, 20);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // storage full or blocked — history is best-effort
  }
  return history;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setGeminiKey(key: string): void {
  try {
    if (key) localStorage.setItem(GEMINI_KEY, key);
    else localStorage.removeItem(GEMINI_KEY);
  } catch {
    // ignore
  }
}

export function downloadFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
