'use client';

import {Volume2, VolumeX} from 'lucide-react';
import {dirForLanguage} from '@/lib/ai/language';
import {AI_UI_COPY} from '@/lib/ai/config';
import AISourceBadge from './AISourceBadge';

export default function AIMessage({
  message,
  onSpeak,
  onStopSpeak,
  speaking,
  voiceOutputEnabled,
}) {
  const language = message.language || 'en';
  const t = AI_UI_COPY[language === 'ar' ? 'ar' : 'en'];
  const isUser = message.role === 'user';

  return (
    <div
      className={`asas-ai-bubble asas-ai-bubble--${message.role}`}
      dir={dirForLanguage(language)}
    >
      <p>{message.content}</p>
      {!isUser ? (
        <div className="asas-ai-bubble-meta">
          {message.sourceType ? (
            <AISourceBadge sourceType={message.sourceType} language={language} />
          ) : null}
          {voiceOutputEnabled ? (
            <button
              type="button"
              className="asas-ai-speak-btn"
              aria-label={speaking ? t.stopSpeak : t.speak}
              onClick={() => (speaking ? onStopSpeak?.() : onSpeak?.(message))}
            >
              {speaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
