'use client';

import {Square} from 'lucide-react';
import {AI_UI_COPY} from '@/lib/ai/config';
import {dirForLanguage} from '@/lib/ai/language';
import AIVoiceOrb from './AIVoiceOrb';

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function statusLabel(t, state) {
  switch (state) {
    case 'connecting':
      return t.connecting;
    case 'listening':
      return t.listening;
    case 'thinking':
      return t.thinking;
    case 'speaking':
      return t.speaking;
    case 'paused':
      return t.paused;
    case 'error':
      return t.voiceError;
    case 'disconnected':
      return t.disconnected;
    default:
      return t.speakNaturally;
  }
}

export default function AIVoiceMode({
  siteLocale,
  liveState,
  elapsed,
  transcript = [],
  showTranscript,
  onToggleTranscript,
  onStart,
  onEnd,
  liveActive,
  statusMessage,
  geminiConfigured,
}) {
  const uiLang = siteLocale === 'ar' ? 'ar' : 'en';
  const t = AI_UI_COPY[uiLang];
  const orbState =
    liveState === 'speaking'
      ? 'speaking'
      : liveState === 'listening'
        ? 'listening'
        : liveState === 'connecting'
          ? 'connecting'
          : liveState === 'error'
            ? 'error'
            : 'idle';

  return (
    <div className="asas-ai-voice" aria-live="polite">
      <div className="asas-ai-voice-timer" aria-label={uiLang === 'ar' ? 'مدة الجلسة' : 'Session duration'}>
        {formatTimer(elapsed)}
      </div>

      <AIVoiceOrb state={orbState} />

      <p className="asas-ai-voice-status">{statusLabel(t, liveState)}</p>
      <p className="asas-ai-voice-hint">{liveActive ? t.speakNaturally : t.startVoice}</p>

      {statusMessage ? <p className="asas-ai-status" role="status">{statusMessage}</p> : null}

      {!geminiConfigured ? (
        <p className="asas-ai-status" role="status">
          {t.geminiMissing}
        </p>
      ) : null}

      <div className="asas-ai-voice-actions">
        {liveActive ? (
          <button type="button" className="asas-ai-voice-end" onClick={onEnd}>
            <Square size={14} aria-hidden="true" />
            {t.endVoice}
          </button>
        ) : (
          <button
            type="button"
            className="asas-ai-voice-start"
            onClick={onStart}
            disabled={!geminiConfigured || liveState === 'connecting'}
          >
            {t.startVoice}
          </button>
        )}
      </div>

      {transcript.length ? (
        <div className="asas-ai-transcript-wrap">
          <button type="button" className="asas-ai-transcript-toggle" onClick={onToggleTranscript}>
            {showTranscript ? t.hideTranscript : t.showTranscript}
          </button>
          {showTranscript ? (
            <div className="asas-ai-transcript" aria-label={t.transcript}>
              {transcript.map((line, index) => (
                <p
                  key={line.id || `transcript-${index}`}
                  className={`asas-ai-transcript-line asas-ai-transcript-line--${line.role}`}
                  dir={dirForLanguage(line.language || ( /[\u0600-\u06FF]/.test(line.text) ? 'ar' : 'en'))}
                >
                  <strong>{line.role === 'user' ? t.you : t.ai}:</strong> {line.text}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
