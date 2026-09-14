'use client';

/**
 * Strict A4 page shell — fixed header / body / footer zones.
 * Header & footer heights NEVER change with content.
 */

import {getTemplateTokens} from '@/lib/cms/corporate/letterhead-templates';
import LetterheadDesignLayers from './LetterheadDesignLayers';

export default function A4Page({
  templateId = 'classic-executive',
  className = '',
  children,
  pageNumber = 1,
  totalPages = 1,
  dir = 'ltr',
  lang = 'en',
  backgroundImageUrl = '',
  designLayers = [],
}) {
  const tokens = getTemplateTokens(templateId);
  const pageBg = String(backgroundImageUrl || '').trim();
  const hasPageBg = Boolean(pageBg);

  return (
    <article
      className={`lh-a4-page lh-tpl-${templateId}${hasPageBg ? ' has-page-bg' : ''}${className ? ` ${className}` : ''}`}
      dir={dir}
      lang={lang}
      data-page={pageNumber}
      data-pages={totalPages}
      style={{
        '--lh-header-h': tokens.headerHeight,
        '--lh-footer-h': tokens.footerHeight,
        '--lh-pad-x': tokens.pagePaddingInline,
        '--lh-body-pad-t': tokens.bodyPaddingTop,
        '--lh-body-pad-b': tokens.bodyPaddingBottom,
        '--lh-logo-h': tokens.logoHeight,
        '--lh-accent': tokens.accent,
      }}
    >
      {hasPageBg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lh-page-bg" src={pageBg} alt="" aria-hidden />
      ) : null}
      <LetterheadDesignLayers layers={designLayers} />
      {children}
    </article>
  );
}
