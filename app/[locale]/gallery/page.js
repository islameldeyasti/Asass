import GalleryExperience from '@/components/gallery/GalleryExperience';

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'معرض الصور | أساس' : 'Gallery | ASAS',
    description:
      locale === 'ar'
        ? 'أرشيف أساس البصري — مشاريع وأماكن ولحظات من عمل الاستشارات الهندسية.'
        : 'ASAS visual archive — projects, places and moments behind the engineering work.',
  };
}

export default async function GalleryPage({params}) {
  const {locale} = await params;
  return <GalleryExperience locale={locale} />;
}
