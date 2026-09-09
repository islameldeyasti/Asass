'use client';

import {Bot, Minus, X} from 'lucide-react';
import {AI_ASSISTANT_CONFIG, AI_UI_COPY} from '@/lib/ai/config';
import {dirForLanguage} from '@/lib/ai/language';
import AIMessage from './AIMessage';
import AIComposer from './AIComposer';
import AITypingIndicator from './AITypingIndicator';
import AIQuickActions from './AIQuickActions';

export default function AIChatWindow({
  panelId,
  siteLocale,
  open,
  minimized,
  messages,
  pending,
  suggestions,
  input,
  setInput,
  onSend,
  onClose,
  onMinimize,
  onRetry,
  listRef,
  inputRef,
  voiceEnabled,
  voiceState,
  onVoiceToggle,
  voiceOutputEnabled,
  onSpeak,
  onStopSpeak,
  speakingId,
  statusMessage,
}) {
  const uiLang = siteLocale === 'ar' ? 'ar' : 'en';
  const t = AI_UI_COPY[uiLang];
  const name = AI_ASSISTANT_CONFIG.assistantName[uiLang];
  const composerDir = dirForLanguage(
    input.trim() ? ( /[\u0600-\u06FF]/.test(input) ? 'ar' : siteLocale) : siteLocale,
  );

  if (!open) return null;

  return (
    <div
      id={panelId}
      className={`asas-ai-panel${minimized ? ' is-minimized' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      data-locale={siteLocale}
    >
      <header className="asas-ai-head">
        <div className="asas-ai-brand">
          <span className="asas-ai-avatar" aria-hidden="true">
            <Bot size={18} />
          </span>
          <div className="asas-ai-brand-copy">
            <strong>{name}</strong>
            <small>
              <span className="asas-ai-dot" aria-hidden="true" />
              {t.online}
            </small>
          </div>
        </div>
        <div className="asas-ai-head-actions">
          <button type="button" className="asas-ai-icon-btn" aria-label={t.minimize} onClick={onMinimize}>
            <Minus size={16} aria-hidden="true" />
          </button>
          <button type="button" className="asas-ai-icon-btn" aria-label={t.close} onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {!minimized ? (
        <>
          <div className="asas-ai-body" ref={listRef}>
            {messages.map((msg) => (
              <AIMessage
                key={msg.id}
                message={msg}
                voiceOutputEnabled={voiceOutputEnabled && msg.role === 'assistant'}
                speaking={speakingId === msg.id}
                onSpeak={onSpeak}
                onStopSpeak={onStopSpeak}
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
              onSelect={onSend}
              disabled={pending}
              label={uiLang === 'ar' ? 'اقتراحات' : 'Suggestions'}
            />
          ) : null}

          <AIComposer
            value={input}
            onChange={setInput}
            onSubmit={onSend}
            placeholder={t.placeholder}
            sendLabel={t.send}
            disabled={pending}
            dir={composerDir === 'ar' ? 'rtl' : 'ltr'}
            inputId={`${panelId}-input`}
            inputRef={inputRef}
            voiceEnabled={voiceEnabled}
            voiceState={voiceState}
            onVoiceToggle={onVoiceToggle}
            voiceLabels={t}
          />

          <footer className="asas-ai-foot">
            <span>{AI_ASSISTANT_CONFIG.disclaimer[uiLang]}</span>
            {onRetry ? (
              <button type="button" className="asas-ai-retry" onClick={onRetry}>
                {t.retry}
              </button>
            ) : null}
          </footer>
        </>
      ) : null}
    </div>
  );
}
