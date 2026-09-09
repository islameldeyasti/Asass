'use client';

import {Bot, MessageSquare, Mic, Minus, X} from 'lucide-react';
import {AI_ASSISTANT_CONFIG, AI_UI_COPY} from '@/lib/ai/config';

export default function AIHeader({
  siteLocale,
  mode,
  onModeChange,
  onMinimize,
  onClose,
  liveActive,
}) {
  const uiLang = siteLocale === 'ar' ? 'ar' : 'en';
  const t = AI_UI_COPY[uiLang];
  const name = AI_ASSISTANT_CONFIG.assistantName[uiLang];

  return (
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

      <div className="asas-ai-mode-tabs" role="tablist" aria-label={uiLang === 'ar' ? 'وضع المساعد' : 'Assistant mode'}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'chat'}
          className={mode === 'chat' ? 'is-active' : ''}
          disabled={liveActive}
          onClick={() => onModeChange?.('chat')}
        >
          <MessageSquare size={14} aria-hidden="true" />
          {t.modeChat}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'talk'}
          className={mode === 'talk' ? 'is-active' : ''}
          onClick={() => onModeChange?.('talk')}
        >
          <Mic size={14} aria-hidden="true" />
          {t.modeTalk}
        </button>
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
  );
}
