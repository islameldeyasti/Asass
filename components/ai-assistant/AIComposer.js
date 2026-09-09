'use client';

import {Send} from 'lucide-react';
import AIVoiceButton from './AIVoiceButton';

export default function AIComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  sendLabel,
  disabled,
  dir,
  inputId,
  inputRef,
  voiceEnabled,
  voiceState,
  onVoiceToggle,
  voiceLabels,
}) {
  return (
    <form
      className="asas-ai-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value);
      }}
    >
      <label className="asas-ai-sr" htmlFor={inputId}>
        {placeholder}
      </label>
      <textarea
        id={inputId}
        ref={inputRef}
        rows={1}
        dir={dir}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={2000}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit?.(value);
          }
        }}
      />
      {voiceEnabled ? (
        <AIVoiceButton
          state={voiceState}
          onToggle={onVoiceToggle}
          labels={voiceLabels}
          disabled={disabled}
        />
      ) : null}
      <button
        type="submit"
        className="asas-ai-send"
        aria-label={sendLabel}
        disabled={disabled || !String(value || '').trim()}
      >
        <Send size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
