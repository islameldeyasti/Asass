'use client';

import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {motion} from 'motion/react';
import GalleryCardGrid from '@/components/gallery/GalleryCardGrid';

const EASE = [0.19, 1, 0.22, 1];

export default function ProjectsInFocus({items, locale, ar, reduceMotion, onOpen}) {
  if (!items?.length) return null;

  return (
    <section className="gj-block gj-focus" id="gj-focus">
      <div className="gj-shell gj-block-head">
        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 12}}
          whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.4, ease: EASE}}
        >
          <p className="gj-kicker">{ar ? 'مشاريع في الواجهة' : 'Projects in Focus'}</p>
          <h2>{ar ? 'لحظات بصرية مختارة' : 'Selected visual moments'}</h2>
          <p className="gj-block-copy">
            {ar
              ? 'هذه ليست محفظة المشاريع الكاملة — بل لقطات مختارة من أعمال أساس.'
              : 'This is not the full project portfolio — only selected visual moments from ASAS work.'}
          </p>
          <Link className="gj-text-link" href={`/${locale}/projects`}>
            {ar ? 'استكشف كل المشاريع' : 'Explore All Projects'}
            <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
          </Link>
        </motion.div>
      </div>

      <div className="gj-shell">
        <GalleryCardGrid items={items} reduceMotion={reduceMotion} onOpen={onOpen} />
      </div>
    </section>
  );
}
