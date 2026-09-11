'use client';

import {motion} from 'motion/react';
import GalleryCardGrid from '@/components/gallery/GalleryCardGrid';

const EASE = [0.19, 1, 0.22, 1];

export default function FeaturedShowcase({items, ar, reduceMotion, onOpen}) {
  if (!items?.length) return null;

  return (
    <section className="gj-block gj-featured" id="gj-featured">
      <div className="gj-shell gj-block-head">
        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 12}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.4}}
          transition={{duration: 0.4, ease: EASE}}
        >
          <p className="gj-kicker">{ar ? 'عرض مميز' : 'Featured Showcase'}</p>
          <h2>{ar ? 'لحظات مختارة من المشاريع' : 'Selected project moments'}</h2>
        </motion.div>
      </div>

      <div className="gj-shell">
        <GalleryCardGrid items={items} reduceMotion={reduceMotion} onOpen={onOpen} />
      </div>
    </section>
  );
}
