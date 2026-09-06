'use client';

import {motion, useReducedMotion} from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

export default function TeamExpertise({items, locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  if (!items?.length) return null;

  return (
    <section className="tm-section">
      <div className="tm-shell">
        <p className="tm-kicker">
          <i />
          {ar ? 'الخبرات' : 'Expertise'}
        </p>
        <h2>{ar ? 'مجالات الخبرة' : 'Areas of Expertise'}</h2>
        <ul className="tm-expertise">
          {items.map((item, index) => (
            <motion.li
              key={`${item}-${index}`}
              initial={reduced ? false : {opacity: 0, y: 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.4}}
              transition={{duration: 0.4, delay: index * 0.04, ease: EASE}}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
