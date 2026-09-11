'use client';

import {useEffect, useRef, useState} from 'react';

export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return fine;
}

export function useInViewOnce(reduceMotion) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const show = () => el.classList.add('is-in');
    if (reduceMotion) {
      show();
      return undefined;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 40) {
      const id = requestAnimationFrame(show);
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
        io.disconnect();
      },
      {threshold: 0.12, rootMargin: '0px 0px -6% 0px'},
    );
    io.observe(el);
    const failsafe = window.setTimeout(show, 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [reduceMotion]);
  return ref;
}
