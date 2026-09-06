'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform} from 'motion/react';
import {ArrowRight, ChevronLeft, ChevronRight, Play} from 'lucide-react';

const DURATION_MS = 8500;
const EASE = [0.16, 1, 0.3, 1];

function splitTitle(title) {
  if (!title) return [''];
  const presets = [
    [/^Traffic &\s*Access Studies$/i, ['Traffic &', 'Access Studies']],
    [/^Four Towers,\s*Al Nahda$/i, ['Four Towers,', 'Al Nahda']],
    [/^Reception Hall\s*[—-]\s*Private Villa$/i, ['Reception Hall —', 'Private Villa']],
    [/^Compound Villas Portfolio$/i, ['Compound Villas', 'Portfolio']],
    [/^Culture Private School$/i, ['Culture Private', 'School']],
  ];
  for (const [re, lines] of presets) {
    if (re.test(title.trim())) return lines;
  }
  if (title.includes(',')) {
    const [a, ...rest] = title.split(',');
    return [`${a.trim()},`, rest.join(',').trim()].filter(Boolean);
  }
  if (title.includes('&')) {
    const idx = title.indexOf('&');
    return [title.slice(0, idx + 1).trim(), title.slice(idx + 1).trim()].filter(Boolean);
  }
  if (title.includes('—')) {
    const [a, ...rest] = title.split('—');
    return [a.trim(), rest.join('—').trim()].filter(Boolean);
  }
  const words = title.split(' ');
  if (words.length > 3) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  return [title];
}

function BlueprintOverlay({ar, reduced}) {
  return (
    <motion.div
      className="asas-ph-blueprint"
      aria-hidden="true"
      initial={reduced ? false : {opacity: 0}}
      animate={{opacity: 1}}
      exit={reduced ? undefined : {opacity: 0}}
      transition={{duration: reduced ? 0.2 : 0.35, ease: EASE}}
    >
      <svg className="asas-ph-grid" viewBox="0 0 420 780" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="asasPhGridFine" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="420" height="780" fill="url(#asasPhGridFine)" opacity="0.55" />

        {/* Corner brackets */}
        <g stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" fill="none">
          <path d="M24 28 H62 M24 28 V66" />
          <path d="M396 28 H358 M396 28 V66" />
          <path d="M24 752 H62 M24 752 V714" />
          <path d="M396 752 H358 M396 752 V714" />
        </g>

        <g className={reduced ? '' : 'asas-ph-draw-group'}>
          <path d="M56 48 V730" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M56 48 H108" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M56 730 H108" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M368 86 V668" fill="none" stroke="rgba(229,80,33,0.48)" strokeWidth="1.15" />
          <path d="M318 86 H368" fill="none" stroke="rgba(229,80,33,0.48)" strokeWidth="1.15" />
          <path d="M318 668 H368" fill="none" stroke="rgba(229,80,33,0.48)" strokeWidth="1.15" />
          <path d="M78 168 H340" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M96 312 H312" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
          <path d="M110 448 H300" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <path d="M124 580 H286" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <path d="M200 168 V580" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="56" cy="168" r="3.2" fill="#e55021" />
          <circle cx="368" cy="312" r="2.8" fill="#fff" />
          <circle cx="200" cy="448" r="2.4" fill="rgba(255,255,255,0.8)" />
          <circle cx="286" cy="580" r="2.2" fill="rgba(255,255,255,0.55)" />
          <text x="66" y="162" fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="Segoe UI, Arial, sans-serif">
            12.4 m
          </text>
          <text x="66" y="306" fill="rgba(255,255,255,0.38)" fontSize="9" fontFamily="Segoe UI, Arial, sans-serif">
            8.2 m
          </text>
          <text
            x="378"
            y="240"
            fill="rgba(255,255,255,0.38)"
            fontSize="9"
            fontFamily="Segoe UI, Arial, sans-serif"
            transform="rotate(90 378 240)"
          >
            {ar ? 'محور' : 'AXIS A'}
          </text>
        </g>
      </svg>
      <p className="asas-ph-vertical-copy">
        {ar ? (
          <>
            تخطيط
            <br />
            تصميم
            <br />
            هندسة
            <br />
            مستقبل أفضل
          </>
        ) : (
          <>
            Planning
            <br />
            Design
            <br />
            Engineering
            <br />
            A Better
            <br />
            Tomorrow
          </>
        )}
      </p>
    </motion.div>
  );
}

