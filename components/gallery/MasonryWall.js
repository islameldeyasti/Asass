'use client';

import JournalShot from '@/components/gallery/JournalShot';

/** CSS-columns masonry — natural ratios, no equal-height cards. */
export default function MasonryWall({
  items,
  reduceMotion,
  onOpen,
  leadFirst = false,
  columnsClass = '',
}) {
  if (!items?.length) return null;

  return (
    <div className={`gj-masonry ${columnsClass}`.trim()}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`gj-masonry-item${leadFirst && index === 0 ? ' is-lead' : ''}`}
        >
          <JournalShot
            item={item}
            masonry
            reduceMotion={reduceMotion}
            onOpen={onOpen}
            priority={index < 3}
          />
        </div>
      ))}
    </div>
  );
}
