import {services} from '@/data/services';
import {projects} from '@/data/projects';
import {sectors} from '@/data/sectors';

const routes = ['', 'about', 'services', 'projects', 'sectors', 'careers', 'downloads', 'contact', 'project-enquiry', 'privacy', 'terms'];

export default function sitemap() {
  const detailRoutes = [
    ...services.map((service) => `services/${service.slug}`),
    ...projects.map((project) => `projects/${project.slug}`),
    ...sectors.map((sector) => `sectors/${sector.slug}`),
  ];
  return ['en', 'ar'].flatMap((locale) => [...routes, ...detailRoutes].map((route) => ({
    url: `https://www.asasengg.ae/${locale}${route ? `/${route}` : ''}`,
    lastModified: new Date(),
  })));
}
