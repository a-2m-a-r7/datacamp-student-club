export function runIsolatedWorker(source: string, payload: unknown, timeoutMs = 30000): Promise<{ output: string; error?: string }> {
  return new Promise(resolve => {
    let worker: Worker | undefined;
    let url: string | undefined;
    let settled = false;
    const finish = (result: { output: string; error?: string }) => {
      if (settled) return;
      settled = true; clearTimeout(timer); worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(result);
    };
    const timer = setTimeout(() => finish({ output: '', error: 'Runtime loading or execution timed out.' }), timeoutMs);
    try {
      url = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
      worker = new Worker(url);
      worker.onmessage = event => finish(event.data);
      worker.onerror = () => finish({ output: '', error: 'The isolated runtime could not start.' });
      worker.postMessage(payload);
    } catch { finish({ output: '', error: 'Secure workers are unavailable in this browser.' }); }
  });
}
