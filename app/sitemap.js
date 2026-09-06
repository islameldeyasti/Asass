import {services} from '@/data/services';
import {projects} from '@/data/projects';
import {sectors} from '@/data/sectors';

const routes = ['', 'about', 'services', 'projects', 'portfolio', 'sectors', 'team', 'careers', 'downloads', 'contact', 'project-enquiry', 'company-profile', 'privacy', 'terms'];

export default async function sitemap() {
  const {getPublishedTeamMembers} = await import('@/data/team');
  const teamMembers = await getPublishedTeamMembers().catch(() => []);
  const detailRoutes = [
    ...services.map((service) => `services/${service.slug}`),
    ...projects.map((project) => `projects/${project.slug}`),
    ...sectors.map((sector) => `sectors/${sector.slug}`),
    ...teamMembers.map((member) => `team/${member.slug}`),
  ];
  return ['en', 'ar'].flatMap((locale) => [...routes, ...detailRoutes].map((route) => ({
    url: `https://www.asasengg.ae/${locale}${route ? `/${route}` : ''}`,
    lastModified: new Date(),
  })));
}
