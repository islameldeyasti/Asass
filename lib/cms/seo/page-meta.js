/**
 * Convenience wrappers for App Router generateMetadata.
 */
import {buildRouteMetadata} from './build-metadata';

/**
 * Static page metadata helper.
 * @param {{path: string, type?: string, titleEn: string, titleAr: string, descriptionEn?: string, descriptionAr?: string, image?: string, schemaType?: string}} config
 */
export function staticPageMetadata(config) {
  return async function generateMetadata({params}) {
    const {locale} = await params;
    return buildRouteMetadata({
      locale,
      path: config.path || '',
      type: config.type || 'page',
      fallbackTitle: config.titleEn,
      fallbackTitleAr: config.titleAr,
      fallbackDescription: config.descriptionEn || '',
      fallbackDescriptionAr: config.descriptionAr || '',
      fallbackImage: config.image || '',
      schemaType: config.schemaType || '',
    });
  };
}

export {buildRouteMetadata};
