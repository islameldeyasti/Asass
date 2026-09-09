'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useMemo, useRef} from 'react';
import {motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform} from 'motion/react';
import {ArrowRight} from 'lucide-react';
import {ActionButton} from '@/components/ActionButton';

const EASE = [0.16, 1, 0.3, 1];

/** Reference layout order: featured towers, side infrastructure, then four equals */
const LAYOUT_KEYS = [
  'towers-high-rise',
  'infrastructure-urban-planning',
  'commercial-residential-buildings',
  'education',
  'villas-compounds-palaces',
  'interior-hospitality-retail',
];

function TechOverlay({x, y}) {
  return (
    <motion.div className="asas-sec-tech" aria-hidden="true" style={{x, y}}>
      <svg viewBox="0 0 720 520" preserveAspectRatio="xMaxYMid slice">
        <g fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1">
          <path d="M420 40 V460" />
          <path d="M460 70 V430" />
          <path d="M500 100 H680" />
          <path d="M500 180 H660" />
          <path d="M500 260 H640" />
          <path d="M540 100 V260" />
          <circle cx="500" cy="100" r="3" fill="#a02315" stroke="none" />
          <circle cx="540" cy="180" r="2.5" fill="#fff" stroke="none" />
          <path d="M620 320 L640 340 M640 320 L620 340" />
        </g>
        <text
          x="690"
          y="140"
          fill="rgba(255,255,255,0.32)"
          fontSize="11"
          fontFamily="Segoe UI, Arial, sans-serif"
          letterSpacing="3"
          transform="rotate(90 690 140)"
        >
          DESIGN
        </text>
        <text
          x="690"
          y="260"
          fill="rgba(255,255,255,0.28)"
          fontSize="11"
          fontFamily="Segoe UI, Arial, sans-serif"
          letterSpacing="3"
          transform="rotate(90 690 260)"
        >
          ENGINEERING
        </text>
        <text
          x="690"
          y="400"
          fill="rgba(255,255,255,0.22)"
          fontSize="10"
          fontFamily="Segoe UI, Arial, sans-serif"
          letterSpacing="2"
          transform="rotate(90 690 400)"
        >
          DELIVERING VALUE
        </text>
      </svg>
    </motion.div>
  );
}

