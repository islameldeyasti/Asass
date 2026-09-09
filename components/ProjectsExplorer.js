'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useMemo, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {
  ArrowUpRight,
  Building2,
  Factory,
  Filter,
  Home,
  Landmark,
  Layers,
  MapPin,
  School,
  Trees,
  Warehouse,
  X,
} from 'lucide-react';
import {projectCategories, projectKinds, projects} from '@/data/projects';
import ProjectVisualFallback from '@/components/ProjectVisualFallback';
import {NextChevron, PrevChevron} from '@/components/icons/DirectionalChevrons';

const featuredSlug = 'traffic-access-studies';
const pageSize = 9;
const EASE = [0.16, 1, 0.3, 1];

const shortFilterLabels = {
  all: 'All Projects',
  towers: 'Towers',
  buildings: 'Buildings',
  industrial: 'Industrial',
  infrastructure: 'Infrastructure',
  education: 'Schools',
  'compound-villas': 'Compounds',
  'private-villas': 'Private Villas',
  'residential-villas': 'Residential',
  'interior-design': 'Interior Design',
};

const shortFilterLabelsAr = {
  all: 'كل المشاريع',
  towers: 'الأبراج',
  buildings: 'المباني',
  industrial: 'الصناعي',
  infrastructure: 'البنية التحتية',
  education: 'المدارس',
  'compound-villas': 'المجمعات',
  'private-villas': 'الفلل الخاصة',
  'residential-villas': 'السكنية',
  'interior-design': 'التصميم الداخلي',
};

const filterIcons = {
  all: Layers,
  towers: Landmark,
  buildings: Building2,
  industrial: Factory,
  infrastructure: Warehouse,
  education: School,
  'compound-villas': Trees,
  'private-villas': Home,
  'residential-villas': Home,
  'interior-design': Building2,
};

function extractStats(project, ar) {
  const text = `${project.description || ''} ${project.descriptionAr || ''}`;
  const stats = [];
  const floors = text.match(/(\d+)\s*(?:floors|طوابق|طابقاً)/i);
  const basement = text.match(/(\d+)\s*(?:basement|طوابق سفلية)/i);
  const podium = text.match(/(\d+)\s*(?:podium|منصة)/i);
  const towers = /(?:four|4)\s*-?\s*tower|أربعة أبراج/i.test(text);
  if (towers) stats.push({label: ar ? 'أبراج' : 'Towers', value: '4'});
  if (podium) stats.push({label: ar ? 'منصة' : 'Podium levels', value: podium[1]});
  if (floors) stats.push({label: ar ? 'طوابق' : 'Total floors', value: floors[1]});
  if (!stats.length && basement) {
    stats.push({label: ar ? 'طوابق سفلية' : 'Basement', value: basement[1]});
  }
  return stats.slice(0, 3);
}

function ProjectVisual({project, ar, sizes, priority = false}) {
  const photo =
    project.visual?.classification === 'PROJECT_PHOTO' ||
    project.visual?.classification === 'TECHNICAL_DRAWING';
  if (!project.visual?.src) {
    return (
      <div className="pl-visual pl-visual--fallback">
        <ProjectVisualFallback project={project} locale={ar ? 'ar' : 'en'} />
      </div>
    );
  }
  return (
    <div className="pl-visual">
      <Image
        src={project.visual.src}
        alt={photo ? (ar ? project.titleAr : project.title) : ''}
        fill
        sizes={sizes}
        priority={priority}
        style={{objectPosition: project.visual.crop}}
      />
    </div>
  );
}

function ProjectCard({project, locale, ar}) {
  const kind = projectKinds[project.kind];
  const place = ar ? project.locationShortAr || project.locationAr : project.locationShort || project.location;
  return (
    <Link className="pl-card" href={`/${locale}/projects/${project.slug}`}>
      <ProjectVisual project={project} ar={ar} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      <div className="pl-card-copy">
        <div className="pl-card-meta">
          <span className="pl-kind">{ar ? kind.ar : kind.en}</span>
          {place && (
            <span className="pl-place">
              <MapPin size={13} />
              {place}
            </span>
          )}
        </div>
        <h3>{ar ? project.titleAr : project.title}</h3>
        <p>{ar ? project.descriptionAr : project.description}</p>
        <span className="pl-card-link">
          {ar ? 'عرض المشروع' : 'View project'}
          <ArrowUpRight size={15} className={ar ? 'reverse-arrow' : ''} />
        </span>
      </div>
    </Link>
  );
}

