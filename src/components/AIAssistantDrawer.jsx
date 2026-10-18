import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './icons.jsx';
import { Emblem, Avatar } from './Header.jsx';
import { Btn } from './ui.jsx';
import { useAuth } from '../context/BCAuthContext.jsx';
import { handleUserMessage, handleQuickCommand } from '../services/chatbot.js';
import { schemesData } from '../data.js';
import { speakMultilingual, stopSpeech, LANGUAGE_LOCALES, getActiveSiteLanguage } from '../utils/tts.js';

const SUPPORTED_LANGS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

export default function AIAssistantDrawer({ isOpen, onClose, initialQuery = '' }) {
  const { user, backend, notify } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('site_language') || 'en');
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const [cp, setCp] = useState(null);
  const [apps, setApps] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load profile and applications for AI context
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const profile = await backend.loadProfile(user.uid);
        const list = await backend.listApplications(user.uid);
        if (alive) {
          setCp(profile || {});
          setApps(list || []);
        }
      } catch (e) {
        console.error('Failed to load context for AI drawer', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, backend]);

  const citizenName = cp?.basic?.fullName || user?.name || 'Citizen';
  const initials = citizenName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const chatContext = useMemo(() => {
    return {
      user: {
        ...user,
        name: citizenName,
        language: selectedLang,
        profile: cp,
      },
      applications: apps,
    };
  }, [user, cp, apps, citizenName, selectedLang]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          text: `Namaste, **${citizenName}**! 🙏\n\nI am your **Praaman AI Assistant**. I can help you with government schemes, check your eligibility, track applications, and answer questions in **7 languages**.\n\nHow can I help you right now?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            { label: 'Check my scheme eligibility' },
            { label: 'Track my applications' },
            { label: 'Required documents for PM-JAY' },
          ],
        },
      ]);
    }
  }, [messages.length, citizenName]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (e) => {
        const transcript = e.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput(transcript);
          setTimeout(() => handleSend(transcript), 300);
        }
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      notify?.('Speech recognition is not supported in this browser.', 'amber');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const langCodes = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN', pa: 'pa-IN', gu: 'gu-IN' };
      recognitionRef.current.lang = langCodes[selectedLang] || 'en-IN';
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSpeak = (text, idx) => {
    if (speakingIdx === idx) {
      stopSpeech();
      setSpeakingIdx(null);
      return;
    }

    setSpeakingIdx(idx);
    const activeLang = (selectedLang && selectedLang !== 'en') ? selectedLang : getActiveSiteLanguage();
    const targetLang = activeLang && activeLang !== 'en' ? (LANGUAGE_LOCALES[activeLang] || `${activeLang}-IN`) : undefined;
    speakMultilingual(text, {
      lang: targetLang,
      onEnd: () => setSpeakingIdx(null),
      onError: () => setSpeakingIdx(null),
    });
  };

  const handleCopy = (text, idx) => {
    navigator?.clipboard?.writeText(text);
    setCopiedIdx(idx);
    notify?.('Copied to clipboard!', 'blue');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = useCallback(
    (customText = null) => {
      const rawText = customText !== null ? customText : input;
      const text = String(rawText || '').trim();
      if (!text || isTyping) return;

      setInput('');
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        try {
          const reply =
            handleQuickCommand(text, chatContext) ||
            handleUserMessage(text, chatContext);

          const aiMsg = {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: reply.text || "I'm sorry, I couldn't process that query. Please try rephrasing or ask about your application status.",
            lang: reply.lang || selectedLang,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: reply.suggestions && reply.suggestions.length > 0 ? reply.suggestions : undefined,
          };

          setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
          console.error('Chat error:', err);
        } finally {
          setIsTyping(false);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }, 400);
    },
    [input, isTyping, chatContext, selectedLang]
  );

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen, handleSend]);

  const handleClear = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'ai',
        text: `Conversation reset. How can I help you today, **${citizenName}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          { label: 'Check my scheme eligibility' },
          { label: 'Track my applications' },
        ],
      },
    ]);
  };

  const detectSchemes = (text) => {
    if (!text) return [];
    return schemesData.filter((s) => text.toLowerCase().includes(s.name.toLowerCase()) || text.includes(s.id)).slice(0, 2);
  };

  const renderText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ') || /^\d+\.\s/.test(line.trim());
          const cleanLine = isBullet ? line.trim().replace(/^[-•]\s+/, '').replace(/^\d+\.\s+/, '') : line;
          const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

          return (
            <div key={idx} className={`flex items-start gap-1.5 ${isBullet ? 'pl-2' : ''}`}>
              {isBullet && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />}
              <div className="min-w-0 flex-1">
                {parts.map((p, i) =>
                  p.startsWith('**') && p.endsWith('**') ? (
                    <strong key={i} className="font-bold text-ink-900 dark:text-white">
                      {p.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={i}>{p}</span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/40 backdrop-blur-[2px] transition-opacity animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="relative z-10 flex h-full w-full max-w-[460px] flex-col bg-white dark:bg-[#0c0c0c] shadow-2xl border-l border-ink-100 dark:border-white/10 animate-slide-left"
        role="dialog"
        aria-label="Praaman AI Assistant"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-ink-100 dark:border-white/10 px-5 py-3.5 bg-ink-50/70 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Emblem size={28} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-verd-500 ring-2 ring-white dark:ring-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-ink-900 dark:text-white">Praaman AI Assistant</h3>
                <span className="rounded-full bg-verd-50 dark:bg-verd-900/40 px-2 py-0.5 text-[10px] font-bold text-verd-700 dark:text-verd-300 border border-verd-200 dark:border-verd-800">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-ink-400 dark:text-ink-500">Government Schemes & Citizen Guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                localStorage.setItem('site_language', e.target.value);
              }}
              className="rounded-lg border border-ink-200 dark:border-white/20 bg-white dark:bg-ink-900 px-2 py-1 text-[11px] font-bold text-ink-800 dark:text-white cursor-pointer"
            >
              {SUPPORTED_LANGS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
            <button
              onClick={handleClear}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-white/10 hover:text-ink-700 dark:text-ink-300"
              title="Reset conversation"
            >
              <Icon name="refresh" className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-white/10 hover:text-ink-700 dark:text-ink-300"
              title="Close Assistant"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-[#0c0c0c]">
          {messages.map((msg, idx) => {
            const isAi = msg.role === 'ai';
            const schemes = isAi ? detectSchemes(msg.text) : [];

            return (
              <div key={msg.id || idx} className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
                {isAi ? (
                  <div className="shrink-0 mt-0.5">
                    <Emblem size={28} />
                  </div>
                ) : (
                  <div className="shrink-0 mt-0.5">
                    <Avatar initials={initials} size={28} ring={false} />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`rounded-2xl p-3.5 shadow-xs text-ink-900 dark:text-ink-100 ${
                      isAi
                        ? 'bg-[#f7f9fd] dark:bg-[#161616] border border-ink-100 dark:border-white/10 rounded-tl-sm'
                        : 'bg-ink-800 text-white rounded-tr-sm'
                    }`}
                  >
                    {renderText(msg.text)}

                    {/* Schemes attached */}
                    {isAi && schemes.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-ink-200/70 dark:border-white/10 space-y-2">
                        {schemes.map((sc) => (
                          <div
                            key={sc.id}
                            className="rounded-xl border border-ink-200 dark:border-white/10 bg-white dark:bg-white/5 p-2.5"
                          >
                            <p className="text-[12px] font-bold text-ink-900 dark:text-white truncate">{sc.name}</p>
                            <p className="mt-0.5 text-[11px] text-ink-500 dark:text-ink-400 line-clamp-1">{sc.description}</p>
                            <div className="mt-2 flex gap-1.5">
                              <Link
                                to={`/schemes/${sc.id}`}
                                onClick={onClose}
                                className="flex-1 text-center rounded bg-ink-50 dark:bg-white/10 py-1 text-[10.5px] font-bold text-ink-700 dark:text-ink-300 hover:bg-ink-100"
                              >
                                Details
                              </Link>
                              <Link
                                to={`/dashboard/apply/${sc.id}`}
                                onClick={onClose}
                                className="flex-1 text-center rounded bg-verd-600 py-1 text-[10.5px] font-bold text-white hover:bg-verd-700"
                              >
                                Apply
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Speech & Copy controls */}
                    {isAi && (
                      <div className="mt-2.5 flex items-center gap-3 pt-1.5 border-t border-ink-100 dark:border-white/10 text-[11px] text-ink-400 dark:text-ink-500">
                        <button
                          onClick={(e) => {
                            const bubble = e.currentTarget.closest('.chat-bubble') || e.currentTarget.parentElement?.previousElementSibling;
                            const renderedP = bubble?.querySelector('p');
                            const renderedText = (renderedP?.innerText || '').trim();
                            handleSpeak(renderedText || msg.text, idx);
                          }}
                          className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name="speaker" className="h-3 w-3" />
                          <span>{speakingIdx === idx ? 'Stop' : 'Listen'}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(msg.text, idx)}
                          className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name={copiedIdx === idx ? 'check' : 'copy'} className="h-3 w-3" />
                          <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span className="nums ml-auto text-[10px]">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {isAi && msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug.label)}
                          className="rounded-full border border-ink-200 dark:border-white/10 bg-white dark:bg-ink-900 px-2.5 py-0.5 text-[11.5px] font-medium text-ink-700 dark:text-ink-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-ink-400 text-[12px] p-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-medium">Praaman AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-ink-50/50 dark:bg-white/[0.02] border-t border-ink-100 dark:border-white/10">
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 dark:border-white/20 bg-white dark:bg-[#121212] px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <button
              onClick={toggleListening}
              className={`rounded-lg p-1.5 transition-colors ${
                isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-ink-400 hover:text-ink-700'
              }`}
              title={isListening ? 'Listening...' : 'Voice dictation'}
            >
              <Icon name="mic" className="h-4 w-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? 'Listening...' : 'Ask about schemes, status, etc.'}
              className="flex-1 bg-transparent text-[13px] text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="rounded-lg bg-ink-800 dark:bg-white p-1.5 text-white dark:text-ink-900 disabled:opacity-40 transition-transform active:scale-95"
            >
              <Icon name="send" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
