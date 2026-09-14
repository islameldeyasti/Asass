'use client';

import {useState} from 'react';
import DocumentForm from '@/components/admin/DocumentForm';

const PAGE_OPTIONS = [
  {id: 'about', label: 'About'},
  {id: 'contact', label: 'Contact'},
  {id: 'careers', label: 'Careers'},
  {id: 'downloads', label: 'Downloads'},
  {id: 'terms', label: 'Terms'},
  {id: 'privacy', label: 'Privacy'},
];

const PAGE_FIELDS = [
  {key: 'titleEn', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'eyebrowEn', label: 'Eyebrow (EN)', type: 'text'},
  {key: 'eyebrowAr', label: 'Eyebrow (AR)', type: 'text', dir: 'rtl'},
  {key: 'ledeEn', label: 'Lede (EN)', type: 'textarea', rows: 4},
  {key: 'ledeAr', label: 'Lede (AR)', type: 'textarea', rows: 4, dir: 'rtl'},
];

export default function PageCopyManager({initialDocument, canWrite}) {
  const pages = initialDocument?.pages || {};
  const [pageId, setPageId] = useState('about');
  const current = pages[pageId] || {pageId};

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
        fields={PAGE_FIELDS}
        canWrite={canWrite}
      />
    </div>
  );
}