export default function HeroSlider({locale, slides}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const remainingRef = useRef(DURATION_MS);
  const slideEpochRef = useRef(0);
  const rootRef = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({x: 0, y: 0});
  const total = slides.length;
  const current = slides[index];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, {stiffness: 48, damping: 24, mass: 0.45});
  const sy = useSpring(my, {stiffness: 48, damping: 24, mass: 0.45});
  const mediaX = useTransform(sx, [-0.5, 0.5], reduced ? [0, 0] : [5, -5]);
  const mediaY = useTransform(sy, [-0.5, 0.5], reduced ? [0, 0] : [5, -5]);
  const blueX = useTransform(sx, [-0.5, 0.5], reduced ? [0, 0] : [10, -10]);
  const blueY = useTransform(sy, [-0.5, 0.5], reduced ? [0, 0] : [10, -10]);
  const copyX = useTransform(sx, [-0.5, 0.5], reduced ? [0, 0] : [2, -2]);
  const copyY = useTransform(sy, [-0.5, 0.5], reduced ? [0, 0] : [2, -2]);

  const goTo = useCallback(
    (next) => {
      slideEpochRef.current += 1;
      remainingRef.current = DURATION_MS;
      setIndex((next + total) % total);
      setProgressKey((key) => key + 1);
    },
    [total],
  );

  useEffect(() => {
    if (!playing || total < 2 || reduced) return undefined;
    const epoch = slideEpochRef.current;
    const started = Date.now();
    const wait = remainingRef.current;
    const timer = window.setTimeout(() => {
      if (slideEpochRef.current !== epoch) return;
      slideEpochRef.current += 1;
      remainingRef.current = DURATION_MS;
      setIndex((currentIndex) => (currentIndex + 1) % total);
      setProgressKey((key) => key + 1);
    }, wait);
    return () => {
      window.clearTimeout(timer);
      if (slideEpochRef.current === epoch) {
        remainingRef.current = Math.max(250, wait - (Date.now() - started));
      }
    };
  }, [playing, index, total, reduced]);

  useEffect(() => {
    if (reduced) return undefined;
    const tick = () => {
      mx.set(targetRef.current.x);
      my.set(targetRef.current.y);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [mx, my, reduced]);

  const onPointerMove = (event) => {
    if (reduced) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    targetRef.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  };

  const titleLines = useMemo(
    () => splitTitle(ar ? current?.titleAr : current?.title),
    [ar, current],
  );
  const facts = ar ? current?.factsAr : current?.facts;

  if (!current) return null;

  return (
    <section
      ref={rootRef}
      className="asas-ph"
      aria-roledescription="carousel"
      aria-label={ar ? 'مشاريع مختارة' : 'Featured projects'}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        targetRef.current = {x: 0, y: 0};
        mx.set(0);
        my.set(0);
      }}
    >
      <div className="asas-ph-media" aria-hidden="true">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <motion.div
              key={slide.id}
              className={`asas-ph-slide${active ? ' is-active' : ''}`}
              initial={false}
              animate={{
                opacity: active ? 1 : 0,
                scale: active ? 1 : 1.025,
                zIndex: active ? 1 : 0,
              }}
              transition={{
                opacity: {duration: reduced ? 0.2 : active ? 1.1 : 0.7, ease: EASE},
                scale: {duration: reduced ? 0.2 : active ? 1.1 : 0.7, ease: EASE},
              }}
              style={active ? {x: mediaX, y: mediaY} : undefined}
            >
              <motion.div
                className="asas-ph-slide-inner"
                initial={false}
                animate={
                  active && !reduced
                    ? {scale: [1.055, 1, 1.018]}
                    : {scale: 1.025}
                }
                transition={
                  active && !reduced
                    ? {duration: 14, times: [0, 0.08, 1], ease: 'linear'}
                    : {duration: 0.7}
                }
              >
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  style={{objectPosition: slide.crop || '55% 40%'}}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="asas-ph-veil" aria-hidden="true" />

      <motion.div className="asas-ph-blueprint-wrap" style={{x: blueX, y: blueY}}>
        <AnimatePresence mode="wait">
          <BlueprintOverlay key={current.id} ar={ar} reduced={reduced} />
        </AnimatePresence>
      </motion.div>

      <div className="asas-ph-shell">
        <motion.div className="asas-ph-copy" style={{x: copyX, y: copyY}}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${progressKey}`}
              className="asas-ph-copy-inner"
              initial={false}
              exit={reduced ? undefined : {opacity: 0, transition: {duration: 0.25}}}
            >
              <motion.p
                className="asas-ph-eyebrow"
                initial={reduced ? false : {opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.12, duration: 0.55, ease: EASE}}
              >
                <i />
                {ar ? 'مشروع مميز' : 'Featured project'}
              </motion.p>

              <motion.p
                className="asas-ph-location"
                initial={reduced ? false : {opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2, duration: 0.55, ease: EASE}}
              >
                {ar ? current.locationAr : current.location}
              </motion.p>

              <h1 className="asas-ph-title">
                {titleLines.map((line, i) => (
                  <span key={`${line}-${i}`} className="asas-ph-title-line">
                    <motion.span
                      className="asas-ph-title-mask"
                      initial={reduced ? false : {opacity: 0, y: '110%'}}
                      animate={{opacity: 1, y: '0%'}}
                      transition={{delay: 0.28 + i * 0.1, duration: 0.7, ease: EASE}}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              {current.note && (
                <motion.p
                  className="asas-ph-note"
                  initial={reduced ? false : {opacity: 0, y: 24}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.5, duration: 0.55, ease: EASE}}
                >
                  {ar ? current.noteAr : current.note}
                </motion.p>
              )}

              <dl className="asas-ph-facts">
                {facts.map(([label, value], i) => (
                  <motion.div
                    key={`${label}-${value}`}
                    initial={reduced ? false : {opacity: 0, y: 24}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.6 + i * 0.07, duration: 0.5, ease: EASE}}
                  >
                    <dd>{value}</dd>
                    <dt>{label}</dt>
                  </motion.div>
                ))}
              </dl>

              <motion.div
                className="asas-ph-actions"
                initial={reduced ? false : {opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.82, duration: 0.5, ease: EASE}}
              >
                <Link className="asas-ph-btn-primary" href={`/${locale}/projects/${current.slug}`}>
                  {ar ? 'عرض المشروع' : 'View Project'}
                  <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />
                </Link>
                <Link className="asas-ph-film" href={`/${locale}/projects/${current.slug}`}>
                  <span className="asas-ph-film-play" aria-hidden="true">
                    <Play size={14} fill="currentColor" />
                  </span>
                  <span className="asas-ph-film-copy">
                    <strong>{ar ? 'عرض المشروع' : 'Watch Overview'}</strong>
                    <small>{ar ? 'تفاصيل المشروع' : 'Project brief'}</small>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.a
        href="#work"
        className="asas-ph-scroll"
        initial={reduced ? false : {opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 1.05, duration: 0.5}}
      >
        <span className="asas-ph-scroll-line" aria-hidden="true" />
        {ar ? 'مرّر للاستكشاف' : 'Scroll to explore'}
      </motion.a>

      <motion.div
        className="asas-ph-rail"
        initial={reduced ? false : {opacity: 0, x: 16}}
        animate={{opacity: 1, x: 0}}
        transition={{delay: 1.1, duration: 0.55, ease: EASE}}
      >
        <div className="asas-ph-controls">
          <div className="asas-ph-control-btns">
            <button
              type="button"
              className="asas-ph-icon-btn"
              aria-label={ar ? 'السابق' : 'Previous'}
              onClick={() => goTo(index - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="asas-ph-icon-btn is-next"
              aria-label={ar ? 'التالي' : 'Next'}
              onClick={() => goTo(index + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="asas-ph-progress-row">
            <span
              key={`line-${progressKey}`}
              className="asas-ph-progress-line"
              style={{
                animationDuration: `${DURATION_MS}ms`,
                animationPlayState: playing && !reduced ? 'running' : 'paused',
              }}
            />
            <span className="asas-ph-count">
              {String(index + 1).padStart(2, '0')}
              <i>/</i>
              {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="asas-ph-strip"
        initial={reduced ? false : {opacity: 0, y: 28}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 1, duration: 0.7, ease: EASE}}
      >
        <div className="asas-ph-strip-track" role="tablist" aria-label={ar ? 'شرائح المشروع' : 'Project slides'}>
          {slides.map((slide, i) => {
            const active = i === index;
            const label = ar ? slide.stripAr || slide.titleAr : slide.strip || slide.title;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`asas-ph-thumb${active ? ' is-active' : ''}`}
                onClick={() => {
                  goTo(i);
                  setPlaying(true);
                }}
              >
                <span className="asas-ph-thumb-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="asas-ph-thumb-copy">
                  <strong>{label}</strong>
                  <small>
                    {(ar ? slide.locationAr : slide.location || '').split(',')[0].trim()}
                  </small>
                </span>
                <span className="asas-ph-thumb-media">
                  <Image src={slide.image} alt="" width={96} height={58} sizes="96px" />
                </span>
                {active && <span className="asas-ph-thumb-line" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
