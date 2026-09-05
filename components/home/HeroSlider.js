'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';

const DURATION_MS = 8000;

export default function HeroSlider({locale, slides}) {
  const ar = locale === 'ar';
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const remainingRef = useRef(DURATION_MS);
  const slideEpochRef = useRef(0);
  const total = slides.length;
  const current = slides[index];

  const goTo = useCallback((next) => {
    slideEpochRef.current += 1;
    remainingRef.current = DURATION_MS;
    setIndex((next + total) % total);
    setProgressKey((key) => key + 1);
  }, [total]);

  useEffect(() => {
    if (!playing || total < 2) return undefined;

    const epoch = slideEpochRef.current;
    const started = Date.now();
    const wait = remainingRef.current;

    const timer = window.setTimeout(() => {
      if (slideEpochRef.current !== epoch) return;
      // Bump epoch before setState so effect cleanup does not shrink the next duration.
      slideEpochRef.current += 1;
      remainingRef.current = DURATION_MS;
      setIndex((currentIndex) => (currentIndex + 1) % total);
      setProgressKey((key) => key + 1);
    }, wait);

    return () => {
      window.clearTimeout(timer);
      // Only shrink remaining when pausing the same slide — not when advancing.
      if (slideEpochRef.current === epoch) {
        remainingRef.current = Math.max(250, wait - (Date.now() - started));
      }
    };
  }, [playing, index, total]);

  if (!current) return null;

  return (
    <section className="asas-hero-slider" aria-roledescription="carousel" aria-label={ar ? 'مشاريع مختارة' : 'Featured projects'}>
      <div className="asas-hero-media" aria-hidden="true">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`asas-hero-slide${i === index ? ' is-active' : ''}`}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              style={{objectPosition: slide.crop || '50% 50%'}}
            />
          </div>
        ))}
      </div>

      <div className="asas-hero-veil" aria-hidden="true" />

      <div className="asas-hero-panel">
        <div key={`${current.id}-${progressKey}`} className="asas-hero-copy">
          <p className="asas-hero-location">{ar ? current.locationAr : current.location}</p>
          <h1>{ar ? current.titleAr : current.title}</h1>
          {current.note && <p className="asas-hero-note">{ar ? current.noteAr : current.note}</p>}
          <dl className="asas-hero-facts">
            {(ar ? current.factsAr : current.facts).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="asas-hero-actions">
            <Link className="asas-hero-ghost" href={`/${locale}/projects/${current.slug}`}>
              {ar ? 'اعرف المزيد' : 'Learn More'}
            </Link>
            <Link className="asas-hero-solid" href={`/${locale}/projects`}>
              {ar ? 'استكشف مشاريعنا' : 'Discover Our Projects'}
            </Link>
          </div>
        </div>

        <div className="asas-hero-controls">
          <div className="asas-hero-progress" role="tablist" aria-label={ar ? 'شرائح المشروع' : 'Project slides'}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${ar ? 'مشروع' : 'Project'} ${i + 1}`}
                className={i === index ? 'is-active' : ''}
                onClick={() => {
                  goTo(i);
                  setPlaying(true);
                }}
              >
                <span
                  key={i === index ? `fill-${progressKey}` : `idle-${i}`}
                  className="asas-hero-progress-fill"
                  style={
                    i === index
                      ? {
                          animationDuration: `${DURATION_MS}ms`,
                          animationPlayState: playing ? 'running' : 'paused',
                        }
                      : undefined
                  }
                />
              </button>
            ))}
          </div>

          <div className="asas-hero-nav">
            <button
              type="button"
              className="asas-hero-nav-btn"
              aria-label={playing ? (ar ? 'إيقاف' : 'Pause') : (ar ? 'تشغيل' : 'Play')}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              className="asas-hero-nav-btn"
              aria-label={ar ? 'السابق' : 'Previous'}
              onClick={() => goTo(index - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="asas-hero-nav-btn"
              aria-label={ar ? 'التالي' : 'Next'}
              onClick={() => goTo(index + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
