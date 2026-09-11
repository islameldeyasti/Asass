'use client';

import JournalShot from '@/components/gallery/JournalShot';

/** Uniform card grid — equal columns, consistent aspect ratio. */
export default function GalleryCardGrid({items, reduceMotion, onOpen}) {
  if (!items?.length) return null;

  return (
    <div className="gj-grid">
      {items.map((item, index) => (
        <div key={item.id} className="gj-card">
          <JournalShot
            item={item}
            card
            reduceMotion={reduceMotion}
            onOpen={onOpen}
            priority={index < 6}
          />
        </div>
      ))}
    </div>
  );
}
