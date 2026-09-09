'use client';

export default function AIVoiceOrb({state = 'idle'}) {
  return (
    <div className={`asas-ai-orb asas-ai-orb--${state}`} aria-hidden="true">
      <span className="asas-ai-orb-core" />
      <span className="asas-ai-orb-ring" />
      <span className="asas-ai-orb-ring asas-ai-orb-ring--delay" />
    </div>
  );
}
