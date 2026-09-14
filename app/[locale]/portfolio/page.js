import {projects, projectCategories} from '@/data/projects';
import PortfolioExperience from '@/components/portfolio/PortfolioExperience';
import {staticPageMetadata} from '@/lib/cms/seo/page-meta';

export const generateMetadata = staticPageMetadata({
  path: 'portfolio',
  titleEn: 'ASAS Project Portfolio',
  titleAr: 'محفظة المشاريع',
  descriptionEn: 'Explore ASAS projects across sectors and disciplines in one immersive portfolio experience.',
  descriptionAr:
    'استكشف مشاريع من أعمال أساس للاستشارات الهندسية وإدارة المشاريع عبر القطاعات والتخصصات — دون مغادرة الصفحة.',
});


export default async function PortfolioPage({params}) {
  const {locale} = await params;

  return <PortfolioExperience locale={locale} projects={projects} categories={projectCategories} />;
}
