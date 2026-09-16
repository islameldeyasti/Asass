'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Play, X, ArrowUpRight} from 'lucide-react';
import {localizeVideo} from '@/data/videos';
import {ActionButton} from '@/components/ActionButton';
import {ctaBandImages, roleImages} from '@/data/image-manifest';

function youtubeThumb(item) {
  if (item.thumbnail) return item.thumbnail;
  if (item.youtubeId) return `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;
  return '';
}

function embedSrc(item) {
  if (item.embedUrl) return item.embedUrl;
  if (item.youtubeId) {
    return `https://www.youtube.com/embed/${item.youtubeId}?rel=0&modestbranding=1&autoplay=1`;
  }
  return '';
}

export default function VideosExperience({locale, videos = []}) {
  const ar = locale === 'ar';
  const [activeId, setActiveId] = useState(null);
  const heroBg = ctaBandImages.videosHero || roleImages.COMPANY_HERO;
  const ctaBg = ctaBandImages.videos || roleImages.PROJECTS_HERO;

  const items = useMemo(
    () => videos.map((item) => localizeVideo(item, locale)),
    [videos, locale],
  );

  const featured = items.find((item) => item.featured) || items[0] || null;
  const rest = items.filter((item) => item.id !== featured?.id);
  const active = items.find((item) => item.id === activeId) || null;

  return (
    <div className="vd" dir={ar ? 'rtl' : 'ltr'}>
      <section className="vd-hero">
        <div className="vd-hero-photo" aria-hidden="true">
          {heroBg ? (
            <Image
              src={heroBg}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{objectFit: 'cover', objectPosition: '50% 35%'}}
            />
          ) : null}
        </div>
        <div className="vd-hero-veil" aria-hidden="true" />
        <div className="vd-hero-grid" aria-hidden="true" />
        <div className="vd-shell vd-hero-inner">
          <p className="vd-kicker">
            <i />
            {ar ? 'المعرض / الفيديو' : 'Gallery / Videos'}
          </p>
          <h1>{ar ? 'أرشيف فيديو أساس' : 'ASAS Video Archive'}</h1>
          <p className="vd-lede">
            {ar
              ? 'مشاهد من مشاريع ومكاتب أساس — مختارة من الأرشيف الرسمي ومُدارة من لوحة التحكم.'
              : 'Moments from ASAS projects and practice — curated from the official archive and managed in the CMS.'}
          </p>
          <div className="vd-hero-actions">
            <ActionButton variant="primary" href={`/${locale}/gallery`} icon="arrow-up">
              {ar ? 'معرض الصور' : 'Photo Gallery'}
            </ActionButton>
            <ActionButton
              variant="ghost"
              href="https://www.youtube.com/@AsasEngineering"
              external
              icon="arrow-up"
            >
              YouTube
            </ActionButton>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="vd-featured">
          <div className="vd-shell vd-featured-layout">
            <button
              type="button"
              className="vd-stage"
              onClick={() => setActiveId(featured.id)}
              aria-label={ar ? `تشغيل ${featured.title}` : `Play ${featured.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youtubeThumb(featured)} alt="" />
              <span className="vd-stage-veil" />
              <span className="vd-play">
                <Play size={28} fill="currentColor" />
              </span>
              <span className="vd-stage-meta">
                <em>{ar ? 'مميز' : 'Featured'}</em>
                <strong>{featured.title}</strong>
              </span>
            </button>
            <div className="vd-featured-copy">
              <p className="vd-kicker">
                <i />
                {ar ? 'أحدث المشاهد' : 'Spotlight'}
              </p>
              <h2>{featured.title}</h2>
              {featured.description ? <p>{featured.description}</p> : null}
              <p className="vd-count">
                {ar
                  ? `${items.length} فيديو في الأرشيف`
                  : `${items.length} films in the archive`}
              </p>
              <button type="button" className="vd-text-cta" onClick={() => setActiveId(featured.id)}>
                {ar ? 'تشغيل الآن' : 'Watch now'}
                <ArrowUpRight size={15} className={ar ? 'vd-flip' : ''} />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="vd-grid-section">
        <div className="vd-shell">
          <div className="vd-section-head">
            <p className="vd-kicker">
              <i />
              {ar ? 'المكتبة' : 'Library'}
            </p>
            <h2>{ar ? 'كل الفيديوهات' : 'All videos'}</h2>
          </div>
          <div className="vd-grid">
            {rest.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className="vd-card"
                onClick={() => setActiveId(item.id)}
              >
                <span className="vd-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={youtubeThumb(item)} alt="" loading="lazy" />
                  <span className="vd-card-play">
                    <Play size={18} fill="currentColor" />
                  </span>
                </span>
                <span className="vd-card-copy">
                  <strong>{item.title}</strong>
                  <em>{String(item.order || index + 1).padStart(2, '0')}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="vd-bridge">
        <div className="vd-bridge-media" aria-hidden="true">
          {ctaBg ? (
            <Image
              src={ctaBg}
              alt=""
              fill
              sizes="100vw"
              style={{objectFit: 'cover', objectPosition: '50% 40%'}}
            />
          ) : null}
        </div>
        <div className="vd-bridge-veil" aria-hidden="true" />
        <div className="vd-shell vd-bridge-inner">
          <div>
            <p className="vd-kicker light">
              <i />
              {ar ? 'استكشف أكثر' : 'Explore more'}
            </p>
            <h2>{ar ? 'الصور والمشاريع' : 'Photos & projects'}</h2>
            <p>
              {ar
                ? 'انتقل إلى معرض الصور أو تصفح المشاريع المختارة من ملف الشركة.'
                : 'Continue to the photo gallery or browse selected projects from the company profile.'}
            </p>
          </div>
          <div className="vd-bridge-actions">
            <Link className="vd-bridge-link" href={`/${locale}/gallery`}>
              {ar ? 'الصور' : 'Photos'}
            </Link>
            <Link className="vd-bridge-link" href={`/${locale}/projects`}>
              {ar ? 'المشاريع' : 'Projects'}
            </Link>
          </div>
        </div>
      </section>

      {active ? (
        <div
          className="vd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActiveId(null)}
        >
          <button
            type="button"
            className="vd-lightbox-close"
            aria-label={ar ? 'إغلاق' : 'Close'}
            onClick={() => setActiveId(null)}
          >
            <X size={22} />
          </button>
          <div className="vd-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <iframe
              src={
                embedSrc(active).includes('?')
                  ? `${embedSrc(active)}${embedSrc(active).includes('autoplay=1') ? '' : '&autoplay=1'}`
                  : `${embedSrc(active)}?autoplay=1`
              }
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="vd-lightbox-title">{active.title}</p>
        </div>
      ) : null}
    </div>
  );
}
