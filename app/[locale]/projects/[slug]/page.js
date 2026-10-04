import {notFound} from 'next/navigation';
import ProjectDetailView from '@/components/projects/ProjectDetailView';
import {projectCategories} from '@/data/projects';
import {getPublicProjectBySlug, getPublicProjects, getPublicSectors, getPublicServices} from '@/lib/cms/public-data';
import {buildRouteMetadata} from '@/lib/cms/seo/build-metadata';

export const dynamic = 'force-dynamic';

const scopeAr = {
  'Architectural design': 'التصميم المعماري',
  'Structural engineering': 'الهندسة الإنشائية',
  'Electromechanical design': 'التصميم الكهروميكانيكي',
  'Traffic studies and analysis': 'دراسات وتحليل المرور',
  Infrastructure: 'البنية التحتية',
  'Urban planning': 'التخطيط الحضري',
  'Interior design': 'التصميم الداخلي',
};

const scopeTagsEn = {
  'Architectural design': 'Architecture',
  'Structural engineering': 'Structure',
  'Electromechanical design': 'MEP',
  'Traffic studies and analysis': 'Traffic',
  Infrastructure: 'Infrastructure',
  'Urban planning': 'Planning',
  'Interior design': 'Interiors',
};

const scopeTagsAr = {
  'Architectural design': 'عمارة',
  'Structural engineering': 'إنشاءات',
  'Electromechanical design': 'MEP',
  'Traffic studies and analysis': 'مرور',
  Infrastructure: 'بنية تحتية',
  'Urban planning': 'تخطيط',
  'Interior design': 'داخلي',
};

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.flatMap((project) => ['en', 'ar'].map((locale) => ({locale, slug: project.slug})));
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return {title: 'Project'};
  return buildRouteMetadata({
    locale,
    path: `projects/${slug}`,
    type: 'project',
    fallbackTitle: project.title,
    fallbackTitleAr: project.titleAr,
    fallbackDescription: project.description || '',
    fallbackDescriptionAr: project.descriptionAr || '',
    fallbackImage: project.cover || project.image || project.visual?.src || '',
    schemaType: 'CreativeWork',
  });
}


export default async function Project({params}) {
  const {locale, slug} = await params;
  const [projects, cmsServices, cmsSectors] = await Promise.all([
    getPublicProjects(),
    getPublicServices(),
    getPublicSectors(),
  ]);
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const ar = locale === 'ar';
  const serviceMap = Object.fromEntries((cmsServices || []).map((item) => [item.slug, item]));
  const sectorMap = Object.fromEntries((cmsSectors || []).map((item) => [item.slug, item]));
  const projectSectors = Array.isArray(project.sectors) ? project.sectors : [];
  const category =
    sectorMap[projectSectors[0]] ||
    projectCategories.find((item) => item.slug === project.category);
  const related = projects
    .filter((item) => {
      if (item.slug === project.slug) return false;
      const otherSectors = Array.isArray(item.sectors) ? item.sectors : [];
      if (projectSectors.length && otherSectors.some((id) => projectSectors.includes(id))) return true;
      return item.category && item.category === project.category;
    })
    .slice(0, 6)
    .map((item) => ({
      ...item,
      categoryLabel:
        sectorMap[(item.sectors || [])[0]] ||
        projectCategories.find((entry) => entry.slug === item.category),
    }));

  const peers = projects
    .filter((item) => {
      const otherSectors = Array.isArray(item.sectors) ? item.sectors : [];
      if (projectSectors.length && otherSectors.some((id) => projectSectors.includes(id))) return true;
      return item.category && item.category === project.category;
    })
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      titleAr: item.titleAr,
    }));
  const peerIndex = Math.max(0, peers.findIndex((item) => item.slug === project.slug));

  const linkedServices = (Array.isArray(project.services) ? project.services : [])
    .map((item) => serviceMap[item] || {title: item, titleAr: scopeAr[item] || item, slug: item});
  const services = linkedServices.map((item) => (ar ? item.titleAr || item.title : item.title));
  const scopeTags = linkedServices.map((item) =>
    ar ? scopeTagsAr[item.title] || item.titleAr || item.title : scopeTagsEn[item.title] || item.title,
  );

  return (
    <ProjectDetailView
      locale={locale}
      project={project}
      category={category}
      related={related}
      peers={peers}
      peerIndex={peerIndex}
      title={ar ? project.titleAr : project.title}
      location={ar ? project.locationAr : project.location}
      description={ar ? project.descriptionAr : project.description}
      services={services}
      scopeTags={scopeTags}
      hasBrochure
    />
  );
}
