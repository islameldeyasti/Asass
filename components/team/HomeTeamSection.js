'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Facebook, Instagram, Linkedin, Youtube} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {localizeMember} from '@/lib/team/schema';
import {staggerDelayRtl} from '@/lib/motion/rtl';
import {socialLinks, socialNetworks} from '@/data/socialLinks';
import {t} from '@/lib/i18n/ui';
import {isUsablePortrait} from './TeamCard';

const EASE = [0.16, 1, 0.3, 1];

const SOCIAL_ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

function initialsFromName(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function detectNetwork(label = '', url = '') {
  const hay = `${label} ${url}`.toLowerCase();
  if (hay.includes('linkedin')) return 'linkedin';
  if (hay.includes('instagram')) return 'instagram';
  if (hay.includes('facebook') || hay.includes('fb.com')) return 'facebook';
  if (hay.includes('youtube') || hay.includes('youtu.be')) return 'youtube';
  return '';
}

/** Build LinkedIn + Instagram + Facebook + YouTube for a member (company fallback). */
function resolveMemberSocials(member) {
  const personal = {};
  if (member?.linkedin_url) personal.linkedin = member.linkedin_url;
  for (const link of member?.social_links || []) {
    const id = detectNetwork(link.label, link.url);
    if (id && link.url) personal[id] = link.url;
  }

  return socialNetworks
    .map((network) => ({
      id: network.id,
      href: personal[network.id] || socialLinks[network.id] || network.href,
      labelKey: network.labelKey,
      ariaKey: network.ariaKey,
    }))
    .filter((item) => item.href);
}

function ExpertCard({member, locale, index}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const local = localizeMember(member, locale);
  const href = `/${locale}/team/${member.slug}`;
  const portrait = isUsablePortrait(member.profile_image) ? member.profile_image : '';
  const initials = initialsFromName(local.name);
  const socials = resolveMemberSocials(member);

  return (
    <motion.article
      className="tm-expert"
      initial={reduced ? false : {opacity: 0, y: 28}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.25}}
      transition={{duration: 0.7, delay: staggerDelayRtl(index, locale, {columns: 4}), ease: EASE}}
    >
      <Link href={href} className="tm-expert-link">
        <div className="tm-expert-media">
          {portrait ? (
            <Image
              src={portrait}
              alt={local.name}
              fill
              sizes="(max-width: 900px) 50vw, 25vw"
              style={{objectPosition: member.profile_image_focal || '50% 22%'}}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="tm-expert-fallback" aria-hidden="true">
              <span>{initials}</span>
            </div>
          )}
          <span className="tm-expert-fade" aria-hidden="true" />
          {socials.length ? (
            <span className="tm-expert-socials" onClick={(event) => event.preventDefault()}>
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.id];
                if (!Icon) return null;
                return (
                  <span
                    key={social.id}
                    className="tm-expert-social"
                    role="link"
                    tabIndex={0}
                    aria-label={t(social.ariaKey, locale)}
                    title={t(social.labelKey, locale)}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      window.open(social.href, '_blank', 'noopener,noreferrer');
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return;
                      event.preventDefault();
                      event.stopPropagation();
                      window.open(social.href, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                  </span>
                );
              })}
            </span>
          ) : null}
        </div>
        <div className="tm-expert-copy">
          <h3>{local.name}</h3>
          <p>{local.jobTitle}</p>
        </div>
      </Link>
    </motion.article>
  );
}

export default function HomeTeamSection({members, locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const list = Array.isArray(members) ? members.slice(0, 4) : [];
  if (!list.length) return null;

  return (
    <section className="tm tm-home tm-experts" id="team" aria-labelledby="home-team-heading">
      <div className="tm-experts-glow" aria-hidden="true" />
      <div className="tm-shell tm-experts-inner">
        <motion.header
          className="tm-experts-head"
          initial={reduced ? false : {opacity: 0, y: 18}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.5}}
          transition={{duration: 0.65, ease: EASE}}
        >
          <p className="tm-kicker">
            <i />
            {ar ? 'تعرّف على خبرائنا' : 'Meet Our Experts'}
          </p>
          <h2 id="home-team-heading">
            {ar ? 'الأشخاص خلف تميّزنا الهندسي.' : 'People behind our engineering excellence.'}
          </h2>
          <p>
            {ar
              ? 'مهندسون واستشاريون يقودون التصميم والإشراف عبر مشاريع أساس في أبوظبي والإمارات.'
              : 'Engineers and consultants leading design and supervision across ASAS projects in Abu Dhabi and the UAE.'}
          </p>
        </motion.header>

        <div className="tm-experts-grid">
          {list.map((member, index) => (
            <ExpertCard key={member.id} member={member} locale={locale} index={index} />
          ))}
        </div>

        <motion.div
          className="tm-experts-foot"
          initial={reduced ? false : {opacity: 0, y: 12}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.55, delay: 0.1, ease: EASE}}
        >
          <Link className="tm-experts-cta" href={`/${locale}/team`}>
            {ar ? 'عرض كامل الفريق' : 'View Full Team'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
