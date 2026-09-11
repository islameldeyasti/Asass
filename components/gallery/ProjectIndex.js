'use client';

import Image from 'next/image';
import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {GALLERY_FILTERS, pad} from '@/lib/gallery/catalog';

const EASE = [0.19, 1, 0.22, 1];

export default function ProjectIndex({items, ar, reduceMotion, finePointer, onOpen}) {
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);

  const rows = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.discipline === filter);
  }, [items, filter]);

  return (
    <section className="ga-index">
      <div className="ga-shell">
        <div className="ga-index-head">
          <h2>{ar ? 'فهرس المشاريع' : 'Project Index'}</h2>
          <div className="ga-filters" role="tablist" aria-label={ar ? 'تصفية' : 'Filter'}>
            {GALLERY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`ga-tab${filter === f.id ? ' is-on' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {ar ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>

        <ul className="ga-index-list">
          {rows.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className="ga-index-row"
                onClick={() => onOpen(item.id)}
                onMouseEnter={() => {
                  if (!finePointer || reduceMotion) return;
                  setPreview({src: item.src, id: item.id});
                }}
                onMouseLeave={() => setPreview(null)}
              >
                <span className="ga-index-num">{pad(i + 1)}</span>
                <span className="ga-index-name">{item.label}</span>
                <span className="ga-index-cat">{item.disciplineLabel}</span>
                <span className="ga-index-loc">{item.location}</span>
                <span className="ga-index-go" aria-hidden="true">
                  <ArrowUpRight size={18} className={ar ? 'reverse-arrow' : ''} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ga-index-preview-slot" aria-hidden="true">
        <AnimatePresence mode="wait">
          {preview && finePointer && !reduceMotion ? (
            <motion.div
              key={preview.id}
              className="ga-index-preview"
              initial={{opacity: 0, scale: 0.94}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.96}}
              transition={{duration: 0.35, ease: EASE}}
            >
              <Image src={preview.src} alt="" fill sizes="420px" className="ga-shot-img" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
