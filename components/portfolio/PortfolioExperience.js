'use client';

import Image from 'next/image';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
} from 'lucide-react';
import {company} from '@/data/company';
import {projectKinds} from '@/data/projects';
import {observeSectionNav, scrollToSection as scrollToAnchor} from '@/lib/scroll/anchor';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import ProjectGallery, {resolveProjectImages} from '@/components/portfolio/ProjectGallery';
import ProjectVisualFallback from '@/components/ProjectVisualFallback';
import {t} from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1];

const DISCIPLINES = [
  {id: 'architecture', en: 'Architecture', ar: 'العمارة', match: /architect/i},
  {id: 'structure', en: 'Structure', ar: 'الإنشاءات', match: /structur/i},
  {id: 'mep', en: 'MEP', ar: 'الكهروميكانيكية', match: /electromechan|mep|mechanical|electrical|plumb/i},
  {id: 'pm', en: 'Project Management', ar: 'إدارة المشاريع', match: /project management|إدارة/i},
  {id: 'supervision', en: 'Supervision', ar: 'الإشراف', match: /supervision|إشراف/i},
  {id: 'planning', en: 'Planning', ar: 'التخطيط', match: /traffic|infrastructure|urban|planning|تخطيط|مرور/i},
];

function uniqueGallery(project) {
  return resolveProjectImages(project);
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
      en: ['Planning a similar project?', 'Talk with the ASAS engineering team about your next project.'],
      ar: ['هل تخطط لمشروع مشابه؟', 'تحدث مع فريق أساس للاستشارات الهندسية وإدارة المشاريع الهندسي حول مشروعك القادم.'],
    },
    {
      en: ['Need architecture, structure and MEP together?', 'Share your brief with the Abu Dhabi office.'],
      ar: ['هل تحتاج العمارة والإنشاءات والكهروميكانيكية معاً؟', 'شارك موجز مشروعك مع مكتب أبوظبي.'],
    },
    {
      en: ['Have a project like this in mind?', 'Our team is ready to discuss requirements and next steps.'],
      ar: ['هل لديك مشروع مشابه؟', 'فريقنا جاهز لمناقشة المتطلبات والخطوات التالية.'],
    },
  ][variant % 3];

  return (
    <aside className="pf-inline-cta" aria-label={ar ? 'ابدأ مشروعاً' : 'Start a project'}>
      <div className="pf-shell">
        <div className="pf-inline-cta-panel">
          <div className="pf-inline-cta-copy">
            <h3>{ar ? copy.ar[0] : copy.en[0]}</h3>
            <p>{ar ? copy.ar[1] : copy.en[1]}</p>
          </div>
          <ActionGroup className="pf-inline-cta-actions">
            <ActionButton variant="primary" href={`/${locale}/project-enquiry`}>
              {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
            </ActionButton>
            <ActionButton
              variant="outline"
              href={`https://wa.me/${company.whatsapp}`}
              external
              icon={false}
            >
              {t('whatsapp', locale)}
            </ActionButton>
          </ActionGroup>
        </div>
      </div>
    </aside>
  );
}

