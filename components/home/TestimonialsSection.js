'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Quote, Star} from 'lucide-react';
import {testimonials, testimonialsCopy} from '@/data/testimonials';
import {NextChevron, PrevChevron} from '@/components/icons/DirectionalChevrons';

export default function TestimonialsSection({locale}) {
  const ar = locale === 'ar';
  const copy = testimonialsCopy[ar ? 'ar' : 'en'];
  const viewportRef = useRef(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  const updateIndex = useCallback((next) => {
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  const scrollToIndex = useCallback((nextIndex) => {
    const el = viewportRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll('.asas-t-card')];
    if (!cards.length) return;

    const clamped = ((nextIndex % cards.length) + cards.length) % cards.length;
    const card = cards[clamped];
    const vpRect = el.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const left = el.scrollLeft + (cardRect.left - vpRect.left);

    el.scrollTo({
      left: Math.max(0, left),
      behavior: reduced ? 'auto' : 'smooth',
    });
    updateIndex(clamped);
  }, [reduced, updateIndex]);

  const step = useCallback((dir) => {
    // Track scrollLeft is LTR; with dir=rtl the control row mirrors so
    // ChevronLeft stays "previous" and ChevronRight stays "next".
    scrollToIndex(indexRef.current + dir);
  }, [scrollToIndex]);

  useEffect(() => {
    if (reduced || paused) return undefined;
    const id = window.setInterval(() => {
      step(1);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused, reduced, step]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cards = [...el.querySelectorAll('.asas-t-card')];
        if (!cards.length) {
          ticking = false;
          return;
        }
        const vpRect = el.getBoundingClientRect();
        const target = vpRect.left + 12;
        let best = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.getBoundingClientRect().left - target);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        updateIndex(best);
        ticking = false;
      });
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateIndex]);

  return (
    <section className="asas-t" aria-labelledby="asas-testimonials-title">
      <div className="home-shell asas-t-shell">
        <div className="asas-t-head">
          <p className="atlas-kicker">{copy.eyebrow}</p>
          <h2 id="asas-testimonials-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>

        <div
          className="asas-t-rail"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
          }}
        >
          <div className="asas-t-controls">
            <button
              type="button"
              className="asas-t-nav"
              aria-label={ar ? 'السابق' : 'Previous'}
              onClick={() => step(-1)}
            >
              <PrevChevron ar={ar} size={18} />
            </button>
            <button
              type="button"
              className="asas-t-nav"
              aria-label={ar ? 'التالي' : 'Next'}
              onClick={() => step(1)}
            >
              <NextChevron ar={ar} size={18} />
            </button>
          </div>

          <div
            ref={viewportRef}
            className="asas-t-viewport"
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={ar ? 'آراء العملاء' : 'Client testimonials'}
          >
            <ul className="asas-t-track">
              {testimonials.map((item, i) => (
                <li
                  key={item.id}
                  className={`asas-t-card${i === index ? ' is-active' : ''}`}
                >
                  <div className="asas-t-body">
                    <div className="asas-t-card-top">
                      <Quote size={22} aria-hidden="true" />
                      <span className="asas-t-sector">{ar ? item.sectorAr : item.sector}</span>
                    </div>
                    <div className="asas-t-stars" aria-label={ar ? `${item.rating} من 5` : `${item.rating} out of 5`}>
                      {Array.from({length: item.rating || 5}).map((_, star) => (
                        <Star key={star} size={13} fill="currentColor" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote>{ar ? item.quoteAr : item.quote}</blockquote>
                  </div>
                  <div className="asas-t-person">
                    <span className="asas-t-avatar" aria-hidden="true">
                      {(ar ? item.companyAr : item.company).slice(0, 1)}
                    </span>
                    <span className="asas-t-meta">
                      <strong>{ar ? item.roleAr : item.role}</strong>
                      <em>{ar ? item.companyAr : item.company}</em>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
