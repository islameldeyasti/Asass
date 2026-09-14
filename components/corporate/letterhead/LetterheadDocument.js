'use client';

import {useEffect, useMemo, useState} from 'react';
import QRCode from 'qrcode';
import {
  getBodyHeightMm,
  resolveLetterLanguage,
} from '@/lib/cms/corporate/letterhead-templates';
import A4Page from './A4Page';
import LetterheadHeader from './LetterheadHeader';
import LetterheadFooter from './LetterheadFooter';
import LetterBodyEditor, {StaticLetterBody} from './LetterBodyEditor';
import LetterDocumentFields, {
  LetterSignatureFields,
} from './LetterDocumentFields';

const MM_TO_PX = 96 / 25.4;

/**
 * Shared letterhead document — edit / preview / print use the same A4 engine.
 */
export default function LetterheadDocument({
  doc,
  company,
  logoUrl = '/assets/asas/corporate/asas-letterhead-mark.png',
  mode = 'print',
  selectedBlock = null,
  onSelectBlock,
  onChangeField,
  onBodyChange,
  onBodyFocus,
  onBodyBlur,
  onSelectionUpdate,
  editorRef,
  onPageCountChange,
}) {
  const editable = mode === 'edit';
  const {language, dir} = resolveLetterLanguage(doc);
  const bodyHeightMm = getBodyHeightMm(doc?.templateId);
  const bodyHeightPx = bodyHeightMm * MM_TO_PX;

  const [pageCount, setPageCount] = useState(1);
  const [mirrorHtml, setMirrorHtml] = useState(doc?.bodyHtml || '<p></p>');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    setMirrorHtml(doc?.bodyHtml || '<p></p>');
  }, [doc?.bodyHtml, doc?.id]);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  useEffect(() => {
    let cancelled = false;
    const site = company?.website || 'www.asasengg.ae';
    const url = site.startsWith('http') ? site : `https://${site}`;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 192,
      color: {dark: '#070463', light: '#00000000'},
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [company?.website]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const host = document.querySelector(
        `.lh-doc-root[data-doc="${doc?.id || 'new'}"] .lh-measure-host`,
      );
      if (!host) return;
      const h = host.scrollHeight || bodyHeightPx;
      const breaks = (host.querySelectorAll('[data-page-break]') || []).length;
      const fromHeight = Math.max(1, Math.ceil(h / bodyHeightPx));
      const next = Math.max(fromHeight, breaks + 1);
      setPageCount((prev) => (prev === next ? prev : next));
    }, 500);
    return () => window.clearInterval(id);
  }, [bodyHeightPx, doc?.id, mirrorHtml, editable]);

  const pages = useMemo(
    () => Array.from({length: pageCount}, (_, i) => i + 1),
    [pageCount],
  );

  function handleBodyChange(html) {
    setMirrorHtml(html);
    onBodyChange?.(html);
  }

  return (
    <div
      className={`lh-doc-root lh-print-root${editable ? ' is-editing' : ''}`}
      data-doc={doc?.id || 'new'}
      data-mode={mode}
    >
      {pages.map((pageNumber) => {
        const index = pageNumber - 1;
        return (
          <A4Page
            key={pageNumber}
            templateId={doc.templateId}
            pageNumber={pageNumber}
            totalPages={pageCount}
            dir={dir}
            lang={language === 'ar' ? 'ar' : 'en'}
            className={pageNumber > 1 ? 'lh-a4-continued' : ''}
            backgroundImageUrl={doc.backgroundImageUrl || ''}
            designLayers={doc.designLayers || []}
          >
            <LetterheadHeader
              doc={doc}
              company={company}
              logoUrl={logoUrl}
              language={language}
            />

            <div className="lh-zone-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {doc?.showWatermark !== false &&
              doc?.templateId === 'classic-executive' ? (
                <img
                  className="lh-watermark"
                  src={
                    doc?.headerMarkUrl ||
                    '/assets/asas/corporate/asas-letterhead-mark.png'
                  }
                  alt=""
                  aria-hidden
                />
              ) : null}
              <div
                className={`lh-body-window${editable && index === 0 ? ' is-edit-scroll' : ''}`}
                style={{height: `${bodyHeightMm}mm`}}
              >
                {index === 0 ? (
                  <div className="lh-measure-host">
                    {pageNumber === 1 ? (
                      <LetterDocumentFields
                        doc={doc}
                        language={language}
                        editable={editable}
                        selectedBlock={selectedBlock}
                        onSelectBlock={onSelectBlock}
                        onChangeField={onChangeField}
                      />
                    ) : null}
                    {editable ? (
                      <LetterBodyEditor
                        html={doc.bodyHtml}
                        editable
                        dir={dir}
                        placeholder={
                          language === 'ar'
                            ? 'ابدأ كتابة الرسالة…'
                            : 'Start writing your letter…'
                        }
                        onChange={handleBodyChange}
                        onFocus={() => {
                          onSelectBlock?.('body');
                          onBodyFocus?.();
                        }}
                        onBlur={onBodyBlur}
                        onSelectionUpdate={onSelectionUpdate}
                        editorRef={editorRef}
                      />
                    ) : (
                      <StaticLetterBody html={doc.bodyHtml} dir={dir} />
                    )}
                    {pageNumber === 1 ? (
                      <LetterSignatureFields
                        doc={doc}
                        language={language}
                        editable={editable}
                        selectedBlock={selectedBlock}
                        onSelectBlock={onSelectBlock}
                        onChangeField={onChangeField}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="lh-measure-host lh-body-mirror"
                    aria-hidden
                    style={{transform: `translateY(-${index * bodyHeightPx}px)`}}
                  >
                    <LetterDocumentFields
                      doc={doc}
                      language={language}
                      editable={false}
                    />
                    <StaticLetterBody html={mirrorHtml} dir={dir} />
                    <LetterSignatureFields
                      doc={doc}
                      language={language}
                      editable={false}
                    />
                  </div>
                )}
              </div>
            </div>

            <LetterheadFooter
              doc={doc}
              company={company}
              language={language}
              pageNumber={pageNumber}
              totalPages={pageCount}
              qrDataUrl={qrDataUrl}
            />
          </A4Page>
        );
      })}
    </div>
  );
}
