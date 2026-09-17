'use client';

import {useMemo, useState} from 'react';
import DocumentForm from '@/components/admin/DocumentForm';

const PAGE_OPTIONS = [
  {id: 'about', label: 'About'},
  {id: 'contact', label: 'Contact'},
  {id: 'careers', label: 'Careers'},
  {id: 'downloads', label: 'Downloads'},
  {id: 'videos', label: 'Videos'},
  {id: 'terms', label: 'Terms'},
  {id: 'privacy', label: 'Privacy'},
];

const CHROME_PAGES = new Set(['about', 'contact', 'careers', 'downloads', 'videos']);

const META_FIELDS = [
  {key: '_metaHeading', type: 'heading', label: 'Page meta', help: 'Used in admin lists and SEO-adjacent summaries.'},
  {key: 'titleEn', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'eyebrowEn', label: 'Eyebrow (EN)', type: 'text'},
  {key: 'eyebrowAr', label: 'Eyebrow (AR)', type: 'text', dir: 'rtl'},
  {key: 'ledeEn', label: 'Lede (EN)', type: 'textarea', rows: 3},
  {key: 'ledeAr', label: 'Lede (AR)', type: 'textarea', rows: 3, dir: 'rtl'},
];

const HERO_FIELDS = [
  {
    key: '_heroHeading',
    type: 'heading',
    label: 'Hero',
    help: 'Top-of-page headline, lede, and background image. Leave a field blank to keep the site default.',
  },
  {key: 'heroImage', label: 'Hero background image', type: 'image'},
  {key: 'heroTitleEn', label: 'Hero title (EN)', type: 'text'},
  {key: 'heroTitleAr', label: 'Hero title (AR)', type: 'text', dir: 'rtl'},
  {key: 'heroLedeEn', label: 'Hero lede (EN)', type: 'textarea', rows: 3},
  {key: 'heroLedeAr', label: 'Hero lede (AR)', type: 'textarea', rows: 3, dir: 'rtl'},
  {key: 'heroCtaLabelEn', label: 'Hero link label (EN)', type: 'text'},
  {key: 'heroCtaLabelAr', label: 'Hero link label (AR)', type: 'text', dir: 'rtl'},
  {key: 'heroCtaHref', label: 'Hero link URL (e.g. #openings or /en/contact)', type: 'text'},
];

const CTA_FIELDS = [
  {
    key: '_ctaHeading',
    type: 'heading',
    label: 'CTA band',
    help: 'Bottom call-to-action strip — copy, buttons, and background image.',
  },
  {key: 'ctaImage', label: 'CTA background image', type: 'image'},
  {key: 'ctaKickerEn', label: 'CTA kicker (EN)', type: 'text'},
  {key: 'ctaKickerAr', label: 'CTA kicker (AR)', type: 'text', dir: 'rtl'},
  {key: 'ctaTitleEn', label: 'CTA title (EN)', type: 'text'},
  {key: 'ctaTitleAr', label: 'CTA title (AR)', type: 'text', dir: 'rtl'},
  {key: 'ctaLedeEn', label: 'CTA lede (EN)', type: 'textarea', rows: 3},
  {key: 'ctaLedeAr', label: 'CTA lede (AR)', type: 'textarea', rows: 3, dir: 'rtl'},
  {key: 'ctaPrimaryLabelEn', label: 'Primary button label (EN)', type: 'text'},
  {key: 'ctaPrimaryLabelAr', label: 'Primary button label (AR)', type: 'text', dir: 'rtl'},
  {key: 'ctaPrimaryHref', label: 'Primary button URL', type: 'text'},
  {key: 'ctaSecondaryLabelEn', label: 'Secondary button label (EN)', type: 'text'},
  {key: 'ctaSecondaryLabelAr', label: 'Secondary button label (AR)', type: 'text', dir: 'rtl'},
  {key: 'ctaSecondaryHref', label: 'Secondary button URL', type: 'text'},
];

export default function PageCopyManager({initialDocument, canWrite}) {
  const pages = initialDocument?.pages || {};
  const [pageId, setPageId] = useState('about');
  const current = pages[pageId] || {pageId};

  const fields = useMemo(
    () => (CHROME_PAGES.has(pageId) ? [...META_FIELDS, ...HERO_FIELDS, ...CTA_FIELDS] : META_FIELDS),
    [pageId],
  );

  return (
    <div className="adm-stack">
      <div className="adm-card">
        <div className="adm-field" style={{marginBottom: 0}}>
          <label htmlFor="page-copy-select">Page</label>
          <select
            id="page-copy-select"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DocumentForm
        key={pageId}
        title={`${PAGE_OPTIONS.find((p) => p.id === pageId)?.label || pageId} copy`}
        resource="page-copy"
        pageId={pageId}
        initialValue={{...current, pageId}}
        fields={fields}
        canWrite={canWrite}
      />
    </div>
  );
}
