'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers,
  MapPin,
  Play,
  Ruler,
  Tag,
  Workflow,
  X,
} from 'lucide-react';
import {company, mission, strengths} from '@/data/company';

const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'design', en: 'Design Approach', ar: 'منهجية التصميم'},
  {id: 'technical', en: 'Technical Details', ar: 'التفاصيل الفنية'},
  {id: 'gallery', en: 'Gallery', ar: 'المعرض'},
  {id: 'related', en: 'Related Projects', ar: 'مشاريع مرتبطة'},
];

const DISCIPLINES = [
  {
    icon: Building2,
    en: ['Architecture', 'Massing, façades and spatial coordination across the composition.'],
    ar: ['العمارة', 'التكوين والواجهات والتنسيق الفراغي عبر المشروع.'],
  },
  {
    icon: Layers,
    en: ['Structure', 'Structural systems aligned with architectural intent and buildability.'],
    ar: ['الإنشاءات', 'أنظمة إنشائية منسجمة مع الفكرة المعمارية وقابلية التنفيذ.'],
  },
  {
    icon: Workflow,
    en: ['MEP', 'Electromechanical systems coordinated for performance and maintenance.'],
    ar: ['الكهروميكانيك', 'أنظمة كهروميكانيكية منسقة للأداء والصيانة.'],
  },
  {
    icon: Ruler,
    en: ['Coordination', 'Cross-discipline checking before issue and through delivery.'],
    ar: ['التنسيق', 'مراجعة بين التخصصات قبل الإصدار وخلال التسليم.'],
  },
];

function uniqueGallery(project) {
  const seen = new Set();
  const items = [];
  const push = (src, crop, photo) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    items.push({src, crop: crop || '50% 40%', photo: Boolean(photo)});
  };

  const asset = project.imageAsset;
  push(asset?.portfolio, '50% 40%', true);
  push(asset?.card, '50% 50%', true);
  push(asset?.mobile, '50% 45%', true);
  push(
    project.visual?.src,
    project.visual?.crop || '50% 40%',
    project.visual?.classification === 'PROJECT_PHOTO',
  );

  // Only when a single authentic frame exists: alternate crops for interactive thumbs.
  if (items.length === 1) {
    const base = items[0];
    return [
      base,
      {src: base.src, crop: '68% 30%', photo: base.photo},
      {src: base.src, crop: '32% 58%', photo: base.photo},
      {src: base.src, crop: '80% 45%', photo: base.photo},
    ];
  }

  return items;
}

function extractFacts(project, ar, category, services) {
  const text = `${project.description || ''} ${project.descriptionAr || ''}`;
  const metrics = [];
  const details = [];
  const addMetric = (label, value) => {
    if (value) metrics.push({label, value});
  };
  const addDetail = (label, value) => {
    if (value) details.push({label, value, wide: false});
  };

  const floors = text.match(/(\d+)\s*(?:floors|طوابق|طابقاً)/i);
  const basement = text.match(/(\d+)\s*(?:basement|طوابق سفلية|طابق(?:اً)? سفل)/i);
  const podium = text.match(/(\d+)\s*(?:podium|منصة)/i);
  const towers = /(?:four|4)\s*-?\s*tower|أربعة أبراج/i.test(text);

  if (towers) addMetric(ar ? 'أبراج' : 'Towers', '4');
  if (floors) addMetric(ar ? 'طوابق' : 'Floors', ar ? `${floors[1]} طوابق` : `${floors[1]} floors`);
  if (basement) addMetric(ar ? 'طوابق سفلية' : 'Basement levels', ar ? `${basement[1]} مستويات` : `${basement[1]} levels`);
  if (podium) addMetric(ar ? 'مواقف المنصة' : 'Podium parking', ar ? `${podium[1]} مستويات` : `${podium[1]} levels`);
  if (category) addDetail(ar ? 'الفئة' : 'Category', ar ? category.titleAr : category.title);
  if (project.location) addDetail(ar ? 'الموقع' : 'Location', ar ? project.locationAr : project.location);
  if (services?.length) {
    details.push({
      label: ar ? 'النطاق' : 'Scope',
      value: services.join(ar ? ' · ' : ' · '),
      wide: true,
    });
  }

  return [...metrics, ...details];
}

