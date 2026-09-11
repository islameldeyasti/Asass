'use client';

import {motion} from 'motion/react';
import RevealImage from '@/components/gallery/RevealImage';
import {pad} from '@/lib/gallery/catalog';

const EASE = [0.19, 1, 0.22, 1];

function TitleReveal({children, reduceMotion, className = ''}) {
  if (reduceMotion) return <h3 className={className}>{children}</h3>;
  return (
    <h3 className={`ga-mask-title ${className}`}>
      <motion.span
        initial={{y: '110%'}}
        whileInView={{y: '0%'}}
        viewport={{once: true, amount: 0.5}}
        transition={{duration: 0.9, ease: EASE}}
      >
        {children}
      </motion.span>
    </h3>
  );
}

function Meta({entry, index, ar, reduceMotion}) {
  return (
    <motion.div
      className="ga-story-meta"
      initial={reduceMotion ? false : {opacity: 0, y: 24}}
      whileInView={reduceMotion ? undefined : {opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.35}}
      transition={{duration: 0.7, ease: EASE}}
    >
      <p className="ga-num">{pad(index + 1)}</p>
      <TitleReveal reduceMotion={reduceMotion}>{entry.meta.label}</TitleReveal>
      <dl>
        <div>
          <dt>{ar ? 'التصنيف' : 'Category'}</dt>
          <dd>{entry.meta.disciplineLabel}</dd>
        </div>
        <div>
          <dt>{ar ? 'الموقع' : 'Location'}</dt>
          <dd>{entry.meta.location}</dd>
        </div>
      </dl>
    </motion.div>
  );
}

export default function ProjectExhibition({items, ar, reduceMotion, onOpen, bindCursor}) {
  if (!items?.length) return null;

  return (
    <section className="ga-stories" aria-label={ar ? 'قصص المشاريع' : 'Project stories'}>
      {items.map((entry, index) => {
        const {layout, primary, secondary} = entry;
        const openP = () => onOpen(primary.id);
        const openS = secondary ? () => onOpen(secondary.id) : undefined;

        if (layout === 'vertical-meta') {
          return (
            <article key={entry.id} className="ga-story ga-story--01">
              <div className="ga-wide ga-story-01">
                <RevealImage
                  className="ga-story-01-tall"
                  src={primary.src}
                  alt={primary.label}
                  sizes="(max-width:900px) 100vw, 55vw"
                  reduceMotion={reduceMotion}
                  onOpen={openP}
                  {...(bindCursor || {})}
                />
                <div className="ga-story-01-side">
                  <Meta entry={entry} index={index} ar={ar} reduceMotion={reduceMotion} />
                  {secondary ? (
                    <RevealImage
                      className="ga-story-01-small"
                      src={secondary.src}
                      alt={secondary.label}
                      sizes="36vw"
                      reduceMotion={reduceMotion}
                      onOpen={openS}
                      {...(bindCursor || {})}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        }

        if (layout === 'edge-landscape') {
          return (
            <article key={entry.id} className="ga-story ga-story--02">
              <div className="ga-bleed">
                <p className="ga-story-float-num" aria-hidden="true">
                  {pad(index + 1)}
                </p>
                <RevealImage
                  className="ga-story-02-shot"
                  src={primary.src}
                  alt={primary.label}
                  sizes="96vw"
                  reduceMotion={reduceMotion}
                  parallax
                  onOpen={openP}
                  {...(bindCursor || {})}
                />
              </div>
              <div className="ga-shell ga-story-02-cap">
                <TitleReveal reduceMotion={reduceMotion}>{primary.label}</TitleReveal>
                <p className="ga-meta-inline">
                  {primary.disciplineLabel}
                  <span>·</span>
                  {primary.location}
                </p>
              </div>
            </article>
          );
        }

        if (layout === 'split-levels') {
          return (
            <article key={entry.id} className="ga-story ga-story--03">
              <div className="ga-wide ga-story-03">
                <RevealImage
                  className="ga-story-03-left"
                  src={secondary?.src || primary.src}
                  alt={secondary?.label || primary.label}
                  sizes="30vw"
                  reduceMotion={reduceMotion}
                  onOpen={secondary ? openS : openP}
                  {...(bindCursor || {})}
                />
                <div className="ga-story-03-right">
                  <Meta entry={entry} index={index} ar={ar} reduceMotion={reduceMotion} />
                  <RevealImage
                    className="ga-story-03-big"
                    src={primary.src}
                    alt={primary.label}
                    sizes="60vw"
                    reduceMotion={reduceMotion}
                    onOpen={openP}
                    {...(bindCursor || {})}
                  />
                </div>
              </div>
            </article>
          );
        }

        return (
          <article key={entry.id} className="ga-story ga-story--04">
            <div className="ga-story-04">
              <div className="ga-shell ga-story-04-copy">
                <p className="ga-num light">{pad(index + 1)}</p>
                <TitleReveal reduceMotion={reduceMotion} className="light">
                  {ar ? 'هندسة' : 'Engineering'}
                </TitleReveal>
                <TitleReveal reduceMotion={reduceMotion} className="light">
                  {ar ? 'في حركة' : 'In Motion'}
                </TitleReveal>
                <p className="ga-story-04-sub">{primary.label}</p>
              </div>
              <div className="ga-story-04-media">
                <RevealImage
                  className="ga-story-04-shot"
                  src={primary.src}
                  alt={primary.label}
                  sizes="60vw"
                  reduceMotion={reduceMotion}
                  parallax
                  onOpen={openP}
                  {...(bindCursor || {})}
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
