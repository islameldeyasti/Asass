'use client';

import {motion} from 'motion/react';
import GalleryCardGrid from '@/components/gallery/GalleryCardGrid';
import {pad} from '@/lib/gallery/journal';

const EASE = [0.19, 1, 0.22, 1];

export default function JournalSection({
  id,
  kicker,
  title,
  description,
  items,
  ar,
  reduceMotion,
  onOpen,
}) {
  if (!items?.length) return null;

  return (
    <section className="gj-block" id={`gj-${id}`}>
      <div className="gj-shell gj-block-head">
        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 12}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.4}}
          transition={{duration: 0.4, ease: EASE}}
        >
          <p className="gj-kicker">{kicker}</p>
          <h2>{title}</h2>
          {description ? <p className="gj-block-copy">{description}</p> : null}
          <p className="gj-photo-count">
            {pad(items.length)} {ar ? 'صورة' : items.length === 1 ? 'Photo' : 'Photos'}
          </p>
        </motion.div>
      </div>

      <div className="gj-shell">
        <GalleryCardGrid items={items} reduceMotion={reduceMotion} onOpen={onOpen} />
      </div>
    </section>
  );
}
