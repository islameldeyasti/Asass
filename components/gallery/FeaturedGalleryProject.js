'use client';

import {motion} from 'motion/react';
import RevealImage from '@/components/gallery/RevealImage';
import {pad} from '@/lib/gallery/catalog';

const EASE = [0.19, 1, 0.22, 1];

export default function FeaturedGalleryProject({item, ar, reduceMotion, onOpen, bindCursor}) {
  if (!item) return null;

  return (
    <section className="ga-featured">
      <div className="ga-wide">
        <motion.p
          className="ga-featured-kicker"
          initial={reduceMotion ? false : {opacity: 0, y: 12}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.55, ease: EASE}}
        >
          {pad(1)} / {ar ? 'مشروع مميز' : 'Featured Project'}
        </motion.p>

        <RevealImage
          src={item.src}
          alt={item.label}
          sizes="96vw"
          priority
          reduceMotion={reduceMotion}
          parallax={!reduceMotion}
          featured
          className="ga-featured-shot"
          onOpen={() => onOpen(item.id)}
          {...(bindCursor || {})}
        />

        <div className="ga-featured-meta">
          <motion.h2
            initial={reduceMotion ? false : {opacity: 0, y: 28}}
            whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.7, ease: EASE}}
          >
            {item.label}
          </motion.h2>
          <motion.dl
            initial={reduceMotion ? false : {opacity: 0, y: 20}}
            whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.65, delay: 0.08, ease: EASE}}
          >
            <div>
              <dt>{ar ? 'التصنيف' : 'Category'}</dt>
              <dd>{item.disciplineLabel}</dd>
            </div>
            <div>
              <dt>{ar ? 'الموقع' : 'Location'}</dt>
              <dd>{item.location}</dd>
            </div>
            {item.year ? (
              <div>
                <dt>{ar ? 'السنة' : 'Year'}</dt>
                <dd>{item.year}</dd>
              </div>
            ) : null}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
