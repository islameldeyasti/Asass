'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {useMemo} from 'react';
import {buildHomeGalleryTeaser} from '@/lib/gallery/journal';

const EASE = [0.19, 1, 0.22, 1];

export default function HomeGalleryTeaser({locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const items = useMemo(() => buildHomeGalleryTeaser(locale), [locale]);
  if (!items.length) return null;

  return (
    <section className="hg" id="gallery-teaser" aria-labelledby="home-gallery-heading">
      <div className="hg-shell">
        <motion.div
          className="hg-head"
          initial={reduced ? false : {opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.5}}
          transition={{duration: 0.6, ease: EASE}}
        >
          <p className="hg-eyebrow">
            <i />
            {ar ? 'أساس / المعرض' : 'ASAS / Gallery'}
          </p>
          <h2 id="home-gallery-heading">{ar ? 'من خلال عدستنا' : 'Through Our Lens'}</h2>
          <p>
            {ar
              ? 'لمحة من الأرشيف البصري — مشاريع وتفاصيل ولحظات من عمل أساس.'
              : 'A glimpse of the visual archive — projects, details and moments from ASAS work.'}
          </p>
          <Link className="hg-link" href={`/${locale}/gallery`}>
            {ar ? 'استكشف المعرض' : 'Explore Gallery'}
            <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
          </Link>
        </motion.div>

        <div className="hg-mosaic">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className={`hg-cell hg-cell--${index}`}
              initial={reduced ? false : {opacity: 0, y: 24}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.25}}
              transition={{duration: 0.65, delay: Math.min(index, 4) * 0.06, ease: EASE}}
            >
              <Link href={`/${locale}/gallery`} className="hg-shot" aria-label={item.label}>
                <span className="hg-bg" style={{backgroundImage: `url(${item.src})`}} />
                <Image src={item.src} alt={item.label || ''} fill sizes="40vw" loading="lazy" className="hg-img" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
