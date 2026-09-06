'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
} from 'lucide-react';
import {company} from '@/data/company';
import {projectKinds} from '@/data/projects';

const EASE = [0.16, 1, 0.3, 1];

const DISCIPLINES = [
  {id: 'architecture', en: 'Architecture', ar: 'العمارة', match: /architect/i},
  {id: 'structure', en: 'Structure', ar: 'الإنشاءات', match: /structur/i},
  {id: 'mep', en: 'MEP', ar: 'MEP', match: /electromechan|mep|mechanical|electrical|plumb/i},
  {id: 'pm', en: 'Project Management', ar: 'إدارة المشاريع', match: /project management|إدارة/i},
  {id: 'supervision', en: 'Supervision', ar: 'الإشراف', match: /supervision|إشراف/i},
  {id: 'planning', en: 'Planning', ar: 'التخطيط', match: /traffic|infrastructure|urban|planning|تخطيط|مرور/i},
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
  push(project.visual?.src, project.visual?.crop, project.visual?.classification === 'PROJECT_PHOTO');
  (project.gallery || []).forEach((src) => push(src, '50% 45%', true));
  return items;
}

function extractFacts(project, ar, categoryLabel) {
  const facts = [];
  const add = (label, value) => {
    if (value) facts.push({label, value});
  };
  add(ar ? 'التصنيف' : 'Category', categoryLabel);
  add(
    ar ? 'الموقع' : 'Location',
    ar ? project.locationShortAr || project.locationAr : project.locationShort || project.location,
  );
  const kind = projectKinds[project.kind];
  if (kind) add(ar ? 'النوع' : 'Type', ar ? kind.ar : kind.en);
  const text = `${project.description || ''} ${project.descriptionAr || ''}`;
  const floors = text.match(/(\d+)\s*(?:floors|طوابق|طابقاً)/i);
  const basement = text.match(/(\d+)\s*(?:basement|طوابق سفلية)/i);
  if (floors) add(ar ? 'الطوابق' : 'Floors', ar ? `${floors[1]} طوابق` : `${floors[1]} floors`);
  if (basement) add(ar ? 'السراديب' : 'Basements', basement[1]);
  return facts;
}

function projectMatchesDiscipline(project, discipline) {
  if (!discipline) return true;
  const hay = [...(project.services || []), project.description || '', project.descriptionAr || ''].join(' ');
  return discipline.match.test(hay);
}