function SectorCard({
  card,
  displayIndex,
  total,
  locale,
  ar,
  variant,
  exploreLabel,
  delay,
  show,
  reduced,
}) {
  const href = `/${locale}/sectors/${card.key}`;
  const title = ar ? card.titleAr : card.title;
  const copy = ar ? card.copyAr : card.copy;
  const label = ar ? card.labelAr : card.label;
  const num = String(displayIndex).padStart(2, '0');
  const isFeatured = variant === 'featured';
  const isLight = variant === 'light' || card.tone === 'light';
  const cardRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, {stiffness: 55, damping: 22});
  const sy = useSpring(my, {stiffness: 55, damping: 22});
  const techX = useTransform(sx, [-0.5, 0.5], reduced ? [0, 0] : [6, -6]);
  const techY = useTransform(sy, [-0.5, 0.5], reduced ? [0, 0] : [5, -5]);

  return (
    <motion.div
      className={`asas-sec-slot asas-sec-slot--${variant}`}
      initial={
        reduced
          ? false
          : isFeatured
            ? {opacity: 0, clipPath: 'inset(100% 0 0 0)'}
            : {opacity: 0, y: 28}
      }
      animate={
        show
          ? isFeatured
            ? {opacity: 1, clipPath: 'inset(0% 0 0 0)'}
            : {opacity: 1, y: 0}
          : undefined
      }
      transition={{duration: isFeatured ? 0.85 : 0.7, delay, ease: EASE}}
    >
      <Link
        ref={cardRef}
        href={href}
        className={`asas-sec-card asas-sec-card--${variant}${isLight ? ' is-light' : ''}`}
        onPointerMove={
          isFeatured && !reduced
            ? (event) => {
                const el = cardRef.current;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                mx.set((event.clientX - rect.left) / rect.width - 0.5);
                my.set((event.clientY - rect.top) / rect.height - 0.5);
              }
            : undefined
        }
        onPointerLeave={
          isFeatured
            ? () => {
                mx.set(0);
                my.set(0);
              }
            : undefined
        }
      >
        <span className="asas-sec-media" aria-hidden="true">
          <Image
            src={card.image}
            alt={title}
            fill
            sizes={
              isFeatured
                ? '(max-width: 900px) 100vw, 66vw'
                : variant === 'side'
                  ? '(max-width: 900px) 100vw, 34vw'
                  : '(max-width: 900px) 100vw, 25vw'
            }
            className="asas-sec-image"
          />
        </span>
        <span className="asas-sec-veil" aria-hidden="true" />
        {isFeatured && <TechOverlay x={techX} y={techY} />}

        <div className="asas-sec-content">
          <span className="asas-sec-meta">
            <i>{num}</i>
            <b aria-hidden="true" />
            <em>{label}</em>
          </span>
          <h3>{title}</h3>
          <p>{copy}</p>

          {isFeatured ? (
            <span className="asas-sec-ghost">
              {exploreLabel}
              <ArrowRight size={15} className={ar ? 'reverse-arrow' : ''} />
            </span>
          ) : (
            <span className="asas-sec-orb" aria-hidden="true">
              <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />
            </span>
          )}
        </div>

        {isFeatured && (
          <span className="asas-sec-progress" aria-hidden="true">
            {num}
            <i />
            {String(total).padStart(2, '0')}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export default function SectorShowcase({locale, cards, eyebrow, title, copy, cta}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, {once: true, amount: 0.16});
  const show = inView || reduced;

  const ordered = useMemo(() => {
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]));
    return LAYOUT_KEYS.map((key) => byKey[key]).filter(Boolean);
  }, [cards]);

  const featured = ordered[0];
  const side = ordered[1];
  const bottom = ordered.slice(2);
  const exploreLabel = ar ? 'استكشف القطاع' : 'Explore Sector';
  const titleText = title.replace(/\.$/, '');

  return (
    <section ref={rootRef} className="asas-sectors" aria-labelledby="asas-sectors-title">
      <div className="asas-sectors-shell home-shell">
        <motion.header
          className="asas-sectors-head"
          initial={reduced ? false : {opacity: 0, y: 22}}
          animate={show ? {opacity: 1, y: 0} : undefined}
          transition={{duration: 0.65, ease: EASE}}
        >
          <div className="asas-sectors-head-main">
            <p className="asas-sectors-eyebrow">
              <i />
              {eyebrow}
            </p>
            <h2 id="asas-sectors-title">
              {titleText}
              <span className="asas-sectors-dot">.</span>
            </h2>
          </div>
          <div className="asas-sectors-head-aside">
            <p>{copy}</p>
            <ActionButton variant="outline" href={`/${locale}/sectors`}>
              {cta}
            </ActionButton>
          </div>
        </motion.header>

        <div className="asas-sectors-mosaic">
          {featured && (
            <SectorCard
              card={featured}
              displayIndex={1}
              total={ordered.length}
              locale={locale}
              ar={ar}
              variant="featured"
              exploreLabel={exploreLabel}
              delay={0.08}
              show={show}
              reduced={reduced}
            />
          )}
          {side && (
            <SectorCard
              card={side}
              displayIndex={2}
              total={ordered.length}
              locale={locale}
              ar={ar}
              variant="side"
              exploreLabel={exploreLabel}
              delay={0.18}
              show={show}
              reduced={reduced}
            />
          )}
          <div className="asas-sectors-quad">
            {bottom.map((card, i) => (
              <SectorCard
                key={card.key}
                card={card}
                displayIndex={i + 3}
                total={ordered.length}
                locale={locale}
                ar={ar}
                variant="quad"
                exploreLabel={exploreLabel}
                delay={0.26 + i * 0.08}
                show={show}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

        <div className="asas-sectors-foot">
          <span>
            <i />
            {ar ? 'نصنع غداً أفضل' : 'Shaping a better tomorrow'}
          </span>
          <span>
            {ar ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'}
            <i />
          </span>
        </div>
      </div>
    </section>
  );
}
