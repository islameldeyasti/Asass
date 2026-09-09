'use client';

import {Mic, MicOff} from 'lucide-react';

export default function AIVoiceButton({
  state = 'idle',
  onToggle,
  labels,
  disabled,
}) {
  const listening = state === 'listening' || state === 'processing';
  return (
    <button
      type="button"
      className={`asas-ai-mic${listening ? ' is-listening' : ''}`}
      aria-label={listening ? labels.micStop : labels.mic}
      aria-pressed={listening}
      disabled={disabled}
      onClick={onToggle}
    >
      {listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
      <span className="asas-ai-sr" aria-live="polite">
        {state === 'listening'
          ? labels.listening
          : state === 'processing'
            ? labels.processing
            : ''}
      </span>
    </button>
  );
}
