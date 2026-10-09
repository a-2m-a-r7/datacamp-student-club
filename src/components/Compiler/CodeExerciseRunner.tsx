import React, { useState } from 'react';
import { runPythonCode, runCodeVerification, TestCase } from '../../lib/pythonRunner';
import { getLanguage, LanguageDefinition } from '../../lib/universalRunner';
import { Button } from '../ui/Button';
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
  Bot,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface CodeExerciseRunnerProps {
  exerciseTitle: string;
  exercisePrompt: string;
  starterCode: string;
  testCases: TestCase[];
  pointsReward?: number;
  language?: string;
  onSuccess?: () => void;
  onAskAI?: (code: string) => void;
}

export const CodeExerciseRunner: React.FC<CodeExerciseRunnerProps> = ({
  exerciseTitle,
  exercisePrompt,
  starterCode,
  testCases,
  pointsReward = 30,
  language = 'python',
  onSuccess,
  onAskAI,
}) => {
  const activeLang: LanguageDefinition = getLanguage(language);
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [testResults, setTestResults] = useState<{ description: string; passed: boolean; expected: string; actual: string }[] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    try {
      const res = await activeLang.run(code);
      setOutput(res.output);
      setError(res.error || null);
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      setError(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleVerify = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const exec = await runPythonCode(code);
      setOutput(exec.output);
      setError(exec.error);
      setExecutionTime(exec.executionTimeMs);

      if (exec.error) {
        toast.error('Code has errors. Fix them before submitting.');
        setIsVerifying(false);
        return;
      }

      const verif = await runCodeVerification(code, testCases);
      setTestResults(verif.results);

      if (verif.allPassed) {
        setIsCompleted(true);
        toast.success(`🎉 CHALLENGE SOLVED! +${pointsReward} XP Claimed!`, {
          duration: 5000,
        });
        if (onSuccess) onSuccess();
      } else {
        toast.error('Some tests failed. Check expected output and try again.');
      }
    } catch (err: any) {
      toast.error('Verification failed: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setCode(starterCode);
    setOutput('');
    setError(null);
    setTestResults(null);
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-dark-navy/90 backdrop-blur-2xl overflow-hidden shadow-[0_0_35px_rgba(0,255,204,0.12)] space-y-4 p-5 sm:p-6">
      {/* Exercise Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-cyber tracking-wider bg-primary/20 text-primary border border-primary/40 uppercase">
              PRACTICAL CHALLENGE
            </span>
            <span className="text-xs font-mono text-muted-foreground">{activeLang.name} {activeLang.version} In-Browser Engine</span>
          </div>
          <h3 className="text-lg font-cyber font-bold text-foreground">{exerciseTitle}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,204,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            +{pointsReward} XP
          </span>
          {isCompleted && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Challenge Instructions */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
        {exercisePrompt}
      </div>

      {/* Editor & Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-foreground">
              <Code2 className="w-3.5 h-3.5 text-primary" /> solution{activeLang.extension}
            </span>
            <button
              onClick={handleReset}
              className="hover:text-primary transition-colors flex items-center gap-1"
              title="Reset starter code"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="relative rounded-xl border border-white/15 bg-black/60 overflow-hidden font-mono text-xs shadow-inner">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full h-full p-4 bg-transparent text-emerald-300 placeholder:text-muted-foreground/40 outline-none resize-none font-mono text-xs leading-relaxed custom-scrollbar selection:bg-primary/30"
              placeholder="# Write your Python solution here..."
            />
          </div>
        </div>

        {/* Terminal Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-foreground">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Output Terminal
            </span>
            {executionTime !== null && (
              <span className="text-[10px] text-primary">{executionTime} ms</span>
            )}
          </div>

          <div className="rounded-xl border border-white/15 bg-black/80 p-4 h-[240px] overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
            {isRunning || isVerifying ? (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Executing Python script...</span>
              </div>
            ) : error ? (
              <div className="text-destructive whitespace-pre-wrap flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : output ? (
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
            ) : (
              <p className="text-muted-foreground/50 italic">
                Press "RUN CODE" to execute in the browser compiler.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Cases Feedback */}
      {testResults && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2.5">
          <h4 className="text-xs font-cyber text-primary uppercase tracking-wider">TEST_CASES_VERIFICATION</h4>
          <div className="space-y-1.5">
            {testResults.map((tr, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  tr.passed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tr.passed ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span>{tr.description}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {tr.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onAskAI && (
            <Button
              type="button"
              variant="outline"
              className="text-xs font-cyber h-10 border-white/10 hover:border-primary/40 gap-1.5"
              onClick={() => onAskAI(code)}
            >
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>HINT FROM NEXUS AI</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-xs font-cyber h-10 border-primary/30 text-primary gap-1.5"
            onClick={handleRun}
            disabled={isRunning || isVerifying}
          >
            <Play className="w-3.5 h-3.5" />
            <span>RUN_CODE</span>
          </Button>

          <Button
            type="button"
            variant="cyber"
            className="text-xs font-cyber h-10 px-5 gap-1.5 tracking-wider shadow-[0_0_15px_rgba(0,255,204,0.3)]"
            onClick={handleVerify}
            disabled={isRunning || isVerifying || isCompleted}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'CHALLENGE_SOLVED' : 'SUBMIT_SOLUTION'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
