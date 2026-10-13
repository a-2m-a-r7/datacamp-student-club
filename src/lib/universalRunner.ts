import { runIsolatedWorker } from './isolatedRunner';
import { runSQL } from './sqlRunner';
/**
 * universalRunner.ts
 * Multi-Language Universal Code Execution Engine for DataCamp Student Club.
 * Designed with a pluggable architecture to support multiple languages:
 * Python, JavaScript, TypeScript, SQL, C++, Java, R, Go, Rust.
 * Easily extensible for any future languages.
 */

import { runPythonCode } from './pythonRunner';

export interface CodeTemplate {
  name: string;
  description: string;
  code: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
  engineUsed: string;
}

export interface LanguageDefinition {
  id: string;
  name: string;
  version: string;
  extension: string;
  icon: string;
  color: string;
  popular: boolean;
  category: 'data_science' | 'web' | 'systems' | 'database';
  starterCode: string;
  templates: CodeTemplate[];
  run: (code: string, stdin?: string) => Promise<ExecutionResult>;
}

// ─── PISTON API RUNNER (FOR COMPILED & SYSTEM LANGUAGES) ───────────────────────

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

async function executeViaPiston(
  language: string,
  version: string,
  files: { name?: string; content: string }[],
  stdin: string = ''
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version: version === 'latest' ? '*' : version,
        files,
        stdin,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.compile && data.compile.code !== 0) return {
      stdout: data.compile.stdout || '', stderr: data.compile.stderr || data.compile.output || 'Compilation failed.', code: data.compile.code || 1,
    };
    if (!data.run) return { stdout: '', stderr: 'Execution service returned no result.', code: 1 };
    return {
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      code: data.run?.code ?? 0,
    };
  } catch {
    return null;
  }
}

// ─── JAVASCRIPT / TYPESCRIPT RUNNER ──────────────────────────────────────────

