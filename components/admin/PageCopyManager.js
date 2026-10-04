'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import MediaPicker from '@/components/admin/media/MediaPicker';

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

function Pair({en, ar, enValue, arValue, onEn, onAr, multiline = false, disabled}) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className="pcs-pair">
      <label className="pcs-field">
        <span>{en}</span>
        <Control
          rows={multiline ? 4 : undefined}
          value={enValue || ''}
          onChange={(e) => onEn(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="pcs-field">
        <span>{ar}</span>
        <Control
          rows={multiline ? 4 : undefined}
          value={arValue || ''}
          onChange={(e) => onAr(e.target.value)}
          disabled={disabled}
          dir="rtl"
        />
      </label>
    </div>
  );
}

export default function PageCopyManager({initialDocument, canWrite}) {
  const router = useRouter();
  const pages = initialDocument?.pages || {};
  const [pageId, setPageId] = useState('about');
  const [section, setSection] = useState('hero');
  const [docs, setDocs] = useState(pages);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hasChrome = CHROME_PAGES.has(pageId);
  const current = docs[pageId] || {pageId};
  const tabs = useMemo(
    () =>
      hasChrome
        ? [
            {id: 'hero', label: 'Hero'},
            {id: 'cta', label: 'Bottom CTA'},
            {id: 'meta', label: 'Page info'},
          ]
        : [{id: 'meta', label: 'Page info'}],
    [hasChrome],
  );

  function setField(key, value) {
    setDocs((prev) => ({
      ...prev,
      [pageId]: {...(prev[pageId] || {pageId}), pageId, [key]: value},
    }));
    setMessage('');
  }

  async function onSave() {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {...(docs[pageId] || {pageId}), pageId};
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'page-copy', pageId, document: payload}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDocs((prev) => ({...prev, [pageId]: data.document || payload}));
      setMessage('Saved');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const previewTitle = current.heroTitleEn || current.titleEn || PAGE_OPTIONS.find((p) => p.id === pageId)?.label;
  const previewLede = current.heroLedeEn || current.ledeEn || '';
  const previewImage = current.heroImage || '';

  return (
    <div className="pcs">
      <nav className="pcs-pages" aria-label="Website pages">
        {PAGE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={pageId === opt.id ? 'is-active' : ''}
            onClick={() => {
              setPageId(opt.id);
              setSection(CHROME_PAGES.has(opt.id) ? 'hero' : 'meta');
              setError('');
              setMessage('');
            }}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      <div className="pcs-shell">
        <section className="pcs-editor">
          <div className="pcs-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={section === tab.id ? 'is-active' : ''}
                onClick={() => setSection(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pcs-body">
            {section === 'meta' ? (
              <>
                <Pair
                  en="Page title"
                  ar="عنوان الصفحة"
                  enValue={current.titleEn}
                  arValue={current.titleAr}
                  onEn={(v) => setField('titleEn', v)}
                  onAr={(v) => setField('titleAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Short label"
                  ar="تسمية قصيرة"
                  enValue={current.eyebrowEn}
                  arValue={current.eyebrowAr}
                  onEn={(v) => setField('eyebrowEn', v)}
                  onAr={(v) => setField('eyebrowAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Summary"
                  ar="الملخص"
                  multiline
                  enValue={current.ledeEn}
                  arValue={current.ledeAr}
                  onEn={(v) => setField('ledeEn', v)}
                  onAr={(v) => setField('ledeAr', v)}
                  disabled={!canWrite}
                />
              </>
            ) : null}

            {section === 'hero' && hasChrome ? (
              <>
                <MediaPicker
                  label="Hero image"
                  value={String(current.heroImage || '')}
                  onChange={(url) => setField('heroImage', url)}
                  canWrite={canWrite}
                  enableFocal
                  focalValue={String(current.heroImageFocal || '50% 50%')}
                  onFocalChange={(focal) => setField('heroImageFocal', focal)}
                />
                <Pair
                  en="Headline"
                  ar="العنوان"
                  enValue={current.heroTitleEn}
                  arValue={current.heroTitleAr}
                  onEn={(v) => setField('heroTitleEn', v)}
                  onAr={(v) => setField('heroTitleAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Intro text"
                  ar="النص التعريفي"
                  multiline
                  enValue={current.heroLedeEn}
                  arValue={current.heroLedeAr}
                  onEn={(v) => setField('heroLedeEn', v)}
                  onAr={(v) => setField('heroLedeAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Button text"
                  ar="نص الزر"
                  enValue={current.heroCtaLabelEn}
                  arValue={current.heroCtaLabelAr}
                  onEn={(v) => setField('heroCtaLabelEn', v)}
                  onAr={(v) => setField('heroCtaLabelAr', v)}
                  disabled={!canWrite}
                />
                <label className="pcs-field">
                  <span>Button link</span>
                  <input
                    value={current.heroCtaHref || ''}
                    onChange={(e) => setField('heroCtaHref', e.target.value)}
                    disabled={!canWrite}
                    placeholder="/en/contact"
                  />
                </label>
              </>
            ) : null}

            {section === 'cta' && hasChrome ? (
              <>
                <MediaPicker
                  label="CTA image"
                  value={String(current.ctaImage || '')}
                  onChange={(url) => setField('ctaImage', url)}
                  canWrite={canWrite}
                  enableFocal
                  focalValue={String(current.ctaImageFocal || '50% 50%')}
                  onFocalChange={(focal) => setField('ctaImageFocal', focal)}
                />
                <Pair
                  en="Kicker"
                  ar="التسمية العلوية"
                  enValue={current.ctaKickerEn}
                  arValue={current.ctaKickerAr}
                  onEn={(v) => setField('ctaKickerEn', v)}
                  onAr={(v) => setField('ctaKickerAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Title"
                  ar="العنوان"
                  enValue={current.ctaTitleEn}
                  arValue={current.ctaTitleAr}
                  onEn={(v) => setField('ctaTitleEn', v)}
                  onAr={(v) => setField('ctaTitleAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Text"
                  ar="النص"
                  multiline
                  enValue={current.ctaLedeEn}
                  arValue={current.ctaLedeAr}
                  onEn={(v) => setField('ctaLedeEn', v)}
                  onAr={(v) => setField('ctaLedeAr', v)}
                  disabled={!canWrite}
                />
                <Pair
                  en="Primary button"
                  ar="الزر الرئيسي"
                  enValue={current.ctaPrimaryLabelEn}
                  arValue={current.ctaPrimaryLabelAr}
                  onEn={(v) => setField('ctaPrimaryLabelEn', v)}
                  onAr={(v) => setField('ctaPrimaryLabelAr', v)}
                  disabled={!canWrite}
                />
                <label className="pcs-field">
                  <span>Primary button link</span>
                  <input
                    value={current.ctaPrimaryHref || ''}
                    onChange={(e) => setField('ctaPrimaryHref', e.target.value)}
                    disabled={!canWrite}
                  />
                </label>
                <Pair
                  en="Secondary button"
                  ar="الزر الثاني"
                  enValue={current.ctaSecondaryLabelEn}
                  arValue={current.ctaSecondaryLabelAr}
                  onEn={(v) => setField('ctaSecondaryLabelEn', v)}
                  onAr={(v) => setField('ctaSecondaryLabelAr', v)}
                  disabled={!canWrite}
                />
                <label className="pcs-field">
                  <span>Secondary button link</span>
                  <input
                    value={current.ctaSecondaryHref || ''}
                    onChange={(e) => setField('ctaSecondaryHref', e.target.value)}
                    disabled={!canWrite}
                  />
                </label>
              </>
            ) : null}
          </div>

          <footer className="pcs-footer">
            <span>
              {error ? error : message ? message : canWrite ? 'English and Arabic save together.' : 'View only'}
            </span>
            <button type="button" onClick={onSave} disabled={!canWrite || saving}>
              {saving ? 'Saving…' : 'Save page'}
            </button>
          </footer>
        </section>

        <aside className="pcs-preview">
          <header>
            <strong>Live preview</strong>
            <p>How the {PAGE_OPTIONS.find((p) => p.id === pageId)?.label} hero will read on the website.</p>
          </header>
          <div className="pcs-preview-hero">
            {previewImage ? (
              <img src={previewImage} alt="" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: current.heroImageFocal || '50% 50%'}} />
            ) : null}
            <div>
              <small>{current.eyebrowEn || 'ASAS'}</small>
              <h3>{previewTitle}</h3>
              {previewLede ? <p>{previewLede}</p> : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
