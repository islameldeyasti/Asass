import {getSeoSettings} from './seo-store';

/** Build Next.js metadata defaults from CMS SEO settings. */
export async function getCmsRootMetadata() {
  const seo = await getSeoSettings();
  return {
    title: seo.defaultTitleEn,
    description: seo.defaultDescriptionEn,
    metadataBase: seo.canonicalBase ? new URL(seo.canonicalBase) : undefined,
    openGraph: {
      title: seo.defaultTitleEn,
      description: seo.defaultDescriptionEn,
      type: 'website',
      images: seo.defaultOgImage ? [{url: seo.defaultOgImage}] : undefined,
    },
    robots: {
      index: seo.robotsIndex !== false,
      follow: seo.robotsFollow !== false,
    },
  };
}
