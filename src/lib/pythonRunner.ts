import { runIsolatedWorker } from './isolatedRunner';
export interface ExecutionResult {
 output: string; error: string | null; executionTimeMs: number; engine: 'pyodide' | 'unavailable';
}
export async function runPythonCode(code: string, stdin = ''): Promise<ExecutionResult> {
 const start = performance.now();
 const result = await runIsolatedWorker(`
  self.onmessage = async event => {
   const output = [], errors = [];
   try {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
    const lines = (event.data.stdin || '').split('\\n');
    const py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/', stdout: text => output.push(text), stderr: text => errors.push(text), stdin: () => lines.length ? lines.shift() : null });
    await py.loadPackagesFromImports(event.data.code);
    self.fetch = undefined; self.XMLHttpRequest = undefined; self.WebSocket = undefined;
    await py.runPythonAsync(event.data.code);
    self.postMessage({ output: output.join('\\n'), error: errors.join('\\n') || undefined });
   } catch (error) { self.postMessage({ output: output.join('\\n'), error: error.message || 'Python execution failed' }); }
  };
 `, { code, stdin });
 return { output: result.output, error: result.error || null, executionTimeMs: Math.round(performance.now() - start), engine: 'pyodide' };
}
export interface TestCase { description: string; expectedOutput: string; }
export async function runCodeVerification(userCode: string, testCases: TestCase[]) {
 const exec = await runPythonCode(userCode);
 const results = testCases.map(tc => ({ description: tc.description, passed: !exec.error && exec.output.trim() === tc.expectedOutput.trim(), expected: tc.expectedOutput.trim(), actual: exec.output.trim() }));
 return { allPassed: !exec.error && results.length > 0 && results.every(r => r.passed), results };
}
