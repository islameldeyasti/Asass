import {projects, projectCategories} from '@/data/projects';
import PortfolioExperience from '@/components/portfolio/PortfolioExperience';

export async function generateMetadata({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar
      ? 'محفظة المشاريع | أساس للاستشارات الهندسية وإدارة المشاريع'
      : 'ASAS Project Portfolio | Engineering & Project Management Consultancy',
    description: ar
      ? `استكشف ${projects.length} مشروعاً من أعمال أساس عبر القطاعات والتخصصات — دون مغادرة الصفحة.`
      : `Explore ${projects.length} ASAS projects across sectors and disciplines in one immersive portfolio experience.`,
  };
}

export default async function PortfolioPage({params}) {
  const {locale} = await params;

  return <PortfolioExperience locale={locale} projects={projects} categories={projectCategories} />;
}
