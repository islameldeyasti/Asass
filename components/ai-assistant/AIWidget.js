'use client';

import {useEffect, useId, useRef, useState, useCallback} from 'react';
import {Sparkles, X} from 'lucide-react';
import {AI_ASSISTANT_CONFIG, AI_UI_COPY, getQuickActions} from '@/lib/ai/config';
import {detectLanguage} from '@/lib/ai/language';
import {
  fetchAiConfig,
  getOrCreateConversationId,
  sendAiChatMessage,
} from '@/lib/ai/client';
import AIHeader from './AIHeader';
import AIMessage from './AIMessage';
import AIComposer from './AIComposer';
import AITypingIndicator from './AITypingIndicator';
import AIQuickActions from './AIQuickActions';
import AIVoiceMode from './AIVoiceMode';
import {useSpeechRecognition} from './hooks/useSpeechRecognition';
import {useSpeechSynthesis} from './hooks/useSpeechSynthesis';

function greetingMessage(siteLocale) {
  const lang = siteLocale === 'ar' ? 'ar' : 'en';
  return {
    id: 'hello',
    role: 'assistant',
    content: AI_ASSISTANT_CONFIG.defaultGreeting[lang],
    language: lang,
    sourceType: 'website',
  };
}

export default function AIWidget({locale = 'en'}) {
  const siteLocale = locale === 'ar' ? 'ar' : 'en';
  const t = AI_UI_COPY[siteLocale];
  const panelId = useId();
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const liveRef = useRef(null);
  const transcriptSeq = useRef(0);

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mode, setMode] = useState('chat');
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [conversationId, setConversationId] = useState(() =>
    typeof window !== 'undefined' ? getOrCreateConversationId() : null,
  );
  const [lastFailed, setLastFailed] = useState(null);
  const [messages, setMessages] = useState(() => [greetingMessage(siteLocale)]);
  const [suggestions, setSuggestions] = useState(() => getQuickActions(siteLocale));
  const [textCount, setTextCount] = useState(0);

  const [publicConfig, setPublicConfig] = useState(null);
  const [liveState, setLiveState] = useState('idle');
  const [liveActive, setLiveActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('');

  const {speak, stop: stopSpeak, speakingId} = useSpeechSynthesis();

  const onVoiceResult = useCallback((transcriptText) => {
    setInput(transcriptText);
    setStatusMessage('');
  }, []);

  const onVoiceError = useCallback(
    (code) => {
      if (code === 'denied') setStatusMessage(t.micDenied);
      else setStatusMessage(t.error);
    },
    [t],
  );

  const voiceLang = detectLanguage(input, siteLocale);
  const {
    state: dictationState,
    start: startDictation,
    stop: stopDictation,
  } = useSpeechRecognition({
    language: voiceLang,
    onResult: onVoiceResult,
    onError: onVoiceError,
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMessages([greetingMessage(siteLocale)]);
      setSuggestions(getQuickActions(siteLocale));
    }, 0);
    return () => window.clearTimeout(id);
  }, [siteLocale]);

  useEffect(() => {
    let cancelled = false;
    fetchAiConfig()
      .then((cfg) => {
        if (!cancelled) setPublicConfig(cfg);
      })
      .catch(() => {
        if (!cancelled) setPublicConfig(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!listRef.current || minimized || mode !== 'chat') return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending, open, minimized, mode]);

  useEffect(() => {
    if (open && !minimized && mode === 'chat') {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open, minimized, mode]);

  useEffect(() => {
    if (!open) {
      stopDictation();
      stopSpeak();
      const id = window.setTimeout(() => {
        setMinimized(false);
        void endLive();
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open, stopDictation, stopSpeak]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!liveActive) {
      const id = window.setTimeout(() => setElapsed(0), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => {
      setElapsed(liveRef.current?.getElapsedSeconds?.() || 0);
    }, 500);
    return () => window.clearInterval(id);
  }, [liveActive]);

  useEffect(
    () => () => {
      void endLive();
    },
    [],
  );

  async function endLive() {
    const session = liveRef.current;
    liveRef.current = null;
    setLiveActive(false);
    if (session) await session.stop();
    setLiveState('idle');
  }

  async function startLive() {
    setVoiceStatus('');
    if (!publicConfig?.geminiConfigured) {
      setVoiceStatus(t.geminiMissing);
      return;
    }
    if (!window.WebSocket || !navigator?.mediaDevices?.getUserMedia) {
      setVoiceStatus(t.liveUnsupported);
      return;
    }

    await endLive();
    setTranscript([]);
    transcriptSeq.current = 0;
    setLiveActive(true);
    setLiveState('connecting');

    try {
      const {GeminiLiveSession} = await import('@/lib/ai/live/GeminiLiveSession');
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m) => ({role: m.role, content: m.content}));

      const session = new GeminiLiveSession({
        conversationId,
        siteLocale,
        history,
        maxSessionMinutes: publicConfig?.maxVoiceSessionMinutes || 5,
        onState: (state) => {
          setLiveState(state);
          if (state === 'disconnected' || state === 'error') {
            setLiveActive(false);
            liveRef.current = null;
          }
        },
        onTranscript: (line) => {
          const language = detectLanguage(line.text, siteLocale);
          transcriptSeq.current += 1;
          const stamp = `${Date.now()}-${transcriptSeq.current}-${line.role}`;

          if (line.final) {
            setMessages((msgs) => [
              ...msgs,
              {
                id: `v-${stamp}`,
                role: line.role === 'user' ? 'user' : 'assistant',
                content: line.text,
                language,
                sourceType: 'website',
              },
            ]);
          }

          setTranscript((prev) => {
            if (!line.final) {
              const last = prev[prev.length - 1];
              if (last && last.role === line.role && !last.final) {
                const next = [...prev];
                next[next.length - 1] = {
                  ...last,
                  text: line.text,
                  language,
                };
                return next;
              }
              return [
                ...prev,
                {
                  id: `t-${stamp}`,
                  role: line.role,
                  text: line.text,
                  language,
                  final: false,
                },
              ];
            }
            return [
              ...prev.filter((p) => !(p.role === line.role && !p.final)),
              {
                id: `t-${stamp}-f`,
                role: line.role,
                text: line.text,
                language,
                final: true,
              },
            ];
          });
        },
        onError: () => setVoiceStatus(t.voiceError),
        onLimit: () => {
          setVoiceStatus(t.voiceLimit);
          setMode('chat');
        },
      });

      liveRef.current = session;
      await session.start();
    } catch (error) {
      setLiveActive(false);
      setLiveState('error');
      if (error?.code === 'microphone_denied') setVoiceStatus(t.micDenied);
      else if (error?.code === 'microphone_unavailable') setVoiceStatus(t.micUnavailable);
      else if (error?.code === 'missing_key') setVoiceStatus(t.geminiMissing);
      else setVoiceStatus(t.voiceError);
    }
  }

  const sendMessage = useCallback(
    async (raw) => {
      const text = String(raw || '').trim();
      if (!text || pending) return;

      const maxText = publicConfig?.maxTextMessagesPerSession || AI_ASSISTANT_CONFIG.maxTextMessagesPerSession;
      if (textCount >= maxText) {
        setStatusMessage(siteLocale === 'ar' ? 'وصلت للحد الأقصى للرسائل في هذه الجلسة.' : 'Message limit reached for this session.');
        return;
      }

      const userLang = detectLanguage(text, siteLocale);
      const userMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text,
        language: userLang,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setPending(true);
      setStatusMessage('');
      setMinimized(false);
      setLastFailed(text);
      setTextCount((n) => n + 1);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-(AI_ASSISTANT_CONFIG.maxHistoryMessages || 12))
          .map((m) => ({role: m.role, content: m.content}));

        const data = await sendAiChatMessage({
          message: text,
          history,
          conversationId,
          siteLocale,
        });

        setLastFailed(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.message || t.error,
            language: data.language || userLang,
            sourceType: data.sourceType || 'website',
            sources: data.sources || [],
          },
        ]);
        if (Array.isArray(data.suggestions) && data.suggestions.length) {
          setSuggestions(data.suggestions);
        }
        if (data.conversationId) setConversationId(data.conversationId);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: t.error,
            language: userLang,
            sourceType: 'general',
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [pending, messages, conversationId, siteLocale, t.error, publicConfig, textCount],
  );

  if (!AI_ASSISTANT_CONFIG.enabled) return null;

  return (
    <div className={`asas-ai${open ? ' is-open' : ''}`} data-locale={siteLocale}>
      {open ? (
        <div
          id={panelId}
          className={`asas-ai-panel${minimized ? ' is-minimized' : ''}${mode === 'talk' ? ' is-voice' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={AI_ASSISTANT_CONFIG.assistantName[siteLocale]}
        >
          <AIHeader
            siteLocale={siteLocale}
            mode={mode}
            liveActive={liveActive}
            onModeChange={async (next) => {
              if (next === 'chat' && liveActive) await endLive();
              setMode(next);
            }}
            onMinimize={() => setMinimized((v) => !v)}
            onClose={() => setOpen(false)}
          />

          {!minimized ? (
            mode === 'talk' ? (
              <AIVoiceMode
                siteLocale={siteLocale}
                liveState={liveState}
                elapsed={elapsed}
                transcript={transcript}
                showTranscript={showTranscript}
                onToggleTranscript={() => setShowTranscript((v) => !v)}
                onStart={startLive}
                onEnd={async () => {
                  await endLive();
                }}
                liveActive={liveActive}
                statusMessage={voiceStatus}
                geminiConfigured={Boolean(publicConfig?.geminiConfigured)}
              />
            ) : (
              <>
                <div className="asas-ai-body" ref={listRef}>
                  {messages.map((msg) => (
                    <AIMessage
                      key={msg.id}
                      message={msg}
                      voiceOutputEnabled={AI_ASSISTANT_CONFIG.voiceOutputEnabled && msg.role === 'assistant'}
                      speaking={speakingId === msg.id}
                      onSpeak={(m) => speak(m.content, {id: m.id, language: m.language})}
                      onStopSpeak={stopSpeak}
                    />
                  ))}
                  {pending ? <AITypingIndicator label={t.thinking} /> : null}
                  {statusMessage ? (
                    <p className="asas-ai-status" role="status">
                      {statusMessage}
                    </p>
                  ) : null}
                </div>

                {!pending && suggestions?.length ? (
                  <AIQuickActions
                    actions={suggestions}
                    onSelect={sendMessage}
                    disabled={pending}
                    label={siteLocale === 'ar' ? 'اقتراحات' : 'Suggestions'}
                  />
                ) : null}

                <AIComposer
                  value={input}
                  onChange={setInput}
                  onSubmit={sendMessage}
                  placeholder={t.placeholder}
                  sendLabel={t.send}
                  disabled={pending}
                  dir={detectLanguage(input, siteLocale) === 'ar' ? 'rtl' : 'ltr'}
                  inputId={`${panelId}-input`}
                  inputRef={inputRef}
                  voiceEnabled={AI_ASSISTANT_CONFIG.voiceDictationEnabled}
                  voiceState={dictationState}
                  onVoiceToggle={() => {
                    if (dictationState === 'listening' || dictationState === 'processing') stopDictation();
                    else startDictation();
                  }}
                  voiceLabels={{
                    mic: t.dictation,
                    micStop: t.dictationStop,
                    listening: t.listening,
                    processing: t.thinking,
                  }}
                />

                <footer className="asas-ai-foot">
                  <span>{AI_ASSISTANT_CONFIG.disclaimer[siteLocale]}</span>
                  {lastFailed ? (
                    <button type="button" className="asas-ai-retry" onClick={() => sendMessage(lastFailed)}>
                      {t.retry}
                    </button>
                  ) : null}
                </footer>
              </>
            )
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className="asas-ai-fab"
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <>
            <Sparkles size={18} aria-hidden="true" />
            <span className="asas-ai-fab-label">{AI_ASSISTANT_CONFIG.fabLabel[siteLocale]}</span>
          </>
        )}
      </button>
    </div>
  );
}
