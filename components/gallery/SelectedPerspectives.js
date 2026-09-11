'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {motion, useScroll, useTransform} from 'motion/react';
import {pad} from '@/lib/gallery/catalog';

const SIZES = [
  {w: 620, h: 620},
  {w: 400, h: 560},
  {w: 720, h: 470},
  {w: 420, h: 620},
  {w: 560, h: 420},
  {w: 380, h: 540},
  {w: 680, h: 500},
];

export default function SelectedPerspectives({
  items,
  ar,
  reduceMotion,
  desktop,
  onOpen,
  bindCursor,
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [maxX, setMaxX] = useState(0);

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    if (!desktop || reduceMotion) return undefined;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setMaxX(Math.max(0, track.scrollWidth - window.innerWidth + 64));
    };
    measure();
    const t = window.setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [desktop, reduceMotion, items.length]);

  if (!items?.length) return null;

  const cards = (
    <div className="ga-strip-track" ref={trackRef}>
      {items.map((item, index) => {
        const size = SIZES[index % SIZES.length];
        return (
          <button
            key={item.id}
            type="button"
            className="ga-strip-card"
            style={{width: size.w, height: size.h}}
            onClick={() => onOpen(item.id)}
            {...(bindCursor || {})}
          >
            <span className="ga-strip-media">
              <span className="ga-shot-bg" style={{backgroundImage: `url(${item.src})`}} />
              <Image src={item.src} alt={item.label} fill sizes="720px" loading="lazy" className="ga-shot-img" />
            </span>
            <span className="ga-strip-cap">
              <span>{item.label}</span>
              <span>{item.disciplineLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  if (!desktop || reduceMotion) {
    return (
      <section className="ga-strip ga-strip--native">
        <div className="ga-shell ga-strip-head">
          <h2>
            {ar ? (
              <>
                منظورات
                <br />
                مختارة
              </>
            ) : (
              <>
                Selected
                <br />
                Perspectives
              </>
            )}
          </h2>
        </div>
        <div className="ga-strip-scroll">{cards}</div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="ga-strip"
      style={{height: `${Math.max(items.length * 45, 260)}vh`}}
    >
      <div className="ga-strip-pin">
        <div className="ga-shell ga-strip-head">
          <h2>
            {ar ? (
              <>
                منظورات
                <br />
                مختارة
              </>
            ) : (
              <>
                Selected
                <br />
                Perspectives
              </>
            )}
          </h2>
          <p className="ga-strip-progress">
            01
            <span>
              <motion.i style={{width: bar}} />
            </span>
            {pad(items.length)}
          </p>
        </div>
        <motion.div className="ga-strip-motion" style={{x}}>
          {cards}
        </motion.div>
      </div>
    </section>
  );
}
