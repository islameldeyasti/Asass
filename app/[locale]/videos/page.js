import VideosExperience from '@/components/videos/VideosExperience';
import {getPublicVideos} from '@/lib/cms/public-data';
import {staticPageMetadata} from '@/lib/cms/seo/page-meta';

export const dynamic = 'force-dynamic';

export const generateMetadata = staticPageMetadata({
  path: 'videos',
  type: 'page',
  titleEn: 'Videos',
  titleAr: 'الفيديو',
  descriptionEn:
    'ASAS Engineering video archive — project films and company reels from the official gallery.',
  descriptionAr: 'أرشيف فيديو أساس للاستشارات الهندسية — أفلام المشاريع والمشاهد الرسمية.',
  schemaType: 'CollectionPage',
});

export default async function VideosPage({params}) {
  const {locale} = await params;
  const videos = await getPublicVideos();
  return <VideosExperience locale={locale} videos={videos} />;
}
