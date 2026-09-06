'use client';

import Image from 'next/image';
import Link from 'next/link';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowUpRight, Linkedin, Mail, Phone} from 'lucide-react';
import {localizeMember} from '@/lib/team/schema';
import {isUsablePortrait} from './TeamCard';

const EASE = [0.16, 1, 0.3, 1];

function initialsFromName(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TeamMemberHero({member, locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const local = localizeMember(member, locale);
  const eyebrow = member.leadership
    ? ar
      ? 'الفريق / القيادة'
      : 'Team / Leadership'
    : local.department || (ar ? 'الفريق' : 'Team');
  const portrait = isUsablePortrait(member.profile_image) ? member.profile_image : '';

  return (
    <section className="tm-member-hero">
      <div className="tm-member-hero-band" aria-hidden="true" />
      <div className="tm-shell tm-member-hero-grid">
        <motion.div
          className="tm-member-portrait"
          initial={reduced ? false : {opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, ease: EASE}}
        >
          {portrait ? (
            <Image
              src={portrait}
              alt={local.name}
              fill
              priority
              sizes="(max-width:900px) 100vw, 46vw"
              style={{objectPosition: member.profile_image_focal || '50% 28%'}}
            />
          ) : (
            <div className="tm-card-fallback tm-profile-fallback" aria-hidden="true">
              <span>{initialsFromName(local.name)}</span>
            </div>
          )}
          <div className="tm-member-portrait-frame" aria-hidden="true" />
        </motion.div>

        <div className="tm-member-intro">
          <motion.p
            className="tm-kicker"
            initial={reduced ? false : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.45, ease: EASE}}
          >
            <i />
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={reduced ? false : {opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.55, delay: 0.05, ease: EASE}}
          >
            {local.name}
          </motion.h1>
          <motion.p
            className="tm-member-role"
            initial={reduced ? false : {opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.1, ease: EASE}}
          >
            {local.jobTitle}
          </motion.p>
          {local.shortBio && (
            <motion.p
              className="tm-member-lede"
              initial={reduced ? false : {opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.14, ease: EASE}}
            >
              {local.shortBio}
            </motion.p>
          )}

          <dl className="tm-member-meta">
            {member.years_experience && (
              <div>
                <dt>{ar ? 'الخبرة' : 'Experience'}</dt>
                <dd>{member.years_experience}</dd>
              </div>
            )}
            {local.expertise?.[0] && (
              <div>
                <dt>{ar ? 'التخصص' : 'Specialisation'}</dt>
                <dd>{local.expertise[0]}</dd>
              </div>
            )}
            {local.department && (
              <div>
                <dt>{ar ? 'القسم' : 'Department'}</dt>
                <dd>{local.department}</dd>
              </div>
            )}
          </dl>

          <div className="tm-member-contacts">
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Linkedin size={15} />
                LinkedIn
                <ArrowUpRight size={13} className={ar ? 'tm-flip' : ''} />
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`}>
                <Mail size={15} />
                {member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone.replace(/\s+/g, '')}`}>
                <Phone size={15} />
                {member.phone}
              </a>
            )}
          </div>

          <Link className="tm-text-link" href={`/${locale}/team`}>
            {ar ? 'العودة إلى الفريق' : 'Back to Team'}
          </Link>
        </div>
      </div>
    </section>
  );
}
