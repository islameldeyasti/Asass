'use client';

import {motion} from 'motion/react';

const EASE = [0.19, 1, 0.22, 1];

export default function GalleryIntro({ar, reduceMotion}) {
  return (
    <section className="gj-intro" id="gallery-top">
      <div className="gj-shell">
        <motion.p
          className="gj-eyebrow"
          initial={reduceMotion ? false : {opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, ease: EASE}}
        >
          <i />
          {ar ? 'أساس / المعرض' : 'ASAS / Gallery'}
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : {opacity: 0, y: 22}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.7, delay: 0.08, ease: EASE}}
        >
          {ar ? 'من خلال عدستنا' : 'Through Our Lens'}
        </motion.h1>
        <motion.p
          className="gj-lede"
          initial={reduceMotion ? false : {opacity: 0, y: 14}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.2, ease: EASE}}
        >
          {ar
            ? 'أرشيف بصري لمشاريعنا وأفرادنا وأماكننا واللحظات خلف العمل.'
            : 'A visual archive of our projects, people, places and moments behind the work.'}
        </motion.p>
      </div>
    </section>
  );
}
