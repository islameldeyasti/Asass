'use client';

import Image from 'next/image';
import {useInViewOnce} from '@/lib/gallery/hooks';

/** Gallery thumbnail — card mode uses fixed 4:3 cover crop. */
export default function JournalShot({
  item,
  className = '',
  priority = false,
  reduceMotion,
  onOpen,
  showView = true,
  card = false,
}) {
  const ref = useInViewOnce(reduceMotion);
  if (!item) return null;

  return (
    <button
      type="button"
      className={`gj-shot${card ? ' gj-shot--card' : ''} ${className}`.trim()}
      ref={ref}
      onClick={() => onOpen?.(item.id)}
      aria-label={item.label || item.caption}
    >
      <span className="gj-shot-frame">
        <Image
          src={item.src}
          alt={item.label || item.caption || ''}
          fill
          sizes={
            card
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              : '(max-width: 700px) calc(100vw - 32px), 400px'
          }
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="gj-shot-img"
        />
      </span>
      {showView ? (
        <span className="gj-shot-view" aria-hidden="true">
          View ↗
        </span>
      ) : null}
    </button>
  );
}
