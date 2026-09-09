'use client';

import Image from 'next/image';
import {useCallback, useEffect, useRef, useState} from 'react';
import {NextChevron, PrevChevron} from '@/components/icons/DirectionalChevrons';

/**
 * Resolve project media list with backward compatibility.
 * Prefer project.images, then gallery / imageAsset / visual / image.
 */
export function resolveProjectImages(project) {
  const seen = new Set();
  const items = [];
  const push = (src, crop = '50% 40%', photo = true) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    items.push({src, crop, photo: Boolean(photo)});
  };

  if (Array.isArray(project?.images) && project.images.length) {
    project.images.forEach((entry) => {
      if (typeof entry === 'string') push(entry);
      else if (entry?.src) push(entry.src, entry.crop || '50% 40%', entry.photo !== false);
    });
    return items;
  }

  const asset = project?.imageAsset;
  push(asset?.portfolio, '50% 40%', true);
  push(asset?.card, '50% 50%', true);
  push(asset?.mobile, '50% 45%', true);
  push(project?.visual?.src, project?.visual?.crop || '50% 40%', project?.visual?.classification === 'PROJECT_PHOTO');
  (project?.gallery || []).forEach((src) => push(src, '50% 45%', true));
  push(project?.image, '50% 50%', true);
  return items;
}

/**
 * Compact project media frame.
 * 1 image → static. 2+ → one-at-a-time slider with count + optional thumbs.
 */
export default function ProjectGallery({
  images = [],
  title = '',
  ar = false,
  priority = false,
  sizes = '(max-width: 900px) 100vw, 54vw',
  onExpand,
}) {
  const items = images.filter((item) => item?.src);
  const multi = items.length > 1;
  const [index, setIndex] = useState(0);
  const touchRef = useRef({x: 0, y: 0});
  const frameRef = useRef(null);

  const go = useCallback(
    (dir) => {
      if (!multi) return;
      setIndex((current) => {
        const next = (current + dir + items.length) % items.length;
        return next;
      });
    },
    [items.length, multi],
  );

  useEffect(() => {
    setIndex(0);
  }, [items.length, items[0]?.src]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || !multi) return undefined;

    const onKey = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(ar ? 1 : -1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(ar ? -1 : 1);
      }
    };

    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [ar, go, multi]);

  if (!items.length) return null;

  const current = items[Math.min(index, items.length - 1)];
  const count = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;

  const onTouchStart = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    touchRef.current = {x: touch.clientX, y: touch.clientY};
  };

  const onTouchEnd = (event) => {
    if (!multi) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - touchRef.current.x;
    const dy = touch.clientY - touchRef.current.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx > 0 ? (ar ? 1 : -1) : ar ? -1 : 1);
  };

  return (
    <div className={`pf-gallery${multi ? ' is-multi' : ''}`}>
      <div
        ref={frameRef}
        className="pf-gallery-frame"
        tabIndex={multi ? 0 : undefined}
        role={multi ? 'group' : undefined}
        aria-roledescription={multi ? 'carousel' : undefined}
        aria-label={title || (ar ? 'معرض المشروع' : 'Project gallery')}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className="pf-gallery-stage"
          onClick={() => onExpand?.(index)}
          aria-label={ar ? 'فتح المعرض' : 'Open gallery'}
        >
          <Image
            key={current.src}
            src={current.src}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            style={{objectPosition: current.crop || '50% 40%'}}
            className="pf-gallery-img"
          />
          <span className="pf-gallery-shade" aria-hidden="true" />
        </button>

        {multi && (
          <>
            <div className="pf-gallery-chrome">
              <span className="pf-gallery-count">{count}</span>
              <div className="pf-gallery-controls">
                <button
                  type="button"
                  className="pf-gallery-nav"
                  aria-label={ar ? 'السابق' : 'Previous image'}
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                >
                  <PrevChevron ar={ar} size={16} />
                </button>
                <button
                  type="button"
                  className="pf-gallery-nav"
                  aria-label={ar ? 'التالي' : 'Next image'}
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                >
                  <NextChevron ar={ar} size={16} />
                </button>
              </div>
            </div>
            <div className="pf-gallery-dots" aria-hidden="true">
              {items.map((item, i) => (
                <button
                  key={`${item.src}-dot`}
                  type="button"
                  className={`pf-gallery-dot${i === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  tabIndex={-1}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {multi && items.length <= 5 && (
        <div className="pf-gallery-thumbs" aria-hidden="true">
          {items.map((item, i) => (
            <button
              key={`${item.src}-thumb`}
              type="button"
              className={`pf-gallery-thumb${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <Image src={item.src} alt="" fill sizes="96px" loading="lazy" style={{objectPosition: item.crop}} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
