import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import ProjectVisualFallback from '@/components/ProjectVisualFallback';

export default function TeamProjects({projects, locale}) {
  const ar = locale === 'ar';
  if (!projects?.length) return null;

  return (
    <section className="tm-section tm-projects">
      <div className="tm-shell">
        <p className="tm-kicker">
          <i />
          {ar ? 'المشاريع' : 'Selected Projects'}
        </p>
        <h2>{ar ? 'مشاريع مختارة' : 'Selected Projects'}</h2>
        <div className="tm-project-grid">
          {projects.map((project) => (
            <Link key={project.slug} className="tm-project-card" href={`/${locale}/projects/${project.slug}`}>
              <div className="tm-project-media">
                {project.visual?.src ? (
                  <Image
                    src={project.visual.src}
                    alt=""
                    fill
                    sizes="(max-width:900px) 100vw, 25vw"
                    style={{objectPosition: project.visual.crop || '50% 40%'}}
                    loading="lazy"
                  />
                ) : (
                  <ProjectVisualFallback project={project} locale={locale} />
                )}
              </div>
              <div className="tm-project-copy">
                <strong>{ar ? project.titleAr : project.title}</strong>
                <span>
                  {(ar ? project.locationShortAr || project.locationAr : project.locationShort || project.location) ||
                    project.category}
                </span>
                <em>
                  {ar ? 'عرض المشروع' : 'View project'}
                  <ArrowUpRight size={13} className={ar ? 'tm-flip' : ''} />
                </em>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
