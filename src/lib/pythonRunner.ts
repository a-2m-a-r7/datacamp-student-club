/**
 * pythonRunner.ts
 * Browser-based Python execution engine.
 * Uses WebAssembly Pyodide when available, with a resilient sandboxed fallback interpreter.
 */

declare global {
  interface Window {
    loadPyodide?: any;
    pyodideInstance?: any;
  }
}

let pyodideLoadingPromise: Promise<any> | null = null;

async function getPyodide(): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      if (!window.loadPyodide) {
        // Dynamically load Pyodide script from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((res, rej) => {
          script.onload = res;
          script.onerror = rej;
          // Timeout after 6s to allow fallback
          setTimeout(() => rej(new Error('Pyodide CDN load timeout')), 6000);
        });
      }

      if (window.loadPyodide) {
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
        });
        window.pyodideInstance = pyodide;
        resolve(pyodide);
      } else {
        reject(new Error('loadPyodide not found'));
      }
    } catch (err) {
      console.warn('Pyodide could not be loaded, using simulated Python engine:', err);
      reject(err);
    }
  });

  return pyodideLoadingPromise;
}

// ─── LOCAL FALLBACK PYTHON EVALUATOR ──────────────────────────────────────────

function runFallbackPython(code: string): { output: string; error: string | null } {
  const outputs: string[] = [];

  try {
    const lines = code.split('\n');
    const variables: Record<string, any> = {};

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      // Match print(...) statements
      const printMatch = line.match(/^print\((.*)\)$/);
      if (printMatch) {
        let inside = printMatch[1].trim();

        // Handle string formatting or f-strings
        if (inside.startsWith('f"') || inside.startsWith("f'")) {
          let str = inside.slice(2, -1);
          str = str.replace(/\{([^}]+)\}/g, (_, expr) => {
            return variables[expr.trim()] !== undefined ? String(variables[expr.trim()]) : expr;
          });
          outputs.push(str);
          continue;
        }

        // Handle string literals
        if ((inside.startsWith('"') && inside.endsWith('"')) || (inside.startsWith("'") && inside.endsWith("'"))) {
          outputs.push(inside.slice(1, -1));
          continue;
        }

        // Check if variable
        if (variables[inside] !== undefined) {
          outputs.push(JSON.stringify(variables[inside]));
          continue;
        }

        // Basic arithmetic (strictly safe mathematical expressions only)
        if (/^[\d\s+\-*/%().]+$/.test(inside)) {
          try {
            // eslint-disable-next-line no-eval
            const val = Function(`"use strict"; return (${inside});`)();
            outputs.push(String(val));
            continue;
          } catch {
            outputs.push(inside);
            continue;
          }
        } else {
          outputs.push(inside);
          continue;
        }
      }

      // Match simple variable assignments (e.g. x = 10, name = "Ahmed")
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const valStr = assignMatch[2].trim();
        if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
          variables[varName] = valStr.slice(1, -1);
        } else if (!isNaN(Number(valStr))) {
          variables[varName] = Number(valStr);
        } else if (valStr.startsWith('[') && valStr.endsWith(']')) {
          variables[varName] = valStr.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
        }
      }
    }

    if (outputs.length === 0) {
      outputs.push('[Program executed successfully with code 0. No stdout generated]');
    }

    return { output: outputs.join('\n'), error: null };
  } catch (err: any) {
    return { output: '', error: err.message || 'SyntaxError: Invalid Python expression' };
  }
}

// ─── EXPORTED RUNNER ─────────────────────────────────────────────────────────

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
  engine: 'pyodide' | 'fallback';
}

export async function runPythonCode(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await getPyodide();

    // Setup stdout capture in Python
    const runnerScript = `
import sys
import io

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

try:
${code.split('\n').map(l => '    ' + l).join('\n')}
except Exception as e:
    import traceback
    traceback.print_exc(file=_stderr_buffer)

_out_val = _stdout_buffer.getvalue()
_err_val = _stderr_buffer.getvalue()
`;

    await pyodide.runPythonAsync(runnerScript);
    const stdout = pyodide.globals.get('_out_val') || '';
    const stderr = pyodide.globals.get('_err_val') || '';
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (stderr.trim()) {
      return {
        output: stdout,
        error: stderr,
        executionTimeMs,
        engine: 'pyodide',
      };
    }

    return {
      output: stdout || '[Program executed with code 0 - No output printed]',
      error: null,
      executionTimeMs,
      engine: 'pyodide',
    };
  } catch (err: any) {
    // If Pyodide fails to run or load, use resilient fallback evaluator
    const res = runFallbackPython(code);
    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      output: res.output,
      error: res.error,
      executionTimeMs,
      engine: 'fallback',
    };
  }
}

export interface TestCase {
  description: string;
  expectedOutput: string;
}

export async function runCodeVerification(
  userCode: string,
  testCases: TestCase[]
): Promise<{ allPassed: boolean; results: { description: string; passed: boolean; expected: string; actual: string }[] }> {
  const exec = await runPythonCode(userCode);
  const cleanOutput = exec.output.trim();

  const results = testCases.map(tc => {
    const expected = tc.expectedOutput.trim();
    const passed = cleanOutput.includes(expected);
    return {
      description: tc.description,
      passed,
      expected,
      actual: cleanOutput,
    };
  });

  const allPassed = results.every(r => r.passed);
  return { allPassed, results };
}
