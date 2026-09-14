'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import MediaPicker from '@/components/admin/media/MediaPicker';

function getByPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setByPath(obj, path, value) {
  if (!path.includes('.')) return {...obj, [path]: value};
  const parts = path.split('.');
  const next = Array.isArray(obj) ? [...obj] : {...obj};
  let cursor = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const child = cursor[part];
    cursor[part] = Array.isArray(child) ? [...child] : {...(child || {})};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

function toUiValue(doc, field) {
  const raw = getByPath(doc, field.key);
  if (field.type === 'json') return JSON.stringify(raw ?? (field.defaultValue ?? null), null, 2);
  if (field.type === 'checkbox') return Boolean(raw);
  if (field.type === 'number') return raw ?? '';
  return raw == null ? '' : raw;
}

const HOMEPAGE_SECTION_LABELS = {
  hero: 'Hero carousel',
  about: 'About ASAS',
  clients: 'Clients',
  services: 'Services',
  stats: 'Key statistics',
  sectors: 'Sectors',
  process: 'Our process',
  portfolio: 'Portfolio',
  why: 'Why ASAS',
  testimonials: 'Testimonials',
  team: 'Leadership team',
  contact: 'Contact',
  faq: 'FAQs',
};

export default function DocumentForm({
  title,
  resource,
  initialValue,
  fields = [],
  canWrite = false,
  pageId = null,
  sectionEditor = false,
  navEditor = false,
  faqEditor = false,
  aboutEditor = false,
  heroSlidesEditor = false,
  sectorCardsEditor = false,
}) {
  const router = useRouter();
  const [doc, setDoc] = useState(initialValue || {});
  const [jsonDrafts, setJsonDrafts] = useState(() => {
    const map = {};
    for (const field of fields) {
      if (field.type === 'json') map[field.key] = toUiValue(initialValue || {}, field);
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fieldRows = useMemo(() => {
    const map = Object.fromEntries(fields.map((f) => [f.key, f]));
    const rows = [];
    const used = new Set();
    for (const field of fields) {
      if (used.has(field.key) || field.key.endsWith('Ar')) continue;
      const enPairedAr =
        field.key.endsWith('En') && map[`${field.key.slice(0, -2)}Ar`]
          ? map[`${field.key.slice(0, -2)}Ar`]
          : null;
      const pairedAr = enPairedAr || map[`${field.key}Ar`] || null;
      if (pairedAr && field.type === pairedAr.type) {
        used.add(field.key);
        used.add(pairedAr.key);
        rows.push([field, {...pairedAr, dir: pairedAr.dir || 'rtl'}]);
      } else {
        used.add(field.key);
        rows.push([field]);
      }
    }
    for (const field of fields) {
      if (!used.has(field.key)) {
        used.add(field.key);
        rows.push([field]);
      }
    }
    return rows;
  }, [fields]);

  function setField(key, value) {
    setDoc((current) => setByPath(current || {}, key, value));
  }

  function updateSection(index, patch) {
    setDoc((current) => {
      const sections = [...(current.sections || [])];
      sections[index] = {...sections[index], ...patch};
      return {...current, sections};
    });
  }

  function updateNavItem(index, patch) {
    setDoc((current) => {
      const items = [...(current.items || [])];
      items[index] = {...items[index], ...patch};
      return {...current, items};
    });
  }

  function updateFaq(index, patch) {
    setDoc((current) => {
      const faqs = [...(current.faqs || [])];
      faqs[index] = {...faqs[index], ...patch};
      return {...current, faqs};
    });
  }

  function updateAbout(patch) {
    setDoc((current) => ({
      ...current,
      about: {...(current.about || {}), ...patch},
    }));
  }

  function updateHeroSlide(index, patch) {
    setDoc((current) => {
      const heroSlides = [...(current.heroSlides || [])];
      heroSlides[index] = {...heroSlides[index], ...patch};
      return {...current, heroSlides};
    });
  }

  function updateSectorCard(index, patch) {
    setDoc((current) => {
      const sectorCards = [...(current.sectorCards || [])];
      sectorCards[index] = {...sectorCards[index], ...patch};
      return {...current, sectorCards};
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      let payload = {...doc};
      for (const field of fields) {
        if (field.type === 'json') {
          const text = jsonDrafts[field.key] ?? toUiValue(doc, field);
          payload = setByPath(payload, field.key, JSON.parse(text || 'null'));
        } else if (field.type === 'number') {
          const raw = getByPath(payload, field.key);
          if (raw === '' || raw == null) {
            payload = setByPath(payload, field.key, null);
          } else {
            const num = Number(raw);
            payload = setByPath(payload, field.key, Number.isFinite(num) ? num : raw);
          }
        }
      }

      const body =
        resource === 'page-copy'
          ? {resource, pageId: pageId || payload.pageId, document: payload}
          : {resource, document: payload};

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDoc(data.document);
      setMessage('Saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function renderField(field) {
    const disabled = !canWrite;
    if (field.type === 'checkbox') {
      return (
        <label className="adm-check" style={{marginTop: 0}}>
          <input
            type="checkbox"
            checked={Boolean(getByPath(doc, field.key))}
            onChange={(e) => setField(field.key, e.target.checked)}
            disabled={disabled}
          />
          {field.label}
        </label>
      );
    }

    if (field.type === 'json') {
      return (
        <div className="adm-field">
          <label htmlFor={`df-${field.key}`}>{field.label}</label>
          <textarea
            id={`df-${field.key}`}
            rows={field.rows || 8}
            value={jsonDrafts[field.key] ?? toUiValue(doc, field)}
            onChange={(e) => setJsonDrafts((prev) => ({...prev, [field.key]: e.target.value}))}
            disabled={disabled}
            style={{fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12}}
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div className="adm-field">
          <label htmlFor={`df-${field.key}`}>{field.label}</label>
          <textarea
            id={`df-${field.key}`}
            rows={field.rows || 4}
            value={toUiValue(doc, field)}
            dir={field.dir}
            onChange={(e) => setField(field.key, e.target.value)}
            disabled={disabled}
          />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div className="adm-field">
          <label htmlFor={`df-${field.key}`}>{field.label}</label>
          <select
            id={`df-${field.key}`}
            value={toUiValue(doc, field)}
            onChange={(e) => setField(field.key, e.target.value)}
            disabled={disabled}
          >
            {(field.options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'image' || field.type === 'media') {
      const focalKey = field.focalKey || (field.type === 'image' ? `${field.key}Focal` : null);
      return (
        <MediaPicker
          label={field.label}
          value={String(toUiValue(doc, field) || '')}
          onChange={(url) => setField(field.key, url)}
          mode={field.mode || (field.type === 'media' ? 'DOCUMENT' : 'IMAGE')}
          canWrite={canWrite}
          enableFocal={field.type === 'image' && Boolean(focalKey)}
          focalValue={focalKey ? String(getByPath(doc, focalKey) || '50% 50%') : '50% 50%'}
          onFocalChange={
            focalKey
              ? (focal) => setField(focalKey, focal)
              : undefined
          }
        />
      );
    }

    return (
      <div className="adm-field">
        <label htmlFor={`df-${field.key}`}>{field.label}</label>
        <input
          id={`df-${field.key}`}
          type={field.type === 'number' ? 'number' : 'text'}
          value={toUiValue(doc, field)}
          dir={field.dir}
          onChange={(e) =>
            setField(field.key, field.type === 'number' ? e.target.value : e.target.value)
          }
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <form className="adm-card" onSubmit={onSubmit}>
      {title ? (
        <h2 className="adm-section-title" style={{marginTop: 0}}>
          {title}
        </h2>
      ) : null}
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      {sectionEditor ? (
        <>
          <h2 className="adm-section-title">Homepage sections</h2>
          <p className="adm-section-help">
            Turn sections on or off and set the order visitors see them. Lower numbers appear first.
          </p>
          <div className="adm-section-list">
            {(doc.sections || []).map((section, index) => (
              <div key={section.id || index} className="adm-section-row">
                <div>
                  <strong>{HOMEPAGE_SECTION_LABELS[section.id] || section.id}</strong>
                  <span>{section.id}</span>
                </div>
                <label className="adm-switch">
                  <input
                    type="checkbox"
                    checked={section.enabled !== false}
                    disabled={!canWrite}
                    onChange={(e) => updateSection(index, {enabled: e.target.checked})}
                  />
                  <span className="adm-switch-track" aria-hidden />
                  <span>{section.enabled !== false ? 'Visible' : 'Hidden'}</span>
                </label>
                <div className="adm-field" style={{marginBottom: 0, maxWidth: 100}}>
                  <label htmlFor={`section-order-${index}`}>Order</label>
                  <input
                    id={`section-order-${index}`}
                    type="number"
                    value={section.order ?? ''}
                    disabled={!canWrite}
                    onChange={(e) => updateSection(index, {order: Number(e.target.value) || 0})}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {heroSlidesEditor ? (
        <>
          <h2 className="adm-section-title">Hero slides</h2>
          <p className="adm-section-help">
            Photos and text for the homepage hero carousel. Upload or choose from the media library.
          </p>
          {(doc.heroSlides || []).map((slide, index) => (
            <div
              key={slide.id || index}
              className="adm-card"
              style={{marginBottom: 16, padding: 14, display: 'grid', gap: 10}}
            >
              <strong>
                Slide {index + 1}
                {slide.strip ? ` · ${slide.strip}` : ''}
              </strong>
              <MediaPicker
                label="Slide image"
                value={slide.image || ''}
                canWrite={canWrite}
                onChange={(url) => updateHeroSlide(index, {image: url || ''})}
                focalValue={slide.crop || '50% 50%'}
                onFocalChange={(crop) => updateHeroSlide(index, {crop})}
              />
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Title (EN)</label>
                  <input
                    value={slide.title || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {title: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Title (AR)</label>
                  <input
                    dir="rtl"
                    value={slide.titleAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {titleAr: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Note (EN)</label>
                  <textarea
                    rows={3}
                    value={slide.note || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {note: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Note (AR)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={slide.noteAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {noteAr: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Location (EN)</label>
                  <input
                    value={slide.location || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {location: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Location (AR)</label>
                  <input
                    dir="rtl"
                    value={slide.locationAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateHeroSlide(index, {locationAr: e.target.value})}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {sectorCardsEditor ? (
        <>
          <h2 className="adm-section-title">Sector cards</h2>
          <p style={{marginTop: 0, color: '#5b6472', fontSize: 14}}>
            Homepage sector mosaic images and labels.
          </p>
          {(doc.sectorCards || []).map((card, index) => (
            <div
              key={card.key || index}
              className="adm-card"
              style={{marginBottom: 16, padding: 14, display: 'grid', gap: 10}}
            >
              <strong>{card.title || card.key || `Card ${index + 1}`}</strong>
              <MediaPicker
                label="Card image"
                value={card.image || ''}
                canWrite={canWrite}
                onChange={(url) => updateSectorCard(index, {image: url || ''})}
                focalValue={card.crop || '50% 50%'}
                onFocalChange={(crop) => updateSectorCard(index, {crop})}
              />
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Title (EN)</label>
                  <input
                    value={card.title || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateSectorCard(index, {title: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Title (AR)</label>
                  <input
                    dir="rtl"
                    value={card.titleAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateSectorCard(index, {titleAr: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Copy (EN)</label>
                  <textarea
                    rows={2}
                    value={card.copy || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateSectorCard(index, {copy: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Copy (AR)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={card.copyAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateSectorCard(index, {copyAr: e.target.value})}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {aboutEditor ? (
        <>
          <h2 className="adm-section-title">About block</h2>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="about-titleEn">Title (EN)</label>
              <input
                id="about-titleEn"
                value={doc.about?.titleEn || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({titleEn: e.target.value})}
              />
            </div>
            <div className="adm-field">
              <label htmlFor="about-titleAr">Title (AR)</label>
              <input
                id="about-titleAr"
                dir="rtl"
                value={doc.about?.titleAr || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({titleAr: e.target.value})}
              />
            </div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="about-bodyEn">Body (EN)</label>
              <textarea
                id="about-bodyEn"
                rows={5}
                value={doc.about?.bodyEn || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({bodyEn: e.target.value})}
              />
            </div>
            <div className="adm-field">
              <label htmlFor="about-bodyAr">Body (AR)</label>
              <textarea
                id="about-bodyAr"
                rows={5}
                dir="rtl"
                value={doc.about?.bodyAr || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({bodyAr: e.target.value})}
              />
            </div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="about-noteEn">Note (EN)</label>
              <textarea
                id="about-noteEn"
                rows={3}
                value={doc.about?.noteEn || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({noteEn: e.target.value})}
              />
            </div>
            <div className="adm-field">
              <label htmlFor="about-noteAr">Note (AR)</label>
              <textarea
                id="about-noteAr"
                rows={3}
                dir="rtl"
                value={doc.about?.noteAr || ''}
                disabled={!canWrite}
                onChange={(e) => updateAbout({noteAr: e.target.value})}
              />
            </div>
          </div>
          <div className="adm-field" style={{marginTop: 12}}>
            <MediaPicker
              label="About image"
              value={doc.about?.image || ''}
              canWrite={canWrite}
              onChange={(url) => updateAbout({image: url})}
              focalValue={doc.about?.crop || '50% 50%'}
              onFocalChange={(crop) => updateAbout({crop})}
            />
          </div>
        </>
      ) : null}

      {faqEditor ? (
        <>
          <h2 className="adm-section-title">FAQs</h2>
          {(doc.faqs || []).map((faq, index) => (
            <div key={faq.id || index} style={{marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(7,4,99,0.08)'}}>
              <strong style={{display: 'block', marginBottom: 10}}>{faq.id || `FAQ ${index + 1}`}</strong>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Question (EN)</label>
                  <input
                    value={faq.questionEn || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateFaq(index, {questionEn: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Question (AR)</label>
                  <input
                    dir="rtl"
                    value={faq.questionAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateFaq(index, {questionAr: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label>Answer (EN)</label>
                  <textarea
                    rows={3}
                    value={faq.answerEn || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateFaq(index, {answerEn: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>Answer (AR)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={faq.answerAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateFaq(index, {answerAr: e.target.value})}
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {navEditor ? (
        <>
          <h2 className="adm-section-title">Main menu</h2>
          <p className="adm-section-help">
            Edit labels visitors see in the site header. Use arrows conceptually via order — lower numbers appear first.
          </p>
          <div className="adm-link-list">
            {(doc.items || []).map((item, index) => (
              <div key={item.id || index} className="adm-link-row">
                <div className="adm-grid-2" style={{flex: 1}}>
                  <div className="adm-field" style={{marginBottom: 0}}>
                    <label>Label (English)</label>
                    <input
                      value={item.label || ''}
                      disabled={!canWrite}
                      onChange={(e) => updateNavItem(index, {label: e.target.value})}
                    />
                  </div>
                  <div className="adm-field" style={{marginBottom: 0}}>
                    <label>Label (Arabic)</label>
                    <input
                      dir="rtl"
                      value={item.labelAr || ''}
                      disabled={!canWrite}
                      onChange={(e) => updateNavItem(index, {labelAr: e.target.value})}
                    />
                  </div>
                  <div className="adm-field" style={{marginBottom: 0}}>
                    <label>Page</label>
                    <input
                      value={item.path || ''}
                      disabled={!canWrite}
                      onChange={(e) => updateNavItem(index, {path: e.target.value})}
                    />
                  </div>
                  <div className="adm-field" style={{marginBottom: 0, maxWidth: 120}}>
                    <label>Order</label>
                    <input
                      type="number"
                      value={item.order ?? ''}
                      disabled={!canWrite}
                      onChange={(e) => updateNavItem(index, {order: Number(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <label className="adm-switch">
                  <input
                    type="checkbox"
                    checked={!item.hidden}
                    disabled={!canWrite}
                    onChange={(e) => updateNavItem(index, {hidden: !e.target.checked})}
                  />
                  <span className="adm-switch-track" aria-hidden />
                  <span>{item.hidden ? 'Hidden' : 'Visible'}</span>
                </label>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {fieldRows.map((row) =>
        row.length === 2 ? (
          <div className="adm-grid-2" key={row[0].key}>
            {row.map((field) => (
              <div key={field.key}>{renderField(field)}</div>
            ))}
          </div>
        ) : (
          <div key={row[0].key}>{renderField(row[0])}</div>
        ),
      )}

      {canWrite ? (
        <div style={{marginTop: 16}}>
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      ) : (
        <p style={{marginTop: 16, color: '#5b6472', fontSize: 14}}>Read-only for your role.</p>
      )}
    </form>
  );
}
