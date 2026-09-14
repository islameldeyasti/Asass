'use client';

import {useState} from 'react';
import MediaPicker from '@/components/admin/media/MediaPicker';

/**
 * Global SEO defaults form (also embedded concepts live in SeoControlCenter Defaults tab).
 */
export default function SeoSettingsForm({initialSettings, canWrite}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function setField(key, value) {
    setSettings((prev) => ({...prev, [key]: value}));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.settings);
      setMessage('SEO settings saved.');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="cms-card cms-stack" onSubmit={onSubmit}>
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      <div>
        <h2 className="cms-dash-section-title" style={{marginTop: 0}}>
          Site identity
        </h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="siteNameEn">Site name (EN)</label>
            <input
              id="siteNameEn"
              value={settings.siteNameEn || ''}
              onChange={(e) => setField('siteNameEn', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="siteNameAr">Site name (AR)</label>
            <input
              id="siteNameAr"
              value={settings.siteNameAr || ''}
              onChange={(e) => setField('siteNameAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="cms-dash-section-title">Default metadata</h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="defaultTitleEn">Default title (EN)</label>
            <input
              id="defaultTitleEn"
              value={settings.defaultTitleEn || ''}
              onChange={(e) => setField('defaultTitleEn', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultTitleAr">Default title (AR)</label>
            <input
              id="defaultTitleAr"
              value={settings.defaultTitleAr || ''}
              onChange={(e) => setField('defaultTitleAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="titleTemplateEn">Title template (EN)</label>
            <input
              id="titleTemplateEn"
              value={settings.titleTemplateEn || ''}
              onChange={(e) => setField('titleTemplateEn', e.target.value)}
              disabled={!canWrite}
              placeholder="%page% | ASAS Engineering"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="titleTemplateAr">Title template (AR)</label>
            <input
              id="titleTemplateAr"
              value={settings.titleTemplateAr || ''}
              onChange={(e) => setField('titleTemplateAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
              placeholder="%page% | أساس للهندسة"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultDescriptionEn">Default description (EN)</label>
            <textarea
              id="defaultDescriptionEn"
              value={settings.defaultDescriptionEn || ''}
              onChange={(e) => setField('defaultDescriptionEn', e.target.value)}
              disabled={!canWrite}
              rows={3}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultDescriptionAr">Default description (AR)</label>
            <textarea
              id="defaultDescriptionAr"
              value={settings.defaultDescriptionAr || ''}
              onChange={(e) => setField('defaultDescriptionAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="cms-dash-section-title">Technical SEO</h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="canonicalBase">Canonical base URL</label>
            <input
              id="canonicalBase"
              value={settings.canonicalBase || ''}
              onChange={(e) => setField('canonicalBase', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <MediaPicker
            label="Default OG image"
            value={settings.defaultOgImage || ''}
            onChange={(url) => setField('defaultOgImage', url)}
            mode="IMAGE"
            canWrite={canWrite}
            cropAspect={1.91}
          />
          <div className="cms-field">
            <label htmlFor="googleAnalyticsId">Google Analytics ID</label>
            <input
              id="googleAnalyticsId"
              value={settings.googleAnalyticsId || ''}
              onChange={(e) => setField('googleAnalyticsId', e.target.value)}
              disabled={!canWrite}
              placeholder="G-XXXXXXXX"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="googleTagManagerId">Google Tag Manager ID</label>
            <input
              id="googleTagManagerId"
              value={settings.googleTagManagerId || ''}
              onChange={(e) => setField('googleTagManagerId', e.target.value)}
              disabled={!canWrite}
              placeholder="GTM-XXXXXXX"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="searchConsoleVerification">Search Console verification</label>
            <input
              id="searchConsoleVerification"
              value={settings.searchConsoleVerification || ''}
              onChange={(e) => setField('searchConsoleVerification', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="metaPixelId">Meta Pixel ID</label>
            <input
              id="metaPixelId"
              value={settings.metaPixelId || ''}
              onChange={(e) => setField('metaPixelId', e.target.value)}
              disabled={!canWrite}
            />
          </div>
        </div>

        <div className="cms-grid-3" style={{marginTop: 12}}>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.robotsIndex)}
              onChange={(e) => setField('robotsIndex', e.target.checked)}
              disabled={!canWrite}
            />
            Allow indexing
          </label>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.robotsFollow)}
              onChange={(e) => setField('robotsFollow', e.target.checked)}
              disabled={!canWrite}
            />
            Allow follow
          </label>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.organizationJsonLd)}
              onChange={(e) => setField('organizationJsonLd', e.target.checked)}
              disabled={!canWrite}
            />
            Organization JSON-LD
          </label>
        </div>
      </div>

      {canWrite ? (
        <button className="cms-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save SEO settings'}
        </button>
      ) : (
        <p style={{margin: 0, color: 'var(--cms-muted)'}}>You have read-only access to SEO.</p>
      )}
    </form>
  );
}
