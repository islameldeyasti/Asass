'use client';

import {useEffect, useRef, useState} from 'react';
import {useInView, useReducedMotion} from 'motion/react';

const EASE_OUT = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 → value once when entering the viewport.
 * Respects prefers-reduced-motion (shows final value immediately).
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1500,
  className = '',
  suffix = '',
  prefix = '',
}) {
  const target = Math.max(0, Math.round(Number(value) || 0));
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, {once: true, amount: 0.45});
  const [display, setDisplay] = useState(reduced ? target : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      return;
    }
    if (!inView || started.current) return;
    started.current = true;

    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(EASE_OUT(t) * target));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, target, duration]);

  return (
    <span
      ref={ref}
      className={className}
      style={{fontVariantNumeric: 'tabular-nums'}}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
