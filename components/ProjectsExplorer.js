'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight, MapPin} from 'lucide-react';
import {projectCategories, projectKinds, projects} from '@/data/projects';

const featuredSlug = 'four-towers-al-nahda';
const pageSize = 9;

const shortFilterLabels = {
  all: 'All',
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
  all: 'الكل',
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

const featuredFacts = {
  en: [['Composition', '3B + 6 podium'], ['Parking', '6 levels'], ['Height', '37 floors'], ['Location', 'Al Nahda, Sharjah']],
  ar: [['التكوين', '3 طوابق سفلية + 6 منصة'], ['المواقف', '6 طوابق'], ['الارتفاع', '37 طابقاً'], ['الموقع', 'النهدة، الشارقة']],
};

function ProjectVisual({project, ar, sizes, priority = false}) {
  const photo = project.visual?.classification === 'PROJECT_PHOTO';
  return (
    <div className="projects-visual">
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
  const place = ar ? project.locationShortAr : project.locationShort;
  return (
    <Link className="projects-card" href={`/${locale}/projects/${project.slug}`}>
      <ProjectVisual project={project} ar={ar} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      <div className="projects-card-copy">
        <div className="projects-card-meta">
          <span className={`projects-kind projects-kind-${project.kind}`}>{ar ? kind.ar : kind.en}</span>
          {place && <span className="projects-place"><MapPin size={13} />{place}</span>}
        </div>
        <h3>{ar ? project.titleAr : project.title}</h3>
        <p>{ar ? project.descriptionAr : project.description}</p>
        <span className="projects-card-link">
          {ar ? 'عرض المشروع' : 'View project'}
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export default function ProjectsExplorer({locale}) {
  const ar = locale === 'ar';
  const [active, setActive] = useState('all');
  const [limit, setLimit] = useState(pageSize);

  const counts = useMemo(() => {
    const next = {all: projects.length};
    for (const project of projects) next[project.category] = (next[project.category] || 0) + 1;
    return next;
  }, []);

  const filtered = active === 'all' ? projects : projects.filter((project) => project.category === active);
  const showFeatured = active === 'all' || active === 'towers';
  const featured = showFeatured ? filtered.find((project) => project.slug === featuredSlug) : null;
  const remainder = filtered.filter((project) => project.slug !== featured?.slug);
  const visible = remainder.slice(0, active === 'all' ? limit : remainder.length);
  const shownCount = (featured ? 1 : 0) + visible.length;
  const canLoadMore = active === 'all' && shownCount < filtered.length;

  return (
    <>
      <nav className="projects-filter" aria-label={ar ? 'تصنيفات المشاريع' : 'Project filters'}>
        <div className="projects-filter-rail" role="tablist">
          {projectCategories.map((category) => {
            const count = counts[category.slug] || 0;
            const label = ar
              ? (shortFilterLabelsAr[category.slug] || category.titleAr)
              : (shortFilterLabels[category.slug] || category.title);
            const selected = active === category.slug;
            return (
              <button
                className={selected ? 'is-active' : ''}
                onClick={() => {
                  setActive(category.slug);
                  setLimit(pageSize);
                }}
                key={category.slug}
                type="button"
                role="tab"
                aria-selected={selected}
              >
                <span className="projects-filter-label">{label}</span>
                <span className="projects-filter-sep" aria-hidden="true">·</span>
                <span className="projects-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {featured && (
        <Link className="projects-featured" href={`/${locale}/projects/${featured.slug}`}>
          <ProjectVisual project={featured} ar={ar} sizes="(max-width: 900px) 100vw, 55vw" priority />
          <div className="projects-featured-copy">
            <span className={`projects-kind projects-kind-${featured.kind}`}>
              {ar ? projectKinds[featured.kind].ar : projectKinds[featured.kind].en}
            </span>
            <h2>{ar ? featured.titleAr : featured.title}</h2>
            <p>{ar ? featured.descriptionAr : featured.description}</p>
            <dl>
              {featuredFacts[ar ? 'ar' : 'en'].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <span className="projects-card-link projects-card-link-light">
              {ar ? 'عرض المشروع' : 'View project'}
              <ArrowUpRight size={15} />
            </span>
          </div>
        </Link>
      )}

      <div className="projects-grid">
        {visible.map((project) => (
          <ProjectCard project={project} locale={locale} ar={ar} key={project.slug} />
        ))}
      </div>

      {canLoadMore && (
        <div className="projects-more">
          <button type="button" onClick={() => setLimit((value) => value + pageSize)}>
            {ar ? 'عرض المزيد' : 'Load more'}
            <small>{shownCount} / {filtered.length}</small>
          </button>
        </div>
      )}
    </>
  );
}
