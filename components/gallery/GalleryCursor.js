'use client';

export default function GalleryCursor({visible, x, y, ar}) {
  return (
    <div
      className={`ga-cursor${visible ? ' is-on' : ''}`}
      style={{transform: `translate3d(${x}px, ${y}px, 0)`}}
      aria-hidden="true"
    >
      <span>
        {ar ? 'عرض' : 'VIEW'}
        <i>↗</i>
      </span>
    </div>
  );
}
