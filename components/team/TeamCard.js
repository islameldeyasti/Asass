'use client';

import Image from 'next/image';
import Link from 'next/link';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {localizeMember} from '@/lib/team/schema';

const EASE = [0.16, 1, 0.3, 1];

function isUsablePortrait(src) {
  if (!src) return false;
  if (/\.svg($|\?)/i.test(src)) return false;
  if (/\/images\/team\/demo-/i.test(src)) return false;
  return true;
}

function initialsFromName(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TeamCard({member, locale, index = 0}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const local = localizeMember(member, locale);
  const href = `/${locale}/team/${member.slug}`;
  const portrait = isUsablePortrait(member.profile_image) ? member.profile_image : '';
  const initials = initialsFromName(local.name);

  return (
    <motion.article
      className={`tm-card${member.leadership ? ' is-leadership' : ''}`}
      initial={reduced ? false : {opacity: 0, y: 22}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.2}}
      transition={{duration: 0.65, delay: Math.min(index * 0.08, 0.32), ease: EASE}}
    >
      <Link href={href} className="tm-card-link">
        <div className="tm-card-media">
          {portrait ? (
            <Image
              src={portrait}
              alt={local.name}
              fill
              sizes="(max-width: 900px) 50vw, 25vw"
              style={{objectPosition: member.profile_image_focal || '50% 28%'}}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="tm-card-fallback" aria-hidden="true">
              <span>{initials}</span>
            </div>
          )}
          <span className="tm-card-shade" />
          <span className="tm-card-rule" aria-hidden="true" />
          <span className="tm-card-cta">
            {ar ? 'عرض الملف' : 'View Profile'}
            <ArrowUpRight size={14} className={ar ? 'tm-flip' : ''} />
          </span>
        </div>
        <div className="tm-card-copy">
          {local.department && <span className="tm-card-dept">{local.department}</span>}
          <h3>{local.name}</h3>
          <p>{local.jobTitle}</p>
        </div>
      </Link>
    </motion.article>
  );
}

export {isUsablePortrait};
