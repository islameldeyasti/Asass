'use client';

import {motion, useReducedMotion} from 'motion/react';
import AnimatedCounter from './AnimatedCounter';

const EASE = [0.16, 1, 0.3, 1];

export default function StatsSection({locale, stats}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const items = Array.isArray(stats) ? stats : [];

  if (!items.length) return null;

  return (
    <section
      className="asas-stats"
      aria-label={ar ? 'أرقام أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS at a glance'}
    >
      <div className="home-shell asas-stats-shell">
        <div className="asas-stats-head">
          <p className="atlas-kicker">
            {ar ? 'بالأرقام' : 'By the numbers'}
          </p>
          <h2>
            {ar ? (
              <>
                سجل عمل واضح
                <span className="title-dot">.</span>
              </>
            ) : (
              <>
                A clear record of delivery
                <span className="title-dot">.</span>
              </>
            )}
          </h2>
        </div>

        <ul className="asas-stats-grid">
          {items.map((stat, index) => {
            const label = ar ? stat.labelAr : stat.label;
            const suffix = stat.suffix || '';
            return (
              <motion.li
                key={stat.id || label}
                className="asas-stats-item"
                initial={reduced ? false : {opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.35}}
                transition={{
                  duration: 0.65,
                  delay: reduced ? 0 : index * 0.08,
                  ease: EASE,
                }}
              >
                <p className="asas-stats-value ltr-isolate" dir="ltr">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={suffix}
                    duration={1400 + index * 80}
                  />
                </p>
                <p className="asas-stats-label">{label}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
