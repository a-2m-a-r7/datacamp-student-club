import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePoints } from '../../contexts/PointsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { aiService, AIMessage, isGeminiConfigured, clearChatHistory } from '../../services/aiService';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Send, Bot, Sparkles, Key, Database, Zap, RefreshCw, MessageSquarePlus, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { isFirebaseReady } from '../../lib/firebase';

const renderInlineText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono rounded bg-primary/15 text-primary border border-primary/25"
          dir="ltr"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg border border-primary/20 bg-black/60 overflow-hidden font-mono text-xs shadow-md" dir="ltr">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-primary/10 text-[10px] text-muted-foreground">
        <span className="uppercase tracking-wider text-primary/80 font-bold">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-100 font-mono text-[11px] leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedMessage: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-100" dir="auto">
        {content}
      </div>
    );
  }

  // Normalize line endings
  const normalized = (content || '').replace(/\r\n/g, '\n');

  // Split by code blocks (closed or open at end)
  const sections = normalized.split(/(```(?:[a-zA-Z0-9_-]+)?\n[\s\S]*?(?:```|$))/g);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200" dir="auto">
      {sections.map((section, sIdx) => {
        if (section.startsWith('```')) {
          const match = section.match(/^```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)(?:```)?$/);
          const lang = match ? match[1] || '' : '';
          const code = match ? match[2].trim() : section.replace(/^```[^\n]*\n?/, '').replace(/```$/, '').trim();
          return <CodeBlock key={sIdx} code={code} language={lang} />;
        }

        const lines = section.split('\n');
        return (
          <React.Fragment key={sIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lIdx} className="h-1" />;
              }

              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lIdx} className="my-2 border-t border-primary/20" />;
              }

              const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
              if (headerMatch) {
                const level = headerMatch[1].length;
                const text = headerMatch[2];
                return (
                  <div
                    key={lIdx}
                    className={`font-bold text-primary my-1.5 ${
                      level <= 2 ? 'text-sm sm:text-base border-b border-primary/20 pb-1' : 'text-xs sm:text-sm'
                    }`}
                    dir="auto"
                  >
                    {renderInlineText(text)}
                  </div>
                );
              }

              if (/^[-*•]\s+/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-0.5 ps-1" dir="auto">
                    <span className="text-primary mt-1 text-[8px] shrink-0">•</span>
                    <span className="flex-1">{renderInlineText(trimmed.replace(/^[-*•]\s+/, ''))}</span>
                  </div>
                );
              }

              if (/^\d+\.\s+/.test(trimmed)) {
                const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-0.5 ps-1" dir="auto">
                    <span className="text-primary font-mono font-bold text-[11px] shrink-0">{numMatch?.[1]}.</span>
                    <span className="flex-1">{renderInlineText(numMatch?.[2] || '')}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="my-0.5 leading-relaxed" dir="auto">
                  {renderInlineText(line)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface AIMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export const AIMentorModal: React.FC<AIMentorModalProps> = ({ isOpen, onClose, initialMessage }) => {
  const { profile } = useAuth();
  const { totalPoints, level } = usePoints();
  const { isArabic, t } = useLanguage();
  const navigate = useNavigate();

  const getInitialMessage = (isAr: boolean): AIMessage => {
    const name = profile?.fullName?.split(' ')[0] || (isAr ? 'البطل' : 'Champion');
    return {
      id: 'welcome-msg',
      sender: 'assistant',
      text: isAr
        ? `مرحباً بك يا ${name}. أنا **NEXUS**، مرشدك الذكي في نادي DataCamp بجامعة الابتكار.\n\n${isFirebaseReady ? '🟢 **قاعدة البيانات متصلة** — وصول مباشر للدورات والفعاليات ونقاط الأعضاء.' : '🟡 **النظام المحلي نشط** — تشغيل قاعدة المعرفة المحلية.'}\n\n${isGeminiConfigured() ? '⚡ **ذكاء Gemini المتطور متصل** — تفكير تحليلي حي فائق السرعة.' : '💡 **ملاحظة**: يعمل بنظام الذكاء المحلي.'}\n\nكيف يمكنني مساعدتك ودعم مسارك التعليمي اليوم؟`
        : `Hello ${name}! I am **NEXUS**, your AI mentor at DataCamp Student Club.\n\n${isFirebaseReady ? '🟢 **Database Connected** — Live access to courses, events, and member XP.' : '🟡 **Local Runtime Active** — Local knowledge base operating.'}\n\n${isGeminiConfigured() ? '⚡ **Google Gemini Online** — Live ultra-fast reasoning enabled.' : '💡 **Note**: Running on local AI heuristics.'}\n\nHow can I accelerate your learning journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: isAr ? [
        { label: '🗺️ اقترح دورة مناسبة', action: 'ask', payload: 'ما هي أفضل دورة أبدأ بها في النادي؟' },
        { label: '🐍 شرح كود بايثون', action: 'ask', payload: 'اشرح لي كيفية كتابة كود بايثون سريع وفعال لتحليل البيانات' },
        { label: '⚡ كيف أجمع نقاط XP؟', action: 'ask', payload: 'كيف أرفع مستواي وأكسب نقاط XP بسرعة في النادي؟' },
        { label: '🎯 خطة لـ 4 أسابيع', action: 'generate_path', payload: 'data_science' },
        ...(!isGeminiConfigured() ? [{ label: '🔑 ربط مفتاح Gemini', action: 'configure_key' }] : []),
      ] : [
        { label: '🗺️ Recommend a course', action: 'ask', payload: 'What is the best course to start with in the club?' },
        { label: '🐍 Explain Python code', action: 'ask', payload: 'Explain how to write fast and clean Python code for data science' },
        { label: '⚡ How to earn XP?', action: 'ask', payload: 'How do I level up and earn XP quickly in the club?' },
        { label: '🎯 4-Week Study Plan', action: 'generate_path', payload: 'data_science' },
        ...(!isGeminiConfigured() ? [{ label: '🔑 Connect Gemini Key', action: 'configure_key' }] : []),
      ],
    };
  };

  const [messages, setMessages] = useState<AIMessage[]>([getInitialMessage(isArabic)]);

  useEffect(() => {
    // If only the welcome message exists, adapt to current language
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages([getInitialMessage(isArabic)]);
    }
  }, [isArabic]);

  const [input, setInput] = useState(initialMessage || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('datacamp_gemini_api_key') || '');

  useEffect(() => {
    if (initialMessage && isOpen) {
      setInput(initialMessage);
    }
  }, [initialMessage, isOpen]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    courseService.getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('datacamp_gemini_api_key', apiKey.trim());
      setShowApiKeyInput(false);
      // Add confirmation message
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: isArabic 
          ? '🔑 **تم تفعيل مفتاح Google Gemini API بنجاح!** أصبح NEXUS مدعوماً الآن بنموذج Gemini مع سياق كامل لقاعدة بيانات نادي DataCamp.\n\nتفضل بسؤالي عن أي استفسار تقني أو برمجي أو أكاديمي!'
          : '🔑 **Google Gemini API Key activated!** NEXUS is now powered by live Google Gemini AI with full RAG database context from DataCamp Club.\n\nAsk me any complex technical, programming, or career question!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(query, profile, totalPoints, courses);

      const assistantMsg: AIMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: isArabic 
            ? 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى أو التأكد من اتصال الإنترنت.' 
            : 'Apologies, an error occurred while processing your query. Please retry or check network connectivity.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: { label: string; action: string; payload?: string }) => {
    if (action.action === 'configure_key') {
      setShowApiKeyInput(true);
      return;
    }

    if (action.action === 'navigate' && action.payload) {
      onClose();
      navigate(action.payload);
      return;
    }

    if (action.action === 'ask' && action.payload) {
      handleSend(action.payload);
      return;
    }

    if (action.action === 'generate_path') {
      const prompt = isArabic 
        ? `صمم لي خطة دراسية تفصيلية مدتها 4 أسابيع للبدء في مسار ${action.payload === 'data_science' ? 'علم البيانات والذكاء الاصطناعي' : action.payload} مع اقتراح الدورات والمهام العملية اليومية.`
        : `Design a comprehensive 4-week study plan for ${action.payload === 'data_science' ? 'Data Science & AI' : action.payload} including recommended courses and daily practical tasks.`;
      handleSend(prompt);
      return;
    }
  };

  const handleNewChat = () => {
    clearChatHistory();
    setMessages([getInitialMessage(isArabic)]);
  };

  const handleRefreshContext = async () => {
    setIsTyping(true);
    aiService.clearContextCache();
    await courseService.getCourses().then(setCourses).catch(console.error);
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: isArabic 
        ? '🔄 **تم تحديث سياق قاعدة البيانات بنجاح!** تم مزامنة أحدث الدورات والفعاليات ونقاط المتصدرين من السيرفر.'
        : '🔄 **Database context synchronized!** Latest courses, events, and leaderboard stats are updated.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  if (!isOpen) return null;

  const hasApiKey = Boolean(apiKey.trim()) || isGeminiConfigured();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl h-[650px] max-h-[90vh] bg-dark-navy/95 border border-primary/30 rounded-xl shadow-[0_0_50px_rgba(0,255,204,0.15)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,255,204,0.3)]">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-navy animate-ping" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cyber font-bold text-primary tracking-wider text-base">
                    {isArabic ? 'مرشد NEXUS الذكي' : 'NEXUS AI MENTOR'}
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary uppercase">RAG_v3.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {profile?.fullName || (isArabic ? 'عضو النادي' : 'Operative')} • <span className="text-primary font-bold">{level}</span>
                  </p>
                  {/* Status indicators */}
                  <div className="flex items-center gap-1.5">
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono ${isFirebaseReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <Database className="w-2.5 h-2.5" />
                      {isFirebaseReady ? 'DB' : 'DEMO'}
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono ${hasApiKey ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      <Zap className="w-2.5 h-2.5" />
                      {hasApiKey ? 'GEMINI' : 'LOCAL'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title={isArabic ? 'محادثة جديدة' : 'Start new conversation'}
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleRefreshContext}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                title={isArabic ? 'تحديث سياق قاعدة البيانات' : 'Refresh database context'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`p-2 rounded-lg transition-colors ${hasApiKey ? 'text-blue-400 hover:bg-blue-500/10' : 'text-muted-foreground hover:text-primary hover:bg-white/5'}`}
                title={isArabic ? 'تهيئة مفتاح Gemini API' : 'Configure Gemini API Key'}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={isArabic ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* API Key Input Panel */}
          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-primary/20 bg-dark-navy/90"
              >
                <div className="p-3 flex gap-2 items-center">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={isArabic ? 'الصق مفتاح Google Gemini API هنا...' : 'Paste your Gemini API Key here...'}
                    className="font-mono text-xs bg-dark-navy/80 border-primary/30 h-9"
                    dir="ltr"
                  />
                  <Button
                    onClick={handleSaveApiKey}
                    variant="cyber"
                    className="h-9 px-3 text-xs shrink-0"
                    disabled={!apiKey.trim()}
                  >
                    {isArabic ? 'حفظ المفتاح' : 'Save Key'}
                  </Button>
                </div>
                <p className="px-3 pb-2 text-[10px] text-muted-foreground/80 font-mono">
                  {isArabic ? (
                    <>احصل على مفتاح مجاني فوراً من <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>. يتيح التفكير الحي السريع وتوليد الأكواد المعقدة.</>
                  ) : (
                    <>Get a free key instantly from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>. Enables live multi-turn reasoning and real-time coding synthesis.</>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Connect Banner when key is absent */}
          {!hasApiKey && !showApiKeyInput && (
            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs font-mono text-slate-200">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                <span className="text-[11px] truncate">
                  {isArabic 
                    ? <>الوضع المحلي نشط. اربط مفتاح <strong>Google Gemini API</strong> المجاني للتفكير الفوري:</>
                    : <>Offline mode active. Connect free <strong>Google Gemini API</strong> for live neural reasoning:</>}
                </span>
              </div>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="mx-2 px-2.5 py-0.5 rounded bg-primary text-dark-navy font-bold text-[10px] uppercase hover:bg-primary/80 transition-colors shrink-0"
              >
                {isArabic ? 'ربط المفتاح' : 'Connect Key'}
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3.5 text-xs sm:text-sm font-sans leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary/20 border border-primary/40 text-foreground'
                      : 'bg-white/5 border border-white/10 text-muted-foreground/90 backdrop-blur-md'
                  }`}
                >
                  <FormattedMessage content={msg.text} isUser={msg.sender === 'user'} />

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 text-[11px] font-mono rounded bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 transition-all flex items-center gap-1.5"
                        >
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-1 text-[9px] font-mono text-muted-foreground/50 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-primary">
                <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-primary/80">
                    {isArabic 
                      ? (isFirebaseReady ? 'جاري استدعاء بيانات النادي...' : 'جاري تحليل وصياغة الإجابة...')
                      : (isFirebaseReady ? 'Querying club database...' : 'Synthesizing response...')}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Bar */}
          <div className="p-3 sm:p-4 border-t border-primary/20 bg-black/40 backdrop-blur-xl">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isArabic ? 'اسأل NEXUS عن الدورات، الأكواد، الفعاليات، أو خطة تعلمك...' : 'Ask NEXUS about courses, code snippets, events, or learning paths...'}
                className="font-sans text-xs bg-dark-navy/80 border-primary/30 text-foreground placeholder:text-muted-foreground/60 h-11"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
              <Button
                type="submit"
                variant="cyber"
                className="h-11 px-4 font-cyber shrink-0"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4 mr-1 rtl:rotate-180" />
                <span className="hidden sm:inline">{isArabic ? 'إرسال' : 'Send'}</span>
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