function ProjectSection({
  project,
  index,
  total,
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
  const number = String(index + 1).padStart(2, '0');
  const title = ar ? project.titleAr : project.title;
  const location = ar
    ? project.locationShortAr || project.locationAr
    : project.locationShort || project.location;
  const description = ar ? project.descriptionAr : project.description;
  const isBleed = layout === 'bleed';

  return (
    <section
      className={`pf-project pf-layout-${layout}${dimmed ? ' is-dimmed' : ''}`}
      id={`project-${project.slug}`}
      data-category={project.category}
    >
      <div className="pf-shell">
        <div className="pf-project-grid">
          <header className={`pf-project-head${isBleed ? ' light' : ''}`}>
            <div className={`pf-project-topline${isBleed ? ' light' : ''}`}>
              <span>{number}</span>
              <span>{categoryLabel}</span>
            </div>
            <h2>{title}</h2>
            {location && <p className={`pf-project-loc${isBleed ? ' light' : ''}`}>{location}</p>}
          </header>

          <div className="pf-project-media-col">
            {gallery.length > 0 ? (
              <ProjectGallery
                images={gallery}
                title={title}
                ar={ar}
                priority={index < 2}
                onExpand={(imageIndex) => onOpenGallery(project.slug, imageIndex)}
              />
            ) : (
              <div className="pf-gallery-stage pf-gallery-fallback">
                <ProjectVisualFallback project={project} locale={ar ? 'ar' : 'en'} />
              </div>
            )}
          </div>

          <div className={`pf-project-copy${isBleed ? ' is-dark' : ''}`}>
            {description && (
              <p className={`pf-project-desc${isBleed ? ' light' : ''}`}>{description}</p>
            )}

            {facts.length > 0 && (
              <dl className={`pf-facts${isBleed ? ' light' : ''}`}>
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {scope.length > 0 && (
              <div className={`pf-scope${isBleed ? ' light' : ''}`}>
                <span className="pf-scope-label">{ar ? 'نطاق أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Scope'}</span>
                <ul>
                  {scope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`pf-project-nav${isBleed ? ' light' : ''}`}>
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
    scrollToAnchor(`project-${slug}`, {updateHash: false});
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
    const ids = visible.map((project) => `project-${project.slug}`);
    return observeSectionNav(ids, (id) => setActiveSlug(id.replace(/^project-/, '')));
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
          <div className="pf-shell pf-interlude-inner">
            <p className="pf-kicker">
              <i />
              {ar ? 'القطاع' : 'Sector'}
            </p>
            <div className="pf-interlude-row">
              <h2>{ar ? categoryMap[project.category]?.titleAr : categoryMap[project.category]?.title}</h2>
              <span>
                {String(visible.filter((p) => p.category === project.category).length).padStart(2, '0')}{' '}
                {ar ? 'مشاريع' : 'Projects'}
              </span>
            </div>
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
          ar={ar}
          categoryLabel={ar ? categoryMap[project.category]?.titleAr : categoryMap[project.category]?.title}
          layout={layout}
          dimmed={Boolean(activeDiscipline) && !projectMatchesDiscipline(project, activeDiscipline)}
          onOpenGallery={openGallery}
          onGo={goIndex}
        />
      </motion.div>,
    );

    if ((index + 1) % 6 === 0 && index < visible.length - 1) {
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
            <circle cx="30" cy="150" r="3" fill="#a02315" stroke="none" />
          </g>
        </svg>
        <div className="pf-shell pf-hero-inner">
          <div className="pf-hero-copy">
            <p className="pf-kicker light">
              <i />
              {ar ? 'محفظة أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Portfolio'}
            </p>
            <h1>
              <span className="pf-sr-only">{ar ? 'محفظة مشاريع أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Project Portfolio'}</span>
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
                ? 'رحلة عبر مشاريع أساس للاستشارات الهندسية وإدارة المشاريع في العمارة والإنشاءات والكهروميكانيك وإدارة المشاريع والتخصصات الاستشارية.'
                : 'A curated journey through ASAS projects across architecture, structure, MEP, project management and specialist engineering disciplines.'}
            </p>
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
                {ar ? company.cityAr : company.city} / {ar ? 'الإمارات' : 'UAE'}
              </span>
            </div>
            <div className="pf-hero-actions">
              <ActionButton variant="primary" href="#portfolio-work" icon={false}>
                {ar ? 'استكشف المحفظة' : 'Explore the Portfolio'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/project-enquiry`}>
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      <nav className="pf-subnav" data-sticky-subnav aria-label={ar ? 'تصفية المحفظة' : 'Portfolio filters'}>
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

      <aside className="pf-final-cta" aria-label={ar ? 'ابدأ مشروعاً' : 'Start a project'}>
        <div className="pf-shell">
          <div className="pf-final-cta-panel">
            <div className="pf-final-cta-copy">
              <h2>{ar ? 'هل تخطط لمشروعك التالي؟' : 'Planning your next project?'}</h2>
              <p>
                {ar
                  ? 'فريق أساس للاستشارات الهندسية وإدارة المشاريع جاهز لمناقشة متطلباتك والخطوات التالية.'
                  : 'The ASAS team is ready to discuss your requirements and next steps.'}
              </p>
            </div>
            <ActionGroup className="pf-final-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`}>
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              </ActionButton>
              <ActionButton
                variant="outline"
                href={`https://wa.me/${company.whatsapp}`}
                external
                icon={<MessageCircle size={15} aria-hidden="true" />}
              >
                {t('whatsapp', locale)}
              </ActionButton>
            </ActionGroup>
          </div>
        </div>
      </aside>

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
