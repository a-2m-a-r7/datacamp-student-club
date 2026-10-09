import React, { useState } from 'react';
import {
  getRegisteredLanguages,
  getLanguage,
  LanguageDefinition,
  ExecutionResult,
} from '../lib/universalRunner';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import {
  Play,
  RotateCcw,
  Download,
  Share2,
  Terminal,
  Code2,
  Bot,
  Copy,
  Sparkles,
  Check,
  AlertTriangle,
  Cpu,
  Layers,
  FileCode,
  TerminalSquare,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { AIMentorModal } from '../components/AIMentor/AIMentorModal';

export const CompilerPlayground = () => {
  const languages = getRegisteredLanguages();
  const [selectedLangId, setSelectedLangId] = useState<string>('python');
  const activeLang: LanguageDefinition = getLanguage(selectedLangId);
  const { isArabic, t } = useLanguage();

  const [code, setCode] = useState<string>(activeLang.starterCode);
  const [stdin, setStdin] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [engineUsed, setEngineUsed] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch language handler
  const handleLanguageChange = (langId: string) => {
    setSelectedLangId(langId);
    const newLang = getLanguage(langId);
    setCode(newLang.starterCode);
    setOutput('');
    setError(null);
    setExecutionTime(null);
    setEngineUsed('');
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    try {
      const res: ExecutionResult = await activeLang.run(code, stdin);
      setOutput(res.output);
      setError(res.error || null);
      setExecutionTime(res.executionTimeMs);
      setEngineUsed(res.engineUsed);
      if (res.error) {
        toast.error('Execution encountered errors', {
          description: 'Review output terminal or click "Ask NEXUS AI" for debugging assistance.',
        });
      } else {
        toast.success(`Code executed successfully in ${res.executionTimeMs}ms`);
      }
    } catch (err: any) {
      setError(err.message || 'Execution failed');
      toast.error('Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datacamp_${activeLang.id}_script${activeLang.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded script as datacamp_${activeLang.id}_script${activeLang.extension}`);
  };

  const handleReset = () => {
    setCode(activeLang.starterCode);
    setOutput('');
    setError(null);
    setExecutionTime(null);
    setEngineUsed('');
    toast.info('Editor reset to default starter code');
  };

  return (
    <div className="min-h-screen bg-cyber-black text-foreground pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> {isArabic ? 'بيئة تشغيل افتراضية متعددة اللغات' : 'MULTI-LANGUAGE VIRTUAL RUNTIME'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {isArabic ? `${languages.length} لغات مدعومة` : `${languages.length} Languages Supported`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-cyber font-black tracking-tight text-white flex items-center gap-3">
              {isArabic ? (
                <>محرر الأكواد <span className="text-primary neon-text">السحابي الشامل</span></>
              ) : (
                <>UNIVERSAL <span className="text-primary neon-text">ONLINE COMPILER</span></>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic 
                ? 'اكتب، ونفّذ، واختبر أكواد بايثون، جافاسكريبت، تايب سكريبت، SQL، C++، جافا، R، و Rust فورياً بدون أي إعدادات مسبقة.'
                : 'Write, compile, and run code instantly in Python, JavaScript, TypeScript, SQL, C++, Java, R, Go, & Rust with zero setup.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAIModalOpen(true)}
              className="border-primary/40 text-primary hover:bg-primary/10 font-cyber text-xs flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-neon-green" /> {isArabic ? 'استشر مرشد الـ AI' : 'ASK NEXUS AI'}
            </Button>
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90 text-dark-navy font-cyber font-bold text-xs tracking-wider px-6 shadow-[0_0_20px_rgba(0,255,204,0.3)] flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-navy border-t-transparent rounded-full animate-spin" />
                  {isArabic ? 'جاري التنفيذ...' : 'COMPILING...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-dark-navy" /> {isArabic ? 'تشغيل الكود (F5)' : 'RUN CODE (F5)'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Language Selector Bar */}
        <div className="mt-6 p-2 rounded-xl bg-dark-navy/60 border border-white/10 backdrop-blur-md flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 text-xs font-cyber text-muted-foreground uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-primary" /> {isArabic ? 'لغات البرمجة:' : 'LANGUAGES:'}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {languages.map((lang) => {
              const isSelected = lang.id === selectedLangId;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-dark-navy font-bold shadow-[0_0_12px_rgba(0,255,204,0.4)] scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5'
                  }`}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.name}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-dark-navy/20' : 'bg-black/30'}`}>
                    {lang.version}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Bar */}
        {activeLang.templates && activeLang.templates.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" /> {isArabic ? 'أكواد جاهزة:' : 'Templates:'}
            </span>
            {activeLang.templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => {
                  setCode(tpl.code);
                  toast.info(`${isArabic ? 'تم تحميل النموذج' : 'Loaded template'}: ${tpl.name}`);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 hover:text-white transition-colors"
                title={tpl.description}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Workspace Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-white/10 bg-dark-navy/90 backdrop-blur-xl shadow-2xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                source{activeLang.extension}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {activeLang.name} {activeLang.version}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowStdin(!showStdin)}
                className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1 font-mono ${
                  showStdin ? 'bg-primary/20 text-primary' : 'hover:bg-white/10 text-muted-foreground'
                }`}
                title="Toggle Stdin Input"
              >
                <TerminalSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Input</span>
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-white"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-white"
                title="Download Source File"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-white"
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Textarea */}
          <div className="relative flex-1 min-h-[460px] bg-cyber-black/70">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-transparent text-emerald-300 resize-none focus:outline-none focus:ring-0 leading-relaxed selection:bg-primary/30"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>

          {/* Stdin Drawer (if open) */}
          {showStdin && (
            <div className="border-t border-white/10 bg-black/60 p-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
                <span>{isArabic ? 'المدخلات القياسية (STDIN):' : 'STANDARD INPUT (STDIN):'}</span>
                <span>{isArabic ? 'للبرامج التي تستقبل مدخلات أثناء التشغيل' : 'For programs reading inputs'}</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder={isArabic ? 'أدخل أسطر المدخلات هنا...' : 'Enter standard input lines here...'}
                rows={2}
                className="w-full p-2 text-xs font-mono bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          {/* Editor Status Bar */}
          <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{isArabic ? 'الأسطر' : 'Lines'}: {code.split('\n').length}</span>
              <span>{isArabic ? 'المحارف' : 'Chars'}: {code.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isArabic ? 'المحرك: جاهز' : 'Engine: Ready'}</span>
            </div>
          </div>
        </div>

        {/* Terminal Output Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-xl overflow-hidden border border-white/10 bg-dark-navy/90 backdrop-blur-xl shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {isArabic ? 'مخرجات التنفيذ (CONSOLE)' : 'EXECUTION OUTPUT'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              {executionTime !== null && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {executionTime}ms
                </span>
              )}
              {output && (
                <button
                  onClick={() => {
                    setOutput('');
                    setError(null);
                  }}
                  className="text-muted-foreground hover:text-white px-1.5 py-0.5 hover:bg-white/10 rounded"
                >
                  {isArabic ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 min-h-[460px] p-4 font-mono text-xs overflow-auto bg-black/80 space-y-2 select-text">
            {!output && !error && !isRunning && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
                <div className="p-3 rounded-full bg-white/5 border border-white/10">
                  <Terminal className="w-6 h-6 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-cyber text-sm text-white">{isArabic ? 'منصة الأوامر جاهزة' : 'CONSOLE READY'}</p>
                  <p className="text-xs font-mono">
                    {isArabic 
                      ? `اضغط "تشغيل الكود" لتنفيذ السكربت بلغة ${activeLang.name}.`
                      : `Press 'RUN CODE' to execute your script in ${activeLang.name}.`}
                  </p>
                </div>
              </div>
            )}

            {isRunning && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-cyber text-xs tracking-wider text-primary animate-pulse">
                  {isArabic ? `جاري تجميع وتشغيل الكود بلغة ${activeLang.name.toUpperCase()}...` : `COMPILING & EXECUTING IN ${activeLang.name.toUpperCase()}...`}
                </p>
              </div>
            )}

            {output && (
              <pre className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">
                {output}
              </pre>
            )}

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  RUNTIME / COMPILATION ERROR:
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono text-red-300">
                  {error}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAIModalOpen(true)}
                  className="mt-2 text-[11px] h-7 border-red-500/40 text-red-300 hover:bg-red-500/20 font-cyber"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> DEBUG WITH NEXUS AI
                </Button>
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="truncate max-w-[250px]">
              Engine: {engineUsed || activeLang.version}
            </span>
            <span className="text-primary font-bold">
              {activeLang.extension.toUpperCase()} ENVIRONMENT
            </span>
          </div>
        </div>
      </div>

      {/* Floating AI Debugger */}
      <AIMentorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialMessage={`Can you review my ${activeLang.name} code and help me improve or debug it?\n\n\`\`\`${activeLang.id}\n${code}\n\`\`\``}
      />
    </div>
  );
};

export default CompilerPlayground;
