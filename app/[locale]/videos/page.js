import VideosExperience from '@/components/videos/VideosExperience';
import {ctaBandImages, roleImages} from '@/data/image-manifest';
import {getPublicVideos, getPublicPageCopy} from '@/lib/cms/public-data';
import {resolvePageChromeForLocale} from '@/lib/cms/page-chrome';
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
  const [videos, pageCopy] = await Promise.all([
    getPublicVideos(),
    getPublicPageCopy('videos'),
  ]);
  const chrome = resolvePageChromeForLocale(pageCopy, locale, {
    heroImage: ctaBandImages.videosHero || roleImages.COMPANY_HERO,
    heroImageFocal: '50% 35%',
    heroTitleEn: 'ASAS Video Archive',
    heroTitleAr: 'أرشيف فيديو أساس',
    heroLedeEn:
      'Moments from ASAS projects and practice — curated from the official archive and managed in the CMS.',
    heroLedeAr:
      'مشاهد من مشاريع ومكاتب أساس — مختارة من الأرشيف الرسمي ومُدارة من لوحة التحكم.',
    heroCtaLabelEn: 'Photo Gallery',
    heroCtaLabelAr: 'معرض الصور',
    heroCtaHref: '/gallery',
    ctaImage: ctaBandImages.videos || roleImages.PROJECTS_HERO,
    ctaImageFocal: '50% 40%',
    ctaKickerEn: 'Explore more',
    ctaKickerAr: 'استكشف أكثر',
    ctaTitleEn: 'Photos & projects',
    ctaTitleAr: 'الصور والمشاريع',
    ctaLedeEn:
      'Continue to the photo gallery or browse selected projects from the company profile.',
    ctaLedeAr: 'انتقل إلى معرض الصور أو تصفح المشاريع المختارة من ملف الشركة.',
    ctaPrimaryLabelEn: 'Photos',
    ctaPrimaryLabelAr: 'الصور',
    ctaPrimaryHref: '/gallery',
    ctaSecondaryLabelEn: 'Projects',
    ctaSecondaryLabelAr: 'المشاريع',
    ctaSecondaryHref: '/projects',
  });

  return <VideosExperience locale={locale} videos={videos} chrome={chrome} />;
}
