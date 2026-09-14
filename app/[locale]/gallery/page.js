import GalleryExperience from '@/components/gallery/GalleryExperience';
import {staticPageMetadata} from '@/lib/cms/seo/page-meta';

export const generateMetadata = staticPageMetadata({
  path: 'gallery',
  type: 'gallery',
  titleEn: 'Gallery',
  titleAr: 'معرض الصور',
  descriptionEn: 'ASAS visual archive — projects, places and moments behind the engineering work.',
  descriptionAr: 'أرشيف أساس البصري — مشاريع وأماكن ولحظات من عمل الاستشارات الهندسية.',
  schemaType: 'CreativeWork',
});

export default async function GalleryPage({params}) {
  const {locale} = await params;
  return <GalleryExperience locale={locale} />;
}
