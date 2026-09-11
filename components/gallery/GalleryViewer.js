'use client';

import Image from 'next/image';
import {useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowLeft, ArrowRight, X} from 'lucide-react';
import {pad} from '@/lib/gallery/journal';

const EASE = [0.19, 1, 0.22, 1];

export default function GalleryViewer({items, active, ar, reduceMotion, onClose, onShift}) {
  const closeRef = useRef(null);
  const touch = useRef({x: 0, y: 0});
  const current = active != null ? items[active] : null;
  const [native, setNative] = useState(null);

  const neighbors = useMemo(() => {
    if (active == null || !items.length) return [];
    return [
      items[(active - 1 + items.length) % items.length]?.src,
      items[(active + 1) % items.length]?.src,
    ].filter(Boolean);
  }, [active, items]);

  useEffect(() => {
    neighbors.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [neighbors]);

  useEffect(() => {
    if (!current?.src) return undefined;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setNative({w: img.naturalWidth || 0, h: img.naturalHeight || 0});
    };
    img.src = current.src;
    return () => {
      cancelled = true;
    };
  }, [current?.id, current?.src]);

  useEffect(() => {
    if (!current) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onShift(ar ? -1 : 1);
      if (event.key === 'ArrowLeft') onShift(ar ? 1 : -1);
    };
    document.body.classList.add('asas-gallery-lock');
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.classList.remove('asas-gallery-lock');
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [current, onClose, onShift, ar]);

  const maxW = native?.w ? Math.min(native.w, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1200) : undefined;

  return (
    <AnimatePresence>
      {current ? (
        <motion.div
          className="gj-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
        >
          <button type="button" className="gj-viewer-close" ref={closeRef} onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'}>
            <X size={22} />
          </button>
          <button type="button" className="gj-viewer-nav is-prev" onClick={() => onShift(-1)} aria-label={ar ? 'السابق' : 'Previous'}>
            {ar ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <button type="button" className="gj-viewer-nav is-next" onClick={() => onShift(1)} aria-label={ar ? 'التالي' : 'Next'}>
            {ar ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </button>

          <div
            className="gj-viewer-body"
            onTouchStart={(e) => {
              const t = e.changedTouches[0];
              touch.current = {x: t.clientX, y: t.clientY};
            }}
            onTouchEnd={(e) => {
              const t = e.changedTouches[0];
              const dx = t.clientX - touch.current.x;
              const dy = t.clientY - touch.current.y;
              if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
              onShift(ar ? (dx < 0 ? -1 : 1) : dx < 0 ? 1 : -1);
            }}
          >
            <div className="gj-viewer-stage">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="gj-viewer-frame"
                  style={
                    native
                      ? {
                          maxWidth: `min(90vw, ${native.w}px)`,
                          width: 'auto',
                        }
                      : undefined
                  }
                  initial={reduceMotion ? {opacity: 0} : {opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  exit={reduceMotion ? {opacity: 0} : {opacity: 0}}
                  transition={{duration: 0.45, ease: EASE}}
                >
                  <Image
                    src={current.src}
                    alt={current.label}
                    width={native?.w || 1600}
                    height={native?.h || 900}
                    sizes={maxW ? `${Math.round(maxW)}px` : '90vw'}
                    priority
                    className="gj-viewer-img"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: native?.w ? `min(90vw, ${native.w}px)` : '90vw',
                      maxHeight: '82vh',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="gj-viewer-bar">
              <p className="gj-count">
                {pad(active + 1)} <span>/ {pad(items.length)}</span>
              </p>
              <div>
                <p className="gj-viewer-cat">
                  {current.category === 'interior'
                    ? ar
                      ? 'تصميم داخلي'
                      : 'Interiors'
                    : ar
                      ? 'عمارة'
                      : 'Architecture'}
                </p>
                <h2>{current.label}</h2>
                {current.location ? <p className="gj-viewer-loc">{current.location}</p> : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
