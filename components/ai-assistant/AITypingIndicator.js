'use client';

export default function AITypingIndicator({label}) {
  return (
    <div className="asas-ai-bubble asas-ai-bubble--assistant is-typing" aria-live="polite">
      <span className="asas-ai-typing" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="asas-ai-sr">{label}</span>
    </div>
  );
}
