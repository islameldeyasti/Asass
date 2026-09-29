'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import {
  descriptionLengthHint,
  seoChecklist,
  titleLengthHint,
} from '@/lib/cms/seo/model';

const SCHEMA_TYPES = [
  '',
  'Organization',
  'WebSite',
  'Service',
  'Article',
  'Person',
  'JobPosting',
  'FAQPage',
  'AboutPage',
  'ContactPage',
  'CreativeWork',
];

function HintBar({hint, goodLabel = 'Ideal length'}) {
  const tone = hint.status === 'good' ? 'is-good' : hint.status === 'warn' ? 'is-warn' : 'is-bad';
  return (
    <div className={`cms-seo-hint ${tone}`}>
      <span>{adminText(hint.count)}{adminText(" characters")}</span>
      <em>
        {adminText(hint.status === 'good'
          ? goodLabel
          : hint.status === 'warn'
            ? 'Slightly off ideal range'
            : 'Outside recommended range')}
      </em>
    </div>
  );
}

function SerpPreview({
  mode,
  title,
  description,
  path,
  locale,
}) {
  const host = 'www.asasengg.ae';
  const displayPath = path ? `/${locale}/${path}` : `/${locale}`;
  const truncatedTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const truncatedDesc =
    description.length > 160 ? `${description.slice(0, 157)}…` : description;

  return (
    <div className={`cms-seo-serp is-${mode}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="cms-seo-serp-url">
        <span className="cms-seo-serp-favicon" aria-hidden />
        <div>
          <strong>{adminText(host)}</strong>
          <span>
            {adminText(host)}
            {adminText(displayPath)}
          </span>
        </div>
      </div>
      <h4>{adminText(truncatedTitle || 'Page title preview')}</h4>
      <p>{adminText(truncatedDesc || 'Meta description will appear here once you add copy.')}</p>
    </div>
  );
}

function SocialCard({title, description, image, path, locale}) {
  const displayPath = path ? `asasengg.ae/${locale}/${path}` : `asasengg.ae/${locale}`;
  return (
    <div className="cms-seo-social-card" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="cms-seo-social-media">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={adminText("")} />
        ) : (
          <div className="cms-seo-social-empty">{adminText("No OG image")}</div>
        )}
      </div>
      <div className="cms-seo-social-body">
        <span>{adminText(displayPath)}</span>
        <strong>{adminText(title || 'Social title')}</strong>
        <p>{adminText(description || 'Social description preview')}</p>
      </div>
    </div>
  );
}

/**
 * Reusable SEO editor for one page/record.
 */
export default function SeoPanel({
  value,
  onChange,
  canWrite = false,
  fallbackTitle = '',
  fallbackDescription = '',
  path = '',
  localePreview = 'en',
}) {
  const [lang, setLang] = useState(localePreview === 'ar' ? 'ar' : 'en');
  const [serpMode, setSerpMode] = useState('desktop');

  const record = useMemo(() => value || {}, [value]);

  function setField(key, nextValue) {
    if (!canWrite || !onChange) return;
    onChange({...record, [key]: nextValue});
  }

  const titleKey = lang === 'ar' ? 'titleAr' : 'titleEn';
  const descKey = lang === 'ar' ? 'descriptionAr' : 'descriptionEn';
  const ogTitleKey = lang === 'ar' ? 'ogTitleAr' : 'ogTitleEn';
  const ogDescKey = lang === 'ar' ? 'ogDescriptionAr' : 'ogDescriptionEn';

  const titleValue = record[titleKey] || '';
  const descValue = record[descKey] || '';
  const previewTitle = titleValue || fallbackTitle || record.labelEn || 'Untitled page';
  const previewDesc = descValue || fallbackDescription || '';
  const ogTitle = record[ogTitleKey] || previewTitle;
  const ogDesc = record[ogDescKey] || previewDesc;

  const titleHint = useMemo(() => titleLengthHint(titleValue), [titleValue]);
  const descHint = useMemo(() => descriptionLengthHint(descValue), [descValue]);
  const checklist = useMemo(() => seoChecklist(record), [record]);
  const scorePct = checklist.max ? Math.round((checklist.score / checklist.max) * 100) : 0;

  return (
    <div className="cms-seo-panel cms-stack">
      <div className="cms-i18n-tablist" role="tablist" aria-label={adminText("Language")}>
        <button
          type="button"
          role="tab"
          aria-selected={lang === 'en'}
          className={`cms-i18n-tab${lang === 'en' ? ' is-active' : ''}`}
          onClick={() => setLang('en')}
        >{adminText("EN")}</button>
        <button
          type="button"
          role="tab"
          aria-selected={lang === 'ar'}
          className={`cms-i18n-tab${lang === 'ar' ? ' is-active' : ''}`}
          onClick={() => setLang('ar')}
        >{adminText("AR")}</button>
      </div>

      <section className="cms-drawer-section">
        <div className="cms-seo-section-head">
          <h3>{adminText("Search appearance")}</h3>
          <div className="cms-seo-toggle" role="group" aria-label={adminText("SERP preview size")}>
            <button
              type="button"
              className={serpMode === 'desktop' ? 'is-active' : ''}
              onClick={() => setSerpMode('desktop')}
            >{adminText("Desktop")}</button>
            <button
              type="button"
              className={serpMode === 'mobile' ? 'is-active' : ''}
              onClick={() => setSerpMode('mobile')}
            >{adminText("Mobile")}</button>
          </div>
        </div>

        <div className="cms-field">
          <label htmlFor={`seo-title-${lang}`}>{adminText("Title (")}{adminText(lang.toUpperCase())})</label>
          <input
            id={`seo-title-${lang}`}
            value={titleValue}
            onChange={(e) => setField(titleKey, e.target.value)}
            disabled={!canWrite}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            placeholder={adminText(fallbackTitle || 'Page title')}
          />
          <HintBar hint={titleHint} goodLabel="Ideal 30–60 characters" />
        </div>

        <SerpPreview
          mode={serpMode}
          title={adminText(previewTitle)}
          description={adminText(previewDesc)}
          path={path || record.path || ''}
          locale={lang}
        />

        <div className="cms-field">
          <label htmlFor={`seo-desc-${lang}`}>{adminText("Meta description (")}{adminText(lang.toUpperCase())})</label>
          <textarea
            id={`seo-desc-${lang}`}
            rows={3}
            value={descValue}
            onChange={(e) => setField(descKey, e.target.value)}
            disabled={!canWrite}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            placeholder={adminText(fallbackDescription || 'Meta description')}
          />
          <HintBar hint={descHint} goodLabel="Ideal 120–160 characters" />
        </div>
      </section>

      <section className="cms-drawer-section">
        <h3>{adminText("Social")}</h3>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor={`seo-og-title-${lang}`}>{adminText("OG title (")}{adminText(lang.toUpperCase())})</label>
            <input
              id={`seo-og-title-${lang}`}
              value={record[ogTitleKey] || ''}
              onChange={(e) => setField(ogTitleKey, e.target.value)}
              disabled={!canWrite}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              placeholder={adminText(previewTitle)}
            />
          </div>
          <div className="cms-field">
            <label htmlFor={`seo-og-desc-${lang}`}>{adminText("OG description (")}{adminText(lang.toUpperCase())})</label>
            <textarea
              id={`seo-og-desc-${lang}`}
              rows={2}
              value={record[ogDescKey] || ''}
              onChange={(e) => setField(ogDescKey, e.target.value)}
              disabled={!canWrite}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              placeholder={adminText(previewDesc)}
            />
          </div>
        </div>
        <MediaPicker
          label={adminText("OG image")}
          value={record.ogImage || ''}
          onChange={(url) => setField('ogImage', url)}
          mode="IMAGE"
          canWrite={canWrite}
          cropAspect={1.91}
          focalValue={record.ogImageFocal || '50% 50%'}
          onFocalChange={(focal) => setField('ogImageFocal', focal)}
        />
        <SocialCard
          title={adminText(ogTitle)}
          description={adminText(ogDesc)}
          image={record.ogImage || ''}
          path={path || record.path || ''}
          locale={lang}
        />
      </section>

      <section className="cms-drawer-section">
        <h3>{adminText("Indexing")}</h3>
        <div className="cms-grid-2">
          <fieldset className="cms-seo-radios" disabled={!canWrite}>
            <legend>{adminText("Robots index")}</legend>
            <label>
              <input
                type="radio"
                name="robotsIndex"
                checked={record.robotsIndex !== false}
                onChange={() => setField('robotsIndex', true)}
              />{adminText("Index")}</label>
            <label>
              <input
                type="radio"
                name="robotsIndex"
                checked={record.robotsIndex === false}
                onChange={() => setField('robotsIndex', false)}
              />{adminText("Noindex")}</label>
          </fieldset>
          <fieldset className="cms-seo-radios" disabled={!canWrite}>
            <legend>{adminText("Robots follow")}</legend>
            <label>
              <input
                type="radio"
                name="robotsFollow"
                checked={record.robotsFollow !== false}
                onChange={() => setField('robotsFollow', true)}
              />{adminText("Follow")}</label>
            <label>
              <input
                type="radio"
                name="robotsFollow"
                checked={record.robotsFollow === false}
                onChange={() => setField('robotsFollow', false)}
              />{adminText("Nofollow")}</label>
          </fieldset>
        </div>
      </section>

      <section className="cms-drawer-section">
        <div className="cms-seo-section-head">
          <h3>{adminText("Checklist")}</h3>
          <strong className="cms-seo-score">
            {adminText(checklist.score)}/{adminText(checklist.max)} · {adminText(scorePct)}%
          </strong>
        </div>
        <div className="cms-seo-progress" aria-hidden>
          <span style={{width: `${scorePct}%`}} />
        </div>
        <ul className="cms-seo-checklist">
          {checklist.items.map((item) => (
            <li key={item.id} className={item.ok ? 'is-ok' : 'is-miss'}>
              <span aria-hidden>{adminText(item.ok ? '✓' : '○')}</span>
              {adminText(item.label)}
            </li>
          ))}
        </ul>
      </section>

      <details className="cms-seo-advanced">
        <summary>{adminText("Advanced")}</summary>
        <div className="cms-stack" style={{marginTop: 12}}>
          <div className="cms-field">
            <label htmlFor="seo-canonical">{adminText("Canonical override")}</label>
            <input
              id="seo-canonical"
              value={record.canonicalOverride || ''}
              onChange={(e) => setField('canonicalOverride', e.target.value)}
              disabled={!canWrite}
              placeholder={adminText("https://www.asasengg.ae/en/…")}
            />
          </div>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={record.sitemapInclude !== false}
              onChange={(e) => setField('sitemapInclude', e.target.checked)}
              disabled={!canWrite}
            />{adminText("Include in sitemap")}</label>
          <div className="cms-field">
            <label htmlFor="seo-schema">{adminText("Schema type")}</label>
            <select
              id="seo-schema"
              value={record.schemaType || ''}
              onChange={(e) => setField('schemaType', e.target.value)}
              disabled={!canWrite}
            >
              {SCHEMA_TYPES.map((type) => (
                <option key={type || 'none'} value={type}>
                  {adminText(type || 'Auto / none')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>
    </div>
  );
}
