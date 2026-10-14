// Background freshness without requiring a WebSocket per visitor. Realtime is
// opt-in after the hosting quota is sized; polling remains a fallback.
export const realtimeEnabled = (import.meta as any).env?.VITE_ENABLE_REALTIME === 'true';
export function watchQuery<T>(load: () => Promise<T>, receive: (data: T) => void,
  connectRealtime?: (refresh: () => void) => () => void, initial = true) {
  let active = true, busy = false, lastAttempt = 0;
  const refresh = async () => {
    if (!active || busy || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    busy = true; lastAttempt = Date.now();
    try { const result = await load(); if (active) receive(result); }
    catch { /* The next visible refresh retries; no fabricated success/data. */ }
    finally { busy = false; }
  };
  const visibleRefresh = () => { if (document.visibilityState !== 'hidden' && Date.now() - lastAttempt >= 15000) void refresh(); };
  const timer = setInterval(visibleRefresh, 60000 + Math.random() * 15000);
  document.addEventListener('visibilitychange', visibleRefresh); window.addEventListener('online', visibleRefresh);
  const disconnect = realtimeEnabled ? connectRealtime?.(() => { void refresh(); }) : undefined;
  if (initial) void refresh();
  return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visibleRefresh); window.removeEventListener('online', visibleRefresh); disconnect?.(); };
}