function FilterList({categories, counts, active, onSelect, ar}) {
  return (
    <div className="pl-filter-list" role="tablist" aria-orientation="vertical">
      {categories.map((category) => {
        const count = counts[category.slug] || 0;
        const label = ar
          ? shortFilterLabelsAr[category.slug] || category.titleAr
          : shortFilterLabels[category.slug] || category.title;
        const Icon = filterIcons[category.slug] || Layers;
        const selected = active === category.slug;
        return (
          <button
            key={category.slug}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? 'is-active' : ''}
            onClick={() => onSelect(category.slug)}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="pl-filter-label">{label}</span>
            <span className="pl-filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ProjectsExplorer({locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const [active, setActive] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const counts = useMemo(() => {
    const next = {all: projects.length};
    for (const project of projects) next[project.category] = (next[project.category] || 0) + 1;
    return next;
  }, []);

  const filtered = active === 'all' ? projects : projects.filter((project) => project.category === active);
  const showFeatured = active === 'all' || active === 'towers';
  const featured = showFeatured
    ? filtered.find((project) => project.slug === featuredSlug) || filtered.find((project) => project.featured)
    : null;
  const remainder = filtered.filter((project) => project.slug !== featured?.slug);
  const totalPages = Math.max(1, Math.ceil(remainder.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = remainder.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const foundCount = filtered.length;
  const featuredStats = featured ? extractStats(featured, ar) : [];
  const featuredPlace = featured
    ? ar
      ? featured.locationAr || featured.locationShortAr
      : featured.location || featured.locationShort
    : '';

  const selectFilter = (slug) => {
    setActive(slug);
    setPage(1);
    setDrawerOpen(false);
  };

  const pageItems = useMemo(() => {
    if (totalPages <= 1) return [];
    return Array.from({length: totalPages}, (_, i) => i + 1).slice(0, 5);
  }, [totalPages]);

  return (
    <div className="pl-layout">
      <aside className="pl-sidebar">
        <div className="pl-sidebar-inner">
          <div className="pl-sidebar-head">
            <h2>{ar ? 'تصفية المشاريع' : 'Project Filters'}</h2>
            <p>{ar ? 'ابحث حسب القطاع أو النوع.' : 'Find projects by sector or type.'}</p>
          </div>
          <FilterList
            categories={projectCategories}
            counts={counts}
            active={active}
            onSelect={selectFilter}
            ar={ar}
          />
          <div className="pl-sidebar-foot" aria-hidden="true">
            <svg viewBox="0 0 180 120" className="pl-sidebar-blueprint">
              <g fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M24 100 V28 H54 V100" />
                <path d="M68 100 V18 H102 V100" />
                <path d="M116 100 V34 H148 V100" />
                <path d="M20 100 H156" />
                <path d="M24 58 H148" />
              </g>
            </svg>
            <p>
              {ar ? (
                <>
                  هندسة المساحات
                  <br />
                  لغدٍ أفضل.
                </>
              ) : (
                <>
                  Engineering
                  <br />
                  spaces for
                  <br />a better tomorrow.
                </>
              )}
            </p>
          </div>
        </div>
      </aside>

      <div className="pl-results">
        <div className="pl-results-bar">
          <button type="button" className="pl-mobile-filter" onClick={() => setDrawerOpen(true)}>
            <Filter size={15} />
            {ar ? `التصفية (${foundCount})` : `Filters (${foundCount})`}
          </button>
          <p className="pl-found">
            {ar ? `${foundCount} مشروعاً` : `${foundCount} projects found`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={`featured-${featured.slug}-${active}`}
              initial={reduced ? false : {opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -8}}
              transition={{duration: 0.55, ease: EASE}}
            >
              <Link className="pl-featured" href={`/${locale}/projects/${featured.slug}`}>
                <div className="pl-featured-media">
                  <ProjectVisual project={featured} ar={ar} sizes="(max-width: 900px) 100vw, 58vw" priority />
                </div>
                <div className="pl-featured-copy">
                  <span className="pl-featured-eyebrow">{ar ? 'مشروع مميز' : 'Featured Project'}</span>
                  <h2>{ar ? featured.titleAr : featured.title}</h2>
                  {featuredPlace && (
                    <p className="pl-featured-place">
                      <MapPin size={14} />
                      {featuredPlace}
                    </p>
                  )}
                  <p className="pl-featured-desc">{ar ? featured.descriptionAr : featured.description}</p>
                  {featuredStats.length > 0 && (
                    <dl className="pl-featured-stats">
                      {featuredStats.map((stat) => (
                        <div key={stat.label}>
                          <dt>{stat.label}</dt>
                          <dd>{stat.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <span className="pl-featured-cta">
                    {ar ? 'عرض المشروع' : 'View Project'}
                    <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="pl-grid" layout>
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.div
                key={project.slug}
                layout
                initial={reduced ? false : {opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: 12}}
                transition={{duration: 0.45, delay: reduced ? 0 : i * 0.05, ease: EASE}}
              >
                <ProjectCard project={project} locale={locale} ar={ar} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && (
          <nav className="pl-pages" aria-label={ar ? 'صفحات النتائج' : 'Results pages'}>
            <button
              type="button"
              aria-label={ar ? 'السابق' : 'Previous'}
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <PrevChevron ar={ar} size={16} />
            </button>
            {pageItems.map((item) => (
              <button
                key={item}
                type="button"
                className={item === currentPage ? 'is-active' : ''}
                aria-current={item === currentPage ? 'page' : undefined}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              aria-label={ar ? 'التالي' : 'Next'}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              <NextChevron ar={ar} size={16} />
            </button>
          </nav>
        )}
      </div>

      {drawerOpen && (
        <div className="pl-drawer" role="dialog" aria-modal="true" aria-label={ar ? 'تصفية المشاريع' : 'Project filters'}>
          <button type="button" className="pl-drawer-backdrop" aria-label={ar ? 'إغلاق' : 'Close'} onClick={() => setDrawerOpen(false)} />
          <div className="pl-drawer-panel">
            <div className="pl-drawer-head">
              <h2>{ar ? 'تصفية المشاريع' : 'Project Filters'}</h2>
              <button type="button" aria-label={ar ? 'إغلاق' : 'Close'} onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <FilterList
              categories={projectCategories}
              counts={counts}
              active={active}
              onSelect={selectFilter}
              ar={ar}
            />
          </div>
        </div>
      )}
    </div>
  );
}
