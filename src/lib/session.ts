import { savedSchema, type Analysis, type Progress } from "./schema";
const prefix = "insightlens-session-v1:";
export function storeSession(analysis: Analysis, progress: Progress) {
  try {
    sessionStorage.setItem(
      prefix + analysis.id,
      JSON.stringify({ analysis, progress }),
    );
    return true;
  } catch {
    return false;
  }
}
export function loadSession(id: string) {
  try {
    const raw = sessionStorage.getItem(prefix + id);
    if (!raw) return null;
    const parsed = savedSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function discardSession(id: string) {
  try {
    sessionStorage.removeItem(prefix + id);
  } catch {}
}
export function clearSessions() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch {
    /* Storage may be disabled. */
  }
}
