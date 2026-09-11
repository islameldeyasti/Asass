'use client';

import Image from 'next/image';
import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'motion/react';
import {useInViewOnce} from '@/lib/gallery/hooks';

export default function RevealImage({
  src,
  alt,
  sizes,
  priority = false,
  reduceMotion,
  parallax = false,
  featured = false,
  className = '',
  onOpen,
  onPointerEnter,
  onPointerLeave,
}) {
  const revealRef = useInViewOnce(reduceMotion);
  const mediaRef = useRef(null);
  const {scrollYProgress} = useScroll({
    target: mediaRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || !parallax ? [0, 0] : ['-2.5%', '2.5%'],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || !parallax ? [1, 1] : featured ? [1.12, 1] : [1.08, 1],
  );

  const Tag = onOpen ? 'button' : 'div';

  return (
    <Tag
      type={onOpen ? 'button' : undefined}
      className={`ga-shot${featured ? ' ga-shot--featured' : ''} ${className}`}
      ref={revealRef}
      onClick={onOpen}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      aria-label={onOpen ? alt : undefined}
    >
      <motion.span className="ga-shot-media" ref={mediaRef} style={{y, scale}}>
        <span className="ga-shot-bg" style={{backgroundImage: `url(${src})`}} aria-hidden="true" />
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="ga-shot-img"
        />
      </motion.span>
    </Tag>
  );
}