async function executeJavaScript(code: string, stdin: string = ''): Promise<ExecutionResult> {
 const startTime = performance.now();
 const result = await runIsolatedWorker(`
  self.onmessage = async event => {
   const logs = [];
   const format = args => args.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ');
   const output = { log: (...args) => logs.push(format(args)), info: (...args) => logs.push(format(args)), warn: (...args) => logs.push(format(args)), error: (...args) => logs.push(format(args)) };
   self.fetch = undefined; self.XMLHttpRequest = undefined; self.WebSocket = undefined; self.importScripts = undefined; self.indexedDB = undefined;
   try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    await new AsyncFunction('console','stdin','"use strict";\\n' + event.data.code)(output,event.data.stdin);
    self.postMessage({ output: logs.join('\\n') });
   } catch (error) { self.postMessage({ output: logs.join('\\n'), error: error.message || 'Execution failed' }); }
  };
 `, { code, stdin }, 5000);
 return { ...result, executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Isolated JavaScript Worker' };
}

async function executeTypeScript(code: string, stdin = ''): Promise<ExecutionResult> {
 const start = performance.now();
 try {
  const response = await fetch('/api/compiler/typescript', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
  const data = await response.json();
  if (!response.ok || typeof data.code !== 'string') throw new Error(data.error || 'TypeScript compiler unavailable');
  return await executeJavaScript(data.code, stdin);
 } catch (error: any) { return { output: '', error: error.message, executionTimeMs: Math.round(performance.now() - start), engineUsed: 'TypeScript compiler' }; }
}
// ─── LANGUAGE DEFINITIONS REGISTRY ───────────────────────────────────────────

export const LANGUAGE_CATALOG: LanguageDefinition[] = [
  // 1. PYTHON
  {
    id: 'python',
    name: 'Python',
    version: '3.11',
    extension: '.py',
    icon: '🐍',
    color: '#38BDF8',
    popular: true,
    category: 'data_science',
    starterCode: `# DataCamp Club - Python 3.11 Playground
import math

def calculate_analytics():
    members = ["Ammar", "Sara", "Omar", "Laila"]
    xp_scores = [1250, 2600, 620, 3400]

    total = sum(xp_scores)
    avg = total / len(xp_scores)

    print("=" * 45)
    print("📊 DATACAMP CLUB XP ANALYTICS REPORT")
    print("=" * 45)
    for member, xp in zip(members, xp_scores):
        print(f"• {member:<10}: {xp:>4} XP {'(Top Contributor!)' if xp > 2000 else ''}")

    print("-" * 45)
    print(f"Total XP: {total} | Average: {avg:.1f}")
    print("✓ Analysis complete.")

calculate_analytics()
`,
    templates: [
      {
        name: 'XP Analytics & Statistics',
        description: 'Calculate club statistics and leaderboard insights',
        code: `scores = [1200, 2400, 850, 3100, 1950]\nprint(f"Sum: {sum(scores)}, Avg: {sum(scores)/len(scores):.2f}, Max: {max(scores)}")`,
      },
      {
        name: 'Fibonacci Sequence Generator',
        description: 'Generate dynamic sequence values with memoization',
        code: `def fib(n):\n    a, b = 0, 1\n    seq = []\n    for _ in range(n):\n        seq.append(a)\n        a, b = b, a + b\n    return seq\n\nprint("First 12 Fibonacci numbers:", fib(12))`,
      },
      {
        name: 'Machine Learning KNN Logic',
        description: 'Calculate Euclidean distance between feature points',
        code: `import math\n\ndef euclidean(p1, p2):\n    return math.sqrt(sum((a - b)**2 for a, b in zip(p1, p2)))\n\nstudent_a = [90, 85, 92]\nstudent_b = [88, 80, 95]\nprint(f"Distance: {euclidean(student_a, student_b):.3f}")`,
      },
    ],
    run: async (code, stdin) => {
      const res = await runPythonCode(code, stdin);
      return {
        output: res.output,
        error: res.error || undefined,
        executionTimeMs: res.executionTimeMs,
        engineUsed: res.engine === 'pyodide' ? 'Pyodide WebAssembly (Python 3.11)' : 'Unavailable',
      };
    },
  },

  // 2. JAVASCRIPT
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'ES2024',
    extension: '.js',
    icon: '⚡',
    color: '#FACC15',
    popular: true,
    category: 'web',
    starterCode: `// DataCamp Student Club - JavaScript Playground
console.log("⚡ Executing JavaScript ES2024 Runtime...");

const clubMembers = [
  { name: "Ammar", role: "President", xp: 3200 },
  { name: "Sara", role: "AI Mentor", xp: 2800 },
  { name: "Omar", role: "Content Editor", xp: 1950 },
  { name: "Laila", role: "Event Lead", xp: 2400 }
];

const totalClubXP = clubMembers.reduce((acc, m) => acc + m.xp, 0);
console.log(\`Total Club Score: \${totalClubXP} XP\`);

const topTier = clubMembers.filter(m => m.xp >= 2500);
console.log("⭐ Top Tier Operatives:", topTier.map(m => \`\${m.name} (\${m.xp} XP)\`).join(", "));
`,
    templates: [
      {
        name: 'Array Transformations & Reducers',
        description: 'Modern map, filter, and reduce operations',
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconst evensSquared = numbers.filter(n => n % 2 === 0).map(n => n ** 2);\nconsole.log("Result:", evensSquared);`,
      },
      {
        name: 'Async Promise Simulation',
        description: 'Simulate asynchronous network requests',
        code: `const wait = ms => new Promise(res => setTimeout(res, ms));\nconsole.log("Starting task...");\nconsole.log("Processing batch items [100% completed]");`,
      },
    ],
    run: executeJavaScript,
  },

  // 3. TYPESCRIPT
  {
    id: 'typescript',
    name: 'TypeScript',
    version: 'TypeScript 5',
    extension: '.ts',
    icon: '🔷',
    color: '#3B82F6',
    popular: true,
    category: 'web',
    starterCode: `// DataCamp Student Club - TypeScript Playground
interface Operative {
  id: string;
  fullName: string;
  level: 'RECRUIT' | 'OPERATIVE' | 'SPECIALIST' | 'ENGINEER';
  points: number;
}

const operatives: Operative[] = [
  { id: 'DC-001', fullName: 'Ammar Ahmed', level: 'ENGINEER', points: 2800 },
  { id: 'DC-002', fullName: 'Sara Hassan', level: 'SPECIALIST', points: 950 }
];

operatives.forEach(op => {
  console.log(\`[\${op.id}] \${op.fullName} -> \${op.level} (\${op.points} XP)\`);
});
`,
    templates: [
      {
        name: 'Generics & Interfaces',
        description: 'Clean typed data modeling',
        code: `interface Result<T> { success: boolean; data: T; }\nconst res: Result<string> = { success: true, data: "Access Granted" };\nconsole.log("Status:", res);`,
      },
    ],
    run: executeTypeScript,
  },

  // 4. SQL (RELATIONAL DATABASE)
  {
    id: 'sql',
    name: 'SQL (SQLite)',
    version: 'SQLite 3',
    extension: '.sql',
    icon: '🗄️',
    color: '#00FFCC',
    popular: true,
    category: 'database',
    starterCode: "SELECT 1 + 1 AS result;",
    templates: [
      { name: 'Arithmetic query', description: 'Evaluate a SQL expression', code: 'SELECT 6 * 7 AS result;' },
      { name: 'Create and query a table', description: 'A self-contained SQL exercise', code: 'CREATE TABLE measurements(value INTEGER);\nINSERT INTO measurements VALUES (1),(2),(3);\nSELECT SUM(value) AS total FROM measurements;' },
      { name: 'Recursive sequence', description: 'Generate numbers using a recursive CTE', code: 'WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<10) SELECT n FROM numbers;' },
    ],
    run: async (code) => {
      const startTime = performance.now();
      const result = await runSQL(code);
      const output = result.output;
      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        output,
        executionTimeMs,
        error: result.error,
        engineUsed: 'SQLite WebAssembly',
      };
    },
  },

  // 5. C++
  {
    id: 'cpp',
    name: 'C++',
    version: 'GCC 10.2',
    extension: '.cpp',
    icon: '⚙️',
    color: '#00599C',
    popular: true,
    category: 'systems',
    starterCode: `// DataCamp Student Club - C++20 Playground
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "DataCamp Club C++20 High-Performance Engine\\n";
    std::vector<int> scores = {1200, 2400, 850, 3100, 1950};

    int total = std::accumulate(scores.begin(), scores.end(), 0);
    int maxScore = *std::max_element(scores.begin(), scores.end());

    std::cout << "Total Members: " << scores.size() << "\\n";
    std::cout << "Total XP: " << total << "\\n";
    std::cout << "Peak Score: " << maxScore << " XP\\n";

    return 0;
}
`,
    templates: [
      {
        name: 'Vector Operations & Sorting',
        description: 'Modern STL vector algorithms',
        code: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> v = {5, 2, 8, 1, 9};\n    std::sort(v.begin(), v.end());\n    std::cout << "Sorted: ";\n    for(int n : v) std::cout << n << " ";\n    return 0;\n}`,
      },
      {
        name: 'Binary Search Algorithm',
        description: 'O(log N) optimal search implementation',
        code: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> arr = {10, 20, 30, 40, 50};\n    int target = 30;\n    bool found = std::binary_search(arr.begin(), arr.end(), target);\n    std::cout << "Element " << target << " found: " << (found ? "YES" : "NO") << "\\n";\n    return 0;\n}`,
      },
    ],
    run: async (code, stdin) => {
      const startTime = performance.now();
      const res = await executeViaPiston('c++', '10.2.0', [{ name: 'main.cpp', content: code }], stdin);

      if (res) {
        return {
          output: res.stdout || res.stderr || '[Completed with exit code 0]',
          error: res.code !== 0 ? (res.stderr || `Process exited with code ${res.code}`) : undefined,
          executionTimeMs: Math.round(performance.now() - startTime),
          engineUsed: 'GCC 10.2 / Piston Sandbox',
        };
      }

      // Offline simulation fallback
      return { output: '', error: 'Execution service unavailable. No code was executed.', executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Unavailable' };
    },
  },

  // 6. JAVA
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 15.0.2',
    extension: '.java',
    icon: '☕',
    color: '#EA2D2E',
    popular: false,
    category: 'systems',
    starterCode: `// DataCamp Student Club - Java Playground
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ DataCamp Club Java Environment Running");

        List<String> leaders = Arrays.asList("Ammar (3200 XP)", "Sara (2800 XP)", "Omar (1950 XP)");
        System.out.println("Top Club Operatives:");
        leaders.forEach(leader -> System.out.println(" • " + leader));

        System.out.println("Execution finished cleanly.");
    }
}
`,
    templates: [
      {
        name: 'OOP Class & Encapsulation',
        description: 'Standard Object Oriented Programming model',
        code: `class Student {\n    String name; int xp;\n    Student(String n, int x) { name = n; xp = x; }\n    void display() { System.out.println(name + " has " + xp + " XP"); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        new Student("Ammar", 2500).display();\n    }\n}`,
      },
    ],
    run: async (code, stdin) => {
      const startTime = performance.now();
      const res = await executeViaPiston('java', '15.0.2', [{ name: 'Main.java', content: code }], stdin);

      if (res) {
        return {
          output: res.stdout || res.stderr || '[Process finished]',
          error: res.code !== 0 ? (res.stderr || `Process exited with code ${res.code}`) : undefined,
          executionTimeMs: Math.round(performance.now() - startTime),
          engineUsed: 'OpenJDK 15.0.2 / Piston Sandbox',
        };
      }

      return { output: '', error: 'Execution service unavailable. No code was executed.', executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Unavailable' };
    },
  },

  // 7. R (DATA SCIENCE & STATISTICS)
  {
    id: 'r',
    name: 'R (Data Science)',
    version: 'R 4.1.1',
    extension: '.r',
    icon: '📈',
    color: '#276DC3',
    popular: true,
    category: 'data_science',
    starterCode: `# DataCamp Student Club - R Statistics Playground
scores <- c(1200, 2400, 850, 3100, 1950, 2600)
members <- c("Ammar", "Sara", "Omar", "Laila", "Youssef", "Karim")

cat("=== DATACAMP R STATISTICAL SUMMARY ===\\n")
cat("Mean XP:  ", mean(scores), "\\n")
cat("Median XP:", median(scores), "\\n")
cat("Std Dev:  ", round(sd(scores), 2), "\\n")
cat("Max XP:   ", max(scores), "\\n")
`,
    templates: [
      {
        name: 'Summary Statistics & Vector Math',
        description: 'Mean, median, quantiles, and standard deviation',
        code: `data <- c(10, 20, 25, 30, 45, 60, 75)\nsummary(data)\ncat("IQR:", IQR(data), "\\n")`,
      },
    ],
    run: async (code, stdin) => {
      const startTime = performance.now();
      const res = await executeViaPiston('r', '4.1.1', [{ name: 'script.r', content: code }], stdin);

      if (res) {
        return {
          output: res.stdout || res.stderr || '[Completed]',
          error: res.code !== 0 ? (res.stderr || `Process exited with code ${res.code}`) : undefined,
          executionTimeMs: Math.round(performance.now() - startTime),
          engineUsed: 'R 4.1.1 / Piston Sandbox',
        };
      }

      return { output: '', error: 'Execution service unavailable. No code was executed.', executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Unavailable' };
    },
  },

  // 8. GO (GOLANG)
  {
    id: 'go',
    name: 'Go',
    version: '1.16.2',
    extension: '.go',
    icon: '🐹',
    color: '#00ADD8',
    popular: false,
    category: 'systems',
    starterCode: `// DataCamp Student Club - Go Playground
package main

import (
	"fmt"
)

func main() {
	fmt.Println("🚀 DataCamp Club Go Fast Runtime")
	scores := map[string]int{
		"Ammar": 3200,
		"Sara":  2800,
		"Omar":  1950,
	}

	for member, xp := range scores {
		fmt.Printf("• %-8s : %d XP\\n", member, xp)
	}
}
`,
    templates: [
      {
        name: 'Goroutine Concurrency Simulation',
        description: 'Concurrent tasks with Go channels',
        code: `package main\nimport "fmt"\nfunc main() {\n\tch := make(chan string)\n\tgo func() { ch <- "Data processed from worker goroutine" }()\n\tfmt.Println(<-ch)\n}`,
      },
    ],
    run: async (code, stdin) => {
      const startTime = performance.now();
      const res = await executeViaPiston('go', '1.16.2', [{ name: 'main.go', content: code }], stdin);
      if (res) {
        return {
          output: res.stdout || res.stderr || '[Completed]',
          error: res.code !== 0 ? (res.stderr || `Process exited with code ${res.code}`) : undefined,
          executionTimeMs: Math.round(performance.now() - startTime),
          engineUsed: 'Go 1.16.2 / Piston Sandbox',
        };
      }
      return { output: '', error: 'Execution service unavailable. No code was executed.', executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Unavailable' };
    },
  },

  // 9. RUST
  {
    id: 'rust',
    name: 'Rust',
    version: '1.68.2',
    extension: '.rs',
    icon: '🦀',
    color: '#DEA584',
    popular: false,
    category: 'systems',
    starterCode: `// DataCamp Student Club - Rust Playground
fn main() {
    println!("🦀 DataCamp Club Rust Safe Runtime");
    let scores = vec![1200, 2400, 850, 3100, 1950];
    let total: i32 = scores.iter().sum();
    let max_val = scores.iter().max().unwrap_or(&0);

    println!("Total XP: {}", total);
    println!("Peak Score: {} XP", max_val);
}
`,
    templates: [
      {
        name: 'Pattern Matching & Enums',
        description: 'Idiomatic Rust match expressions',
        code: `enum Role { Admin, Editor, Member }\nfn main() {\n    let r = Role::Admin;\n    match r {\n        Role::Admin => println!("Full clearance granted"),\n        Role::Editor => println!("Course edit clearance"),\n        Role::Member => println!("Student portal clearance"),\n    }\n}`,
      },
    ],
    run: async (code, stdin) => {
      const startTime = performance.now();
      const res = await executeViaPiston('rust', '1.68.2', [{ name: 'main.rs', content: code }], stdin);
      if (res) {
        return {
          output: res.stdout || res.stderr || '[Completed]',
          error: res.code !== 0 ? (res.stderr || `Process exited with code ${res.code}`) : undefined,
          executionTimeMs: Math.round(performance.now() - startTime),
          engineUsed: 'Rust 1.68.2 / Piston Sandbox',
        };
      }
      return { output: '', error: 'Execution service unavailable. No code was executed.', executionTimeMs: Math.round(performance.now() - startTime), engineUsed: 'Unavailable' };
    },
  },
];

// ─── EXTENSIBLE REGISTRY HELPERS ─────────────────────────────────────────────

const customRegistry: Map<string, LanguageDefinition> = new Map();

// Initialize catalog in registry
LANGUAGE_CATALOG.forEach(lang => customRegistry.set(lang.id, lang));

/**
 * Register any new language dynamically in one function call!
 */
export function registerLanguage(lang: LanguageDefinition): void {
  customRegistry.set(lang.id, lang);
}

/**
 * Retrieve all registered languages.
 */
export function getRegisteredLanguages(): LanguageDefinition[] {
  return Array.from(customRegistry.values());
}

/**
 * Retrieve language definition by ID.
 */
export function getLanguage(id: string): LanguageDefinition {
  return customRegistry.get(id) || customRegistry.get('python')!;
}