function splitTitle(title) {
  if (!title) return [''];
  if (title.includes(',')) {
    const [a, ...rest] = title.split(',');
    return [`${a.trim()},`, rest.join(',').trim()].filter(Boolean);
  }
  if (title.includes('—')) {
    const [a, ...rest] = title.split('—');
    return [a.trim(), rest.join('—').trim()].filter(Boolean);
  }
  return [title];
}

function BlueprintSide({reduced}) {
  return (
    <svg className="pd-side-blueprint" viewBox="0 0 140 280" aria-hidden="true">
      <g className={reduced ? '' : 'pd-draw'} fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M36 18 V262" />
        <path d="M56 36 V244" />
        <path d="M76 54 V226" />
        <path d="M96 72 V208" />
        <path d="M36 88 H118" />
        <path d="M36 132 H108" />
        <path d="M36 176 H98" />
        <path d="M36 220 H88" />
        <circle cx="36" cy="88" r="2.2" fill="#e55021" stroke="none" />
        <circle cx="76" cy="132" r="1.8" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function PeerPager({locale, peers, peerIndex, ar}) {
  if (!peers?.length) return null;
  const total = peers.length;
  const prev = peers[(peerIndex - 1 + total) % total];
  const next = peers[(peerIndex + 1) % total];
  return (
    <div className="pd-hero-pager">
      <Link href={`/${locale}/projects/${prev.slug}`} aria-label={ar ? 'المشروع السابق' : 'Previous project'}>
        <ChevronLeft size={15} />
      </Link>
      <span>
        {String(peerIndex + 1).padStart(2, '0')}
        <i>/</i>
        {String(total).padStart(2, '0')}
      </span>
      <Link href={`/${locale}/projects/${next.slug}`} aria-label={ar ? 'المشروع التالي' : 'Next project'}>
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}

export default function ProjectDetailView({
  locale,
  project,
  category,
  related,
  peers = [],
  peerIndex = 0,
  title,
  location,
  description,
  services,
  scopeTags,
  hasBrochure,
}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const gallery = useMemo(() => uniqueGallery(project), [project]);
  const facts = useMemo(
    () => extractFacts(project, ar, category, services),
    [project, ar, category, services],
  );
  const titleLines = useMemo(() => splitTitle(title), [title]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [panel, setPanel] = useState(location ? 'map' : 'diagram');
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedPage, setRelatedPage] = useState(0);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const current = gallery[index] || gallery[0];
  const mapQuery = location ? encodeURIComponent(location) : '';
  const extraCount = Math.max(0, gallery.length - 4);
  const thumbItems = gallery.slice(0, 4);
  const relatedPages = Math.max(1, Math.ceil(related.length / 3));
  const relatedSlice = related.slice(relatedPage * 3, relatedPage * 3 + 3);
  const quote = ar ? mission.ar : mission.en;
  const approachLead = ar ? company.descriptionAr : company.description;
  const approachSupport = ar ? strengths[0]?.copyAr : strengths[0]?.copy;
  const showMap = Boolean(location);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, {stiffness: 50, damping: 22});
  const sy = useSpring(my, {stiffness: 50, damping: 22});
  const imgX = useTransform(sx, [-0.5, 0.5], reduced ? [0, 0] : [5, -5]);
  const imgY = useTransform(sy, [-0.5, 0.5], reduced ? [0, 0] : [4, -4]);

  const {scrollYProgress} = useScroll({
    target: ctaRef,
    offset: ['start end', 'end start'],
  });
  const ctaY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-18, 18]);

  const go = useCallback(
    (next) => {
      if (!gallery.length) return;
      setIndex(() => (next + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
  }, [reduced]);

  useEffect(() => {
    const ids = TABS.map((tab) => tab.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      {rootMargin: '-28% 0px -55% 0px', threshold: [0.08, 0.2, 0.4]},
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIndex(0);
      setRelatedPage(0);
      setLightbox(null);
      setPanel(location ? 'map' : 'diagram');
    });
    return () => cancelAnimationFrame(frame);
  }, [project.slug, location]);

  useEffect(() => {
    if (lightbox == null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight') setLightbox((value) => (value + 1) % gallery.length);
      if (event.key === 'ArrowLeft') setLightbox((value) => (value - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, gallery.length]);

  const designRef = useRef(null);
  const designInView = useInView(designRef, {once: true, amount: 0.2});

  if (!current) return null;

  return (
    <article className="pd">
      <div className="pd-shell pd-top">
        <nav className="pd-breadcrumb" aria-label={ar ? 'مسار التنقل' : 'Breadcrumb'}>
          <Link href={`/${locale}`}>{ar ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${locale}/projects`}>{ar ? 'المشاريع' : 'Projects'}</Link>
          <span>/</span>
          <em>{title}</em>
        </nav>
      </div>

      <section className="pd-hero" id="overview" ref={heroRef}>
        <div className="pd-hero-grid">
          <div className="pd-thumbs" aria-label={ar ? 'صور المشروع' : 'Project photos'}>
            {thumbItems.map((item, i) => (
              <motion.button
                key={`${item.src}-${item.crop}-${i}`}
                type="button"
                className={`pd-thumb${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
                initial={reduced ? false : {opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.05 * i, duration: 0.5, ease: EASE}}
              >
                <Image src={item.src} alt="" fill sizes="76px" style={{objectPosition: item.crop}} />
              </motion.button>
            ))}
            {(extraCount > 0) && (
              <button type="button" className="pd-thumb pd-thumb-more" onClick={() => setLightbox(0)}>
                <strong>+{extraCount}</strong>
                <span>{ar ? 'كل الصور' : 'View all photos'}</span>
              </button>
            )}
            {gallery.length > 0 && gallery.length <= 4 && (
              <button type="button" className="pd-thumb pd-thumb-more" onClick={() => setLightbox(0)}>
                <strong>+{gallery.length}</strong>
                <span>{ar ? 'كل الصور' : 'View all photos'}</span>
              </button>
            )}
          </div>

          <div
            className="pd-main-frame"
            onPointerMove={(event) => {
              if (reduced) return;
              const rect = event.currentTarget.getBoundingClientRect();
              mx.set((event.clientX - rect.left) / rect.width - 0.5);
              my.set((event.clientY - rect.top) / rect.height - 0.5);
            }}
            onPointerLeave={() => {
              mx.set(0);
              my.set(0);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.src + current.crop + index}
                className="pd-main-media"
                style={{x: imgX, y: imgY}}
                initial={reduced ? false : {opacity: 0, scale: 1.025}}
                animate={{opacity: 1, scale: 1}}
                exit={reduced ? undefined : {opacity: 0, scale: 1.02}}
                transition={{duration: 0.72, ease: EASE}}
              >
                <Image
                  src={current.src}
                  alt={current.photo ? title : ''}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 56vw"
                  style={{objectPosition: current.crop}}
                />
              </motion.div>
            </AnimatePresence>
            <div className="pd-main-veil" aria-hidden="true" />
            {scopeTags.length > 0 && (
              <div className="pd-main-tags">{scopeTags.slice(0, 3).join(' / ')}</div>
            )}
            {project.video && (
              <a className="pd-film" href={project.video} target="_blank" rel="noreferrer">
                <span className="pd-film-play"><Play size={14} fill="currentColor" /></span>
                <span>
                  <strong>{ar ? 'شاهد فيلم المشروع' : 'Watch project film'}</strong>
                  {project.videoDuration && <small>{project.videoDuration}</small>}
                </span>
              </a>
            )}
            <div className="pd-main-nav">
              <button type="button" aria-label={ar ? 'السابق' : 'Previous'} onClick={() => go(index - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span>
                {String(index + 1).padStart(2, '0')}
                <i>/</i>
                {String(gallery.length).padStart(2, '0')}
              </span>
              <button type="button" aria-label={ar ? 'التالي' : 'Next'} onClick={() => go(index + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="pd-hero-copy">
            <motion.p
              className="pd-hero-kicker"
              initial={reduced ? false : {opacity: 0, y: 8}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.1, ease: EASE}}
            >
              <i />
              {ar ? category?.titleAr : category?.title}
            </motion.p>
            <h1>
              {titleLines.map((line, i) => (
                <motion.span
                  key={line}
                  initial={reduced ? false : {opacity: 0, y: 14}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.6, delay: 0.16 + i * 0.07, ease: EASE}}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="pd-lede"
              initial={reduced ? false : {opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.55, delay: 0.3, ease: EASE}}
            >
              {description}
            </motion.p>
            <dl className="pd-meta">
              {category && (
                <motion.div
                  initial={reduced ? false : {opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.45, delay: 0.36, ease: EASE}}
                >
                  <Tag size={14} aria-hidden="true" />
                  <div>
                    <dt>{ar ? 'الفئة' : 'Category'}</dt>
                    <dd>{ar ? category.titleAr : category.title}</dd>
                  </div>
                </motion.div>
              )}
              {location && (
                <motion.div
                  initial={reduced ? false : {opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.45, delay: 0.42, ease: EASE}}
                >
                  <MapPin size={14} aria-hidden="true" />
                  <div>
                    <dt>{ar ? 'الموقع' : 'Location'}</dt>
                    <dd>{location}</dd>
                  </div>
                </motion.div>
              )}
              {services.length > 0 && (
                <motion.div
                  initial={reduced ? false : {opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.45, delay: 0.48, ease: EASE}}
                >
                  <Layers size={14} aria-hidden="true" />
                  <div>
                    <dt>{ar ? 'النطاق' : 'Scope'}</dt>
                    <dd>
                      <ul>
                        {services.map((service) => (
                          <li key={service}>{service}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </motion.div>
              )}
            </dl>
          </div>

          <aside className="pd-hero-tech">
            <PeerPager locale={locale} peers={peers} peerIndex={peerIndex} ar={ar} />
            <div className="pd-tech-graphic">
              <BlueprintSide reduced={reduced} />
              <ul className="pd-tech-words" aria-hidden="true">
                {(ar
                  ? ['تخطيط', 'تصميم', 'هندسة', 'غدٍ أفضل']
                  : ['Planning', 'Design', 'Engineering', 'A Better', 'Tomorrow']
                ).map((word) => (
                  <li key={word}>{word}</li>
                ))}
              </ul>
            </div>
            {location && (
              <a
                className="pd-map-card"
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="pd-map-card-visual" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <strong>{location}</strong>
                <em>
                  {ar ? 'عرض على الخريطة' : 'View on map'}
                  <ArrowRight size={12} className={ar ? 'reverse-arrow' : ''} />
                </em>
              </a>
            )}
          </aside>
        </div>
      </section>

      <nav className="pd-tabs" aria-label={ar ? 'أقسام الصفحة' : 'Page sections'}>
        <div className="pd-tabs-inner">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={activeTab === tab.id ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(tab.id);
                setActiveTab(tab.id);
              }}
            >
              {ar ? tab.ar : tab.en}
            </a>
          ))}
        </div>
      </nav>

      <section className="pd-section" id="design" ref={designRef}>
        <div className="pd-shell">
          <div className="pd-design-grid">
            <div className="pd-design-copy">
              <p className="pd-kicker">
                <i />
                {ar ? 'منهجيتنا' : 'Our Approach'}
              </p>
              <h2>{ar ? 'منهجية التصميم' : 'Design Approach'}</h2>
              <p>{approachLead}</p>
              {approachSupport && <p>{approachSupport}</p>}
              <p>{description}</p>
              <Link className="pd-text-link" href={`/${locale}/about`}>
                {ar ? 'فلسفة التصميم لدينا' : 'Our Design Philosophy'}
                <ArrowRight size={14} className={ar ? 'reverse-arrow' : ''} />
              </Link>
              <blockquote>{quote}</blockquote>
            </div>
            <div className="pd-design-media">
              {(gallery.length >= 2 ? gallery.slice(0, 2) : [gallery[0], gallery[0]].filter(Boolean)).map((item, i) => (
                <motion.figure
                  key={`${item.src}-design-${i}`}
                  initial={reduced ? false : {clipPath: 'inset(100% 0 0 0)'}}
                  animate={designInView || reduced ? {clipPath: 'inset(0% 0 0 0)'} : undefined}
                  transition={{duration: 0.85, delay: 0.1 + i * 0.12, ease: EASE}}
                >
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 28vw"
                    style={{objectPosition: i === 1 && gallery.length === 1 ? '70% 55%' : item.crop}}
                  />
                </motion.figure>
              ))}
            </div>
          </div>
          <div className="pd-discipline-grid">
            {DISCIPLINES.map((item, i) => {
              const Icon = item.icon;
              const [name, copy] = ar ? item.ar : item.en;
              return (
                <motion.article
                  key={name}
                  initial={reduced ? false : {opacity: 0, y: 24}}
                  animate={designInView || reduced ? {opacity: 1, y: 0} : undefined}
                  transition={{duration: 0.6, delay: 0.15 + i * 0.08, ease: EASE}}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{name}</h3>
                  <p>{copy}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pd-section pd-tech" id="technical">
        <div className="pd-shell pd-tech-bleed">
          <header className="pd-tech-head">
            <div className="pd-tech-intro">
              <p className="pd-kicker">
                <i />
                {ar ? 'حقائق المشروع' : 'Project Facts'}
              </p>
              <h2>{ar ? 'التفاصيل الفنية' : 'Technical Details'}</h2>
              <p>
                {ar
                  ? 'تُعرض هنا الحقائق المستمدة من بيانات المشروع الرسمية في ملف أساس.'
                  : 'Facts shown here are drawn from the official ASAS project record.'}
              </p>
            </div>
            <div className="pd-tech-actions">
              {hasBrochure && (
                <a className="pd-btn-navy" href="/downloads/asas-company-profile.pdf">
                  <Download size={16} />
                  {ar ? 'تحميل الملف التعريفي' : 'Download company profile'}
                </a>
              )}
              <Link className="pd-text-link" href={`/${locale}/contact`}>
                {ar ? 'تواصل معنا' : 'Get in Touch'}
                <ArrowRight size={14} className={ar ? 'reverse-arrow' : ''} />
              </Link>
            </div>
          </header>

          <div className="pd-tech-body">
            <dl className="pd-tech-facts">
              {facts.map((fact) => (
                <div key={`${fact.label}-${fact.value}`} className={fact.wide ? 'is-wide' : ''}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="pd-panel">
              {showMap && (
                <div className="pd-panel-tabs">
                  <button type="button" className={panel === 'diagram' ? 'is-active' : ''} onClick={() => setPanel('diagram')}>
                    {ar ? 'مخطط المبنى' : 'Building Diagram'}
                  </button>
                  <button type="button" className={panel === 'map' ? 'is-active' : ''} onClick={() => setPanel('map')}>
                    {ar ? 'خريطة الموقع' : 'Location Map'}
                  </button>
                </div>
              )}
              <div className="pd-panel-body">
                {panel === 'map' && showMap ? (
                  <iframe
                    title={ar ? 'خريطة الموقع' : 'Location map'}
                    src={`https://maps.google.com/maps?q=${mapQuery}&z=13&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <svg viewBox="0 0 420 360" className="pd-elevation" aria-hidden="true">
                    <rect width="420" height="360" fill="#f3f5f7" />
                    <g fill="none" stroke="#0b1d4d" strokeWidth="1.35" opacity="0.72">
                      <path d="M68 310 V88 H118 V310" />
                      <path d="M138 310 V62 H198 V310" />
                      <path d="M218 310 V94 H278 V310" />
                      <path d="M298 310 V74 H358 V310" />
                      <path d="M48 310 H378" />
                      <path d="M68 150 H358" />
                      <path d="M68 210 H358" />
                      <path d="M68 260 H358" />
                    </g>
                    <text x="68" y="338" fill="#6b7280" fontSize="11" fontFamily="Segoe UI, Arial, sans-serif">
                      {ar ? 'مخطط مفاهيمي' : 'Conceptual elevation'}
                    </text>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pd-section" id="gallery">
        <div className="pd-shell">
          <div className="pd-gallery-head">
            <div>
              <p className="pd-kicker">
                <i />
                {ar ? 'معرض المشروع' : 'Project Gallery'}
              </p>
              <h2>{ar ? 'تجربة المشروع' : 'Project Experience'}</h2>
            </div>
            <div className="pd-gallery-tools">
              <button type="button" className="pd-text-link" onClick={() => setLightbox(0)}>
                {ar ? 'استكشف المعرض' : 'Explore full gallery'}
                <ArrowRight size={14} className={ar ? 'reverse-arrow' : ''} />
              </button>
              <div className="pd-gallery-controls">
                <button type="button" aria-label={ar ? 'السابق' : 'Previous'} onClick={() => go(index - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" aria-label={ar ? 'التالي' : 'Next'} onClick={() => go(index + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="pd-gallery-strip">
            {gallery.slice(0, 4).map((item, i) => (
              <figure key={`${item.src}-g-${i}`}>
                <button type="button" onClick={() => setLightbox(i)}>
                  <Image src={item.src} alt="" fill sizes="(max-width: 900px) 90vw, 25vw" style={{objectPosition: item.crop}} />
                  <span className="pd-gallery-shade" />
                </button>
                <figcaption>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <em>{ar ? `منظر ${i + 1}` : `Project view ${i + 1}`}</em>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pd-section pd-related" id="related">
          <div className="pd-shell">
            <div className="pd-related-head">
              <div>
                <p className="pd-kicker">
                  <i />
                  {ar ? 'استكشف المزيد' : 'Explore More'}
                </p>
                <h2>{ar ? 'مشاريع مرتبطة' : 'Related Projects'}</h2>
              </div>
              {relatedPages > 1 && (
                <div className="pd-gallery-controls">
                  <button
                    type="button"
                    aria-label={ar ? 'السابق' : 'Previous'}
                    onClick={() => setRelatedPage((page) => (page - 1 + relatedPages) % relatedPages)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={ar ? 'التالي' : 'Next'}
                    onClick={() => setRelatedPage((page) => (page + 1) % relatedPages)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="pd-related-grid">
              {relatedSlice.map((item) => {
                const itemTitle = ar ? item.titleAr : item.title;
                const itemLocation = ar ? item.locationAr : item.location;
                const itemCat = item.categoryLabel;
                const itemImage = item.imageAsset?.portfolio || item.visual.src;
                return (
                  <Link key={item.slug} href={`/${locale}/projects/${item.slug}`} className="pd-related-card">
                    <span className="pd-related-media">
                      <Image
                        src={itemImage}
                        alt={item.visual.classification === 'PROJECT_PHOTO' ? itemTitle : ''}
                        fill
                        sizes="(max-width: 900px) 100vw, 30vw"
                        style={{objectPosition: item.visual.crop || '50% 40%'}}
                      />
                    </span>
                    <span className="pd-related-copy">
                      <small>{ar ? itemCat?.titleAr : itemCat?.title}</small>
                      <strong>{itemTitle}</strong>
                      {itemLocation && <em>{itemLocation}</em>}
                    </span>
                    <span className="pd-related-orb" aria-hidden="true">
                      <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="pd-cta" ref={ctaRef}>
        <motion.div className="pd-cta-media" style={{y: ctaY}} aria-hidden="true">
          <Image src={gallery[0]?.src || current.src} alt="" fill sizes="100vw" style={{objectPosition: gallery[0]?.crop || current.crop}} />
        </motion.div>
        <div className="pd-cta-veil" aria-hidden="true" />
        <div className="pd-shell pd-cta-inner">
          <div>
            <p className="pd-kicker light">
              <i />
              {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
            </p>
            <h2>{ar ? 'هل تخطط لمشروع جديد؟' : 'Planning a New Project?'}</h2>
            <p>
              {ar
                ? 'فريقنا الهندسي جاهز لفهم متطلباتك والمساعدة في تحويل رؤيتك إلى واقع.'
                : 'Our engineering team is ready to understand your requirements and help turn your vision into reality.'}
            </p>
            <Link className="pd-btn-light" href={`/${locale}/project-enquiry`}>
              {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <ul className="pd-cta-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ أفضل' : 'A Better Tomorrow'}</li>
          </ul>
        </div>
      </section>

      <AnimatePresence>
        {lightbox != null && gallery[lightbox] && (
          <motion.div
            className="pd-lightbox"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            role="dialog"
            aria-modal="true"
            aria-label={ar ? 'معرض الصور' : 'Image gallery'}
          >
            <button type="button" className="pd-lightbox-close" aria-label={ar ? 'إغلاق' : 'Close'} onClick={() => setLightbox(null)}>
              <X size={22} />
            </button>
            <button type="button" className="pd-lightbox-nav is-prev" aria-label={ar ? 'السابق' : 'Previous'} onClick={() => setLightbox((value) => (value - 1 + gallery.length) % gallery.length)}>
              <ChevronLeft size={22} />
            </button>
            <div className="pd-lightbox-frame">
              <Image
                src={gallery[lightbox].src}
                alt={gallery[lightbox].photo ? title : ''}
                fill
                sizes="100vw"
                style={{objectPosition: gallery[lightbox].crop}}
              />
            </div>
            <button type="button" className="pd-lightbox-nav is-next" aria-label={ar ? 'التالي' : 'Next'} onClick={() => setLightbox((value) => (value + 1) % gallery.length)}>
              <ChevronRight size={22} />
            </button>
            <span className="pd-lightbox-count">
              {String(lightbox + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