function ProjectLightbox({gallery, index, onClose, onPrev, onNext, title, ar}) {
  if (index == null || !gallery[index]) return null;
  const item = gallery[index];
  return (
    <div className="pf-lightbox" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="pf-lightbox-close" onClick={onClose} aria-label={ar ? 'إغلاق' : 'Close'}>
        <X size={22} />
      </button>
      <button type="button" className="pf-lightbox-nav prev" onClick={onPrev} aria-label={ar ? 'السابق' : 'Previous'}>
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="pf-lightbox-nav next" onClick={onNext} aria-label={ar ? 'التالي' : 'Next'}>
        <ChevronRight size={22} />
      </button>
      <div className="pf-lightbox-stage">
        <Image src={item.src} alt="" fill sizes="100vw" style={{objectPosition: item.crop}} />
      </div>
      <div className="pf-lightbox-meta">
        <strong>{title}</strong>
        <span>
          {String(index + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function InlineCta({locale, ar, variant = 0}) {
  const copy = [
    {
      en: ['Planning a Similar Project?', 'Talk with the ASAS engineering team about coordinated design and delivery.'],
      ar: ['هل تخطط لمشروع مشابه؟', 'تحدث مع فريق أساس الهندسي حول التصميم والتنفيذ المنسق.'],
    },
    {
      en: ['Need Architecture, Structure and MEP together?', 'Start a project enquiry and share your brief with the Abu Dhabi office.'],
      ar: ['هل تحتاج العمارة والإنشاءات وMEP معاً؟', 'ابدأ استفسار مشروع وشارك موجزك مع مكتب أبوظبي.'],
    },
    {
      en: ['Have a project like this in mind?', 'Our team is ready to understand your requirements and next steps.'],
      ar: ['هل لديك مشروع مشابه؟', 'فريقنا جاهز لفهم متطلباتك والخطوات التالية.'],
    },
  ][variant % 3];

  return (
    <section className="pf-inline-cta">
      <div className="pf-shell pf-inline-cta-inner">
        <div>
          <p className="pf-kicker light">
            <i />
            {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
          </p>
          <h3>{ar ? copy.ar[0] : copy.en[0]}</h3>
          <p>{ar ? copy.ar[1] : copy.en[1]}</p>
        </div>
        <div className="pf-inline-cta-actions">
          <Link className="pf-btn-light" href={`/${locale}/project-enquiry`}>
            {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
            <ArrowUpRight size={15} className={ar ? 'pf-flip' : ''} />
          </Link>
          <a
            className="pf-btn-ghost"
            href={`https://wa.me/${company.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function ProjectSection({
  project,
  index,
  total,
  locale,
  ar,
  categoryLabel,
  layout,
  dimmed,
  onOpenGallery,
  onGo,
}) {
  const gallery = uniqueGallery(project);
  const facts = extractFacts(project, ar, categoryLabel);
  const scope = project.services || [];
  const main = gallery[0];
  const thumbs = gallery.slice(0, 4);
  const number = String(index + 1).padStart(2, '0');
  const title = ar ? project.titleAr : project.title;
  const location = ar
    ? project.locationShortAr || project.locationAr
    : project.locationShort || project.location;
  const description = ar ? project.descriptionAr : project.description;

  if (layout === 'bleed') {
    return (
      <section
        className={`pf-project pf-layout-bleed${dimmed ? ' is-dimmed' : ''}`}
        id={`project-${project.slug}`}
        data-category={project.category}
      >
        <div className="pf-bleed-media" aria-hidden="true">
          {main && (
            <Image
              src={main.src}
              alt=""
              fill
              sizes="100vw"
              style={{objectPosition: main.crop}}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </div>
        <div className="pf-bleed-veil" aria-hidden="true" />
        <svg className="pf-bleed-grid" viewBox="0 0 400 200" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 20 H380 M20 180 H380 M40 0 V200 M360 0 V200" />
            <path d="M40 100 H360" />
          </g>
        </svg>
        <div className="pf-shell pf-bleed-panel">
          <div className="pf-project-topline light">
            <span>{number}</span>
            <span>{categoryLabel}</span>
          </div>
          <h2>{title}</h2>
          {location && <p className="pf-project-loc light">{location}</p>}
          {description && <p className="pf-project-desc light">{description}</p>}
          {scope.length > 0 && (
            <ul className="pf-scope-chips">
              {scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {gallery.length > 1 && (
            <button type="button" className="pf-btn-ghost" onClick={() => onOpenGallery(project.slug, 0)}>
              {ar ? 'عرض المعرض' : 'View Gallery'}
            </button>
          )}
          <div className="pf-project-nav light">
            <button type="button" disabled={index === 0} onClick={() => onGo(index - 1)}>
              {ar ? 'السابق' : 'Previous'}
            </button>
            <span>
              {number} / {String(total).padStart(2, '0')}
            </span>
            <button type="button" disabled={index === total - 1} onClick={() => onGo(index + 1)}>
              {ar ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`pf-project pf-layout-${layout}${dimmed ? ' is-dimmed' : ''}`}
      id={`project-${project.slug}`}
      data-category={project.category}
    >
      <div className="pf-shell">
        <div className="pf-project-grid">
          <div className="pf-project-media-col">
            {main && (
              <button
                type="button"
                className="pf-project-main"
                onClick={() => onOpenGallery(project.slug, 0)}
                aria-label={ar ? 'فتح المعرض' : 'Open gallery'}
              >
                <Image
                  src={main.src}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                  style={{objectPosition: main.crop}}
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
                <span className="pf-project-shade" />
              </button>
            )}
            {thumbs.length > 1 && (
              <div className="pf-project-thumbs">
                {thumbs.slice(1).map((item, i) => (
                  <button
                    key={`${project.slug}-t-${i}`}
                    type="button"
                    onClick={() => onOpenGallery(project.slug, i + 1)}
                  >
                    <Image src={item.src} alt="" fill sizes="160px" style={{objectPosition: item.crop}} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pf-project-copy">
            <div className="pf-project-topline">
              <span>{number}</span>
              <span>{categoryLabel}</span>
            </div>
            <h2>{title}</h2>
            {location && <p className="pf-project-loc">{location}</p>}
            {description && <p className="pf-project-desc">{description}</p>}

            {facts.length > 0 && (
              <dl className="pf-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {scope.length > 0 && (
              <div className="pf-scope">
                <span className="pf-scope-label">{ar ? 'نطاق أساس' : 'ASAS Scope'}</span>
                <ul>
                  {scope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pf-project-nav">
              <button type="button" disabled={index === 0} onClick={() => onGo(index - 1)}>
                {ar ? 'المشروع السابق' : 'Previous Project'}
              </button>
              <span>
                {number} / {String(total).padStart(2, '0')}
              </span>
              <button type="button" disabled={index === total - 1} onClick={() => onGo(index + 1)}>
                {ar ? 'المشروع التالي' : 'Next Project'}
              </button>
            </div>

            <Link className="pf-text-cta" href={`/${locale}/project-enquiry`}>
              {ar ? 'التخطيط لمشروع مشابه؟ ابدأ محادثة' : 'Planning a similar project? Start a conversation'}
              <ArrowRight size={15} className={ar ? 'pf-flip' : ''} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioExperience({locale, projects, categories}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug || '');
  const [lightbox, setLightbox] = useState(null);
  const [discipline, setDiscipline] = useState(null);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((item) => {
      map[item.slug] = item;
    });
    return map;
  }, [categories]);

  const filterCats = useMemo(
    () => categories.filter((item) => item.slug === 'all' || projects.some((p) => p.category === item.slug)),
    [categories, projects],
  );

  const visible = useMemo(() => {
    if (filter !== 'all') return projects.filter((project) => project.category === filter);

    // Group by category order so each sector interlude appears once.
    const byCategory = new Map();
    projects.forEach((project) => {
      const list = byCategory.get(project.category) || [];
      list.push(project);
      byCategory.set(project.category, list);
    });

    const ordered = [];
    categories.forEach((item) => {
      if (item.slug === 'all') return;
      const list = byCategory.get(item.slug);
      if (list?.length) ordered.push(...list);
    });
    projects.forEach((project) => {
      if (!ordered.includes(project)) ordered.push(project);
    });
    return ordered;
  }, [projects, filter, categories]);

  const galleryMap = useMemo(() => {
    const map = {};
    projects.forEach((project) => {
      map[project.slug] = uniqueGallery(project);
    });
    return map;
  }, [projects]);

  const sectorCount = useMemo(() => new Set(projects.map((p) => p.category)).size, [projects]);
  const collage = useMemo(
    () =>
      projects
        .map((project) => uniqueGallery(project)[0])
        .filter(Boolean)
        .slice(0, 4),
    [projects],
  );

  const activeDiscipline = DISCIPLINES.find((item) => item.id === discipline) || null;

  const scrollToProject = useCallback((slug) => {
    const el = document.getElementById(`project-${slug}`);
    if (!el) return;
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    setActiveSlug(slug);
  }, []);

  const goIndex = useCallback(
    (index) => {
      const project = visible[index];
      if (project) scrollToProject(project.slug);
    },
    [visible, scrollToProject],
  );

  useEffect(() => {
    const nodes = visible.map((project) => document.getElementById(`project-${project.slug}`)).filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target?.id) setActiveSlug(hit.target.id.replace('project-', ''));
      },
      {rootMargin: '-30% 0px -45% 0px', threshold: [0.15, 0.4]},
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (lightbox == null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight') {
        setLightbox((state) => {
          if (!state) return state;
          const gallery = galleryMap[state.slug] || [];
          if (!gallery.length) return state;
          return {...state, index: (state.index + 1) % gallery.length};
        });
      }
      if (event.key === 'ArrowLeft') {
        setLightbox((state) => {
          if (!state) return state;
          const gallery = galleryMap[state.slug] || [];
          if (!gallery.length) return state;
          return {...state, index: (state.index - 1 + gallery.length) % gallery.length};
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, galleryMap]);

  const openGallery = (slug, index) => setLightbox({slug, index});
  const heroImage = uniqueGallery(projects[0] || {})[0]?.src;
  const activeIndex = Math.max(0, visible.findIndex((p) => p.slug === activeSlug));

  const stream = [];
  let lastCategory = null;
  let ctaTick = 0;
  visible.forEach((project, index) => {
    if (filter === 'all' && project.category !== lastCategory) {
      lastCategory = project.category;
      stream.push(
        <div className="pf-interlude" key={`int-${project.category}-${index}`}>
          <div className="pf-shell">
            <p className="pf-kicker light">
              <i />
              {ar ? 'القطاع' : 'Sector'}
            </p>
            <h2>{ar ? categoryMap[project.category]?.titleAr : categoryMap[project.category]?.title}</h2>
            <span>
              {String(visible.filter((p) => p.category === project.category).length).padStart(2, '0')}{' '}
              {ar ? 'مشاريع' : 'Projects'}
            </span>
          </div>
        </div>,
      );
    }

    const layout = index % 3 === 2 ? 'bleed' : index % 2 === 0 ? 'a' : 'b';
    stream.push(
      <motion.div
        key={project.slug}
        layout={!reduced}
        initial={reduced ? false : {opacity: 0, y: 24}}
        animate={{opacity: 1, y: 0}}
        exit={reduced ? undefined : {opacity: 0, y: 12}}
        transition={{duration: 0.45, ease: EASE}}
      >
        <ProjectSection
          project={project}
          index={index}
          total={visible.length}
          locale={locale}
          ar={ar}
          categoryLabel={ar ? categoryMap[project.category]?.titleAr : categoryMap[project.category]?.title}
          layout={layout}
          dimmed={Boolean(activeDiscipline) && !projectMatchesDiscipline(project, activeDiscipline)}
          onOpenGallery={openGallery}
          onGo={goIndex}
        />
      </motion.div>,
    );

    if ((index + 1) % 3 === 0 && index < visible.length - 1) {
      stream.push(<InlineCta key={`cta-${index}`} locale={locale} ar={ar} variant={ctaTick++} />);
    }
  });

  return (
    <div className="pf">
      <section className="pf-hero">
        <div className="pf-hero-media" aria-hidden="true">
          {heroImage && <Image src={heroImage} alt="" fill priority sizes="100vw" />}
        </div>
        <div className="pf-hero-veil" aria-hidden="true" />
        <svg className="pf-hero-blueprint" viewBox="0 0 260 480" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M30 20 V450" />
            <path d="M70 60 V410" />
            <path d="M110 100 V370" />
            <path d="M30 150 H190" />
            <path d="M30 240 H170" />
            <circle cx="30" cy="150" r="3" fill="#e55021" stroke="none" />
          </g>
        </svg>
        <div className="pf-shell pf-hero-inner">
          <div className="pf-hero-copy">
            <p className="pf-kicker light">
              <i />
              {ar ? 'محفظة أساس' : 'ASAS Portfolio'}
            </p>
            <h1>
              <span className="pf-sr-only">{ar ? 'محفظة مشاريع أساس' : 'ASAS Project Portfolio'}</span>
              {ar ? (
                <>
                  <span aria-hidden="true">تحويل الأفكار</span>
                  <span aria-hidden="true">إلى واقع</span>
                  <span aria-hidden="true">مبني.</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">Engineering</span>
                  <span aria-hidden="true">Ideas Into</span>
                  <span aria-hidden="true">Built Reality.</span>
                </>
              )}
            </h1>
            <p className="pf-hero-lede">
              {ar
                ? 'رحلة عبر مشاريع أساس في العمارة والإنشاءات والكهروميكانيك وإدارة المشاريع والتخصصات الاستشارية.'
                : 'A curated journey through ASAS projects across architecture, structure, MEP, project management and specialist engineering disciplines.'}
            </p>
            <div className="pf-hero-actions">
              <a className="pf-btn-primary" href="#portfolio-work">
                {ar ? 'استكشف المحفظة' : 'Explore the Portfolio'}
                <ArrowDown size={15} />
              </a>
              <Link className="pf-btn-ghost" href={`/${locale}/project-enquiry`}>
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
                <ArrowUpRight size={15} className={ar ? 'pf-flip' : ''} />
              </Link>
            </div>
            <div className="pf-hero-meta">
              <span>
                {projects.length} {ar ? 'مشاريع' : 'Projects'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {sectorCount} {ar ? 'قطاعات' : 'Sectors'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {ar ? company.cityAr : company.city} / UAE
              </span>
            </div>
          </div>
        </div>
      </section>

      <nav className="pf-subnav" aria-label={ar ? 'تصفية المحفظة' : 'Portfolio filters'}>
        <div className="pf-shell pf-subnav-inner">
          <div className="pf-filters">
            {filterCats.map((item) => (
              <button
                key={item.slug}
                type="button"
                className={filter === item.slug ? 'is-active' : ''}
                onClick={() => setFilter(item.slug)}
              >
                {item.slug === 'all' ? (ar ? 'كل الأعمال' : 'All Work') : ar ? item.titleAr : item.title}
              </button>
            ))}
          </div>
          <span className="pf-count">
            {String(activeIndex + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}
          </span>
        </div>
      </nav>

      <section className="pf-section pf-intro" id="portfolio-work">
        <div className="pf-shell pf-intro-grid">
          <div>
            <p className="pf-kicker">
              <i />
              {ar ? 'أعمالنا' : 'Our Work'}
            </p>
            <h2>
              {ar ? (
                <>
                  مشاريع تشكّلت
                  <br />
                  بدقة هندسية.
                </>
              ) : (
                <>
                  Projects shaped by
                  <br />
                  engineering precision.
                </>
              )}
            </h2>
          </div>
          <div>
            <p>{ar ? company.shortDescriptionAr : company.shortDescription}</p>
            <dl className="pf-intro-stats">
              <div>
                <dt>{projects.length}</dt>
                <dd>{ar ? 'مشاريع في المحفظة' : 'Projects in portfolio'}</dd>
              </div>
              <div>
                <dt>{sectorCount}</dt>
                <dd>{ar ? 'قطاعات' : 'Sectors'}</dd>
              </div>
              <div>
                <dt>{company.year}</dt>
                <dd>{ar ? 'سنة التأسيس' : 'Founded'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="pf-section pf-index">
        <div className="pf-shell">
          <p className="pf-kicker">
            <i />
            {ar ? 'فهرس المشاريع' : 'Project Index'}
          </p>
          <ol className="pf-index-list">
            {visible.map((project, index) => (
              <li key={project.slug}>
                <button type="button" onClick={() => scrollToProject(project.slug)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{ar ? project.titleAr : project.title}</strong>
                  <em>{ar ? categoryMap[project.category]?.titleAr : categoryMap[project.category]?.title}</em>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <aside className="pf-rail" aria-label={ar ? 'تقدم المشاريع' : 'Project progress'}>
        {visible.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            className={activeSlug === project.slug ? 'is-active' : ''}
            onClick={() => scrollToProject(project.slug)}
            aria-label={`${String(index + 1).padStart(2, '0')} ${ar ? project.titleAr : project.title}`}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </aside>

      <div className="pf-stream">
        <AnimatePresence mode="popLayout">{stream}</AnimatePresence>
      </div>

      <section className="pf-section pf-expertise">
        <div className="pf-shell">
          <p className="pf-kicker">
            <i />
            {ar ? 'خبراتنا' : 'Our Expertise'}
          </p>
          <h2>
            {ar ? (
              <>
                محفظة واحدة.
                <br />
                تخصصات متعددة.
              </>
            ) : (
              <>
                One portfolio.
                <br />
                Multiple disciplines.
              </>
            )}
          </h2>
          <p className="pf-expertise-lede">
            {ar
              ? 'مرّر على تخصص لإبراز المشاريع ذات الصلة في هذه الصفحة.'
              : 'Hover a discipline to highlight related projects on this page.'}
          </p>
          <ul className="pf-disciplines">
            {DISCIPLINES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={discipline === item.id ? 'is-active' : ''}
                  onMouseEnter={() => setDiscipline(item.id)}
                  onMouseLeave={() => setDiscipline(null)}
                  onFocus={() => setDiscipline(item.id)}
                  onBlur={() => setDiscipline(null)}
                  onClick={() => setDiscipline((current) => (current === item.id ? null : item.id))}
                >
                  {ar ? item.ar : item.en}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pf-section pf-summary">
        <div className="pf-shell pf-summary-grid">
          <div>
            <p className="pf-kicker">
              <i />
              {ar ? 'الخلاصة' : 'Portfolio Summary'}
            </p>
            <h2>
              {ar ? (
                <>
                  كل مشروع،
                  <br />
                  رؤية منسقة واحدة.
                </>
              ) : (
                <>
                  Every project,
                  <br />
                  one coordinated vision.
                </>
              )}
            </h2>
            <p>{ar ? company.descriptionAr : company.description}</p>
          </div>
          {collage.length > 0 && (
            <div className="pf-collage" aria-hidden="true">
              {collage.map((item, index) => (
                <div key={`collage-${index}`} className={`pf-collage-item n${index + 1}`}>
                  <Image src={item.src} alt="" fill sizes="280px" style={{objectPosition: item.crop}} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pf-final-cta">
        <div className="pf-final-cta-media" aria-hidden="true">
          {heroImage && <Image src={heroImage} alt="" fill sizes="100vw" loading="lazy" />}
        </div>
        <div className="pf-final-cta-veil" aria-hidden="true" />
        <div className="pf-shell pf-final-cta-inner">
          <div>
            <p className="pf-kicker light">
              <i />
              {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
            </p>
            <h2>{ar ? 'هل تخطط لمشروعك التالي؟' : 'Planning Your Next Project?'}</h2>
            <p>
              {ar
                ? 'فريقنا الهندسي جاهز لفهم متطلباتك والمساعدة في نقل مشروعك من الفكرة إلى التسليم.'
                : 'Our engineering team is ready to understand your requirements and help move your project from concept to delivery.'}
            </p>
            <div className="pf-hero-actions">
              <Link className="pf-btn-light" href={`/${locale}/project-enquiry`}>
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
                <ArrowUpRight size={15} className={ar ? 'pf-flip' : ''} />
              </Link>
              <a
                className="pf-btn-ghost"
                href={`https://wa.me/${company.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>
          </div>
          <ul className="pf-final-words" aria-hidden="true">
            <li>{ar ? 'صمّم' : 'Design'}</li>
            <li>{ar ? 'هندس' : 'Engineer'}</li>
            <li>{ar ? 'نسّق' : 'Coordinate'}</li>
            <li>{ar ? 'سلّم' : 'Deliver'}</li>
          </ul>
        </div>
      </section>

      {lightbox && (
        <ProjectLightbox
          gallery={galleryMap[lightbox.slug] || []}
          index={lightbox.index}
          title={
            ar
              ? projects.find((p) => p.slug === lightbox.slug)?.titleAr
              : projects.find((p) => p.slug === lightbox.slug)?.title
          }
          ar={ar}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((state) => {
              const gallery = galleryMap[state.slug] || [];
              if (!gallery.length) return state;
              return {...state, index: (state.index - 1 + gallery.length) % gallery.length};
            })
          }
          onNext={() =>
            setLightbox((state) => {
              const gallery = galleryMap[state.slug] || [];
              if (!gallery.length) return state;
              return {...state, index: (state.index + 1) % gallery.length};
            })
          }
        />
      )}
    </div>
  );
}
