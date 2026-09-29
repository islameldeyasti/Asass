'use client';
import {adminText} from '@/lib/admin/translate';


import {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {AlertTriangle, Search} from 'lucide-react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import {useToast} from '@/components/admin/ui/ToastProvider';
import {emptyPageSeo, seoChecklist} from '@/lib/cms/seo/model';
import SeoBulkEditor from './SeoBulkEditor';
import SeoPanel from './SeoPanel';

const TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'issues', label: 'Issues'},
  {id: 'pages', label: 'All pages'},
  {id: 'defaults', label: 'Defaults'},
  {id: 'redirects', label: 'Redirects'},
  {id: 'sitemap', label: 'Sitemap'},
  {id: 'robots', label: 'Robots'},
];

function pathLabel(path) {
  return path ? `/${path}` : '/';
}

function statusForEntry(entry) {
  if (!entry) return 'draft';
  const checklist = seoChecklist(entry);
  if (entry.robotsIndex === false) return 'archived';
  if (checklist.score >= checklist.max - 1) return 'published';
  if (entry.titleEn || entry.descriptionEn) return 'review';
  return 'draft';
}

function statusLabel(status) {
  if (status === 'published') return 'Healthy';
  if (status === 'review') return 'Needs work';
  if (status === 'archived') return 'Noindex';
  return 'Incomplete';
}

function newRedirect() {
  return {
    id: `r_${Date.now().toString(36)}`,
    from: '',
    to: '',
    statusCode: 301,
    enabled: true,
  };
}

function DefaultsForm({initialSettings, canWrite, onSaved}) {
  const {toast} = useToast();
  const [settings, setSettings] = useState(() => initialSettings || {});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setSettings((prev) => ({...prev, [key]: value}));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.settings);
      onSaved?.(data.settings);
      toast({title: 'SEO defaults saved', variant: 'success'});
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save defaults',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="cms-card cms-stack" onSubmit={onSubmit}>
      <div>
        <h2 className="cms-dash-section-title" style={{marginTop: 0}}>{adminText("Site identity")}</h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="siteNameEn">{adminText("Site name (EN)")}</label>
            <input
              id="siteNameEn"
              value={settings.siteNameEn || ''}
              onChange={(e) => setField('siteNameEn', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="siteNameAr">{adminText("Site name (AR)")}</label>
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
        <h2 className="cms-dash-section-title">{adminText("Default metadata")}</h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="defaultTitleEn">{adminText("Default title (EN)")}</label>
            <input
              id="defaultTitleEn"
              value={settings.defaultTitleEn || ''}
              onChange={(e) => setField('defaultTitleEn', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultTitleAr">{adminText("Default title (AR)")}</label>
            <input
              id="defaultTitleAr"
              value={settings.defaultTitleAr || ''}
              onChange={(e) => setField('defaultTitleAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
            />
          </div>
          <div className="cms-field">
            <label htmlFor="titleTemplateEn">{adminText("Title template (EN)")}</label>
            <input
              id="titleTemplateEn"
              value={settings.titleTemplateEn || ''}
              onChange={(e) => setField('titleTemplateEn', e.target.value)}
              disabled={!canWrite}
              placeholder={adminText("%page% | ASAS Engineering")}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="titleTemplateAr">{adminText("Title template (AR)")}</label>
            <input
              id="titleTemplateAr"
              value={settings.titleTemplateAr || ''}
              onChange={(e) => setField('titleTemplateAr', e.target.value)}
              disabled={!canWrite}
              dir="rtl"
              placeholder={adminText("%page% | أساس للهندسة")}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultDescriptionEn">{adminText("Default description (EN)")}</label>
            <textarea
              id="defaultDescriptionEn"
              value={settings.defaultDescriptionEn || ''}
              onChange={(e) => setField('defaultDescriptionEn', e.target.value)}
              disabled={!canWrite}
              rows={3}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="defaultDescriptionAr">{adminText("Default description (AR)")}</label>
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
        <h2 className="cms-dash-section-title">{adminText("Technical SEO")}</h2>
        <div className="cms-grid-2">
          <div className="cms-field">
            <label htmlFor="canonicalBase">{adminText("Canonical base URL")}</label>
            <input
              id="canonicalBase"
              value={settings.canonicalBase || ''}
              onChange={(e) => setField('canonicalBase', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <MediaPicker
            label={adminText("Default OG image")}
            value={settings.defaultOgImage || ''}
            onChange={(url) => setField('defaultOgImage', url)}
            mode="IMAGE"
            canWrite={canWrite}
            cropAspect={1.91}
          />
          <div className="cms-field">
            <label htmlFor="googleAnalyticsId">{adminText("Google Analytics ID")}</label>
            <input
              id="googleAnalyticsId"
              value={settings.googleAnalyticsId || ''}
              onChange={(e) => setField('googleAnalyticsId', e.target.value)}
              disabled={!canWrite}
              placeholder={adminText("G-XXXXXXXX")}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="googleTagManagerId">{adminText("Google Tag Manager ID")}</label>
            <input
              id="googleTagManagerId"
              value={settings.googleTagManagerId || ''}
              onChange={(e) => setField('googleTagManagerId', e.target.value)}
              disabled={!canWrite}
              placeholder={adminText("GTM-XXXXXXX")}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="searchConsoleVerification">{adminText("Search Console verification")}</label>
            <input
              id="searchConsoleVerification"
              value={settings.searchConsoleVerification || ''}
              onChange={(e) => setField('searchConsoleVerification', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="metaPixelId">{adminText("Meta Pixel ID")}</label>
            <input
              id="metaPixelId"
              value={settings.metaPixelId || ''}
              onChange={(e) => setField('metaPixelId', e.target.value)}
              disabled={!canWrite}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="twitterHandle">{adminText("Twitter / X handle")}</label>
            <input
              id="twitterHandle"
              value={settings.twitterHandle || ''}
              onChange={(e) => setField('twitterHandle', e.target.value)}
              disabled={!canWrite}
              placeholder={adminText("@asas")}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="twitterCardType">{adminText("Twitter card type")}</label>
            <select
              id="twitterCardType"
              value={settings.twitterCardType || 'summary_large_image'}
              onChange={(e) => setField('twitterCardType', e.target.value)}
              disabled={!canWrite}
            >
              <option value="summary_large_image">{adminText("summary_large_image")}</option>
              <option value="summary">{adminText("summary")}</option>
            </select>
          </div>
        </div>

        <div className="cms-grid-3" style={{marginTop: 12}}>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.robotsIndex)}
              onChange={(e) => setField('robotsIndex', e.target.checked)}
              disabled={!canWrite}
            />{adminText("Allow indexing")}</label>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.robotsFollow)}
              onChange={(e) => setField('robotsFollow', e.target.checked)}
              disabled={!canWrite}
            />{adminText("Allow follow")}</label>
          <label className="cms-check">
            <input
              type="checkbox"
              checked={Boolean(settings.organizationJsonLd)}
              onChange={(e) => setField('organizationJsonLd', e.target.checked)}
              disabled={!canWrite}
            />{adminText("Organization JSON-LD")}</label>
        </div>
      </div>

      {canWrite ? (
        <div>
          <button className="cms-btn" type="submit" disabled={saving}>
            {adminText(saving ? 'Saving…' : 'Save SEO defaults')}
          </button>
        </div>
      ) : (
        <p style={{margin: 0, color: 'var(--cms-muted)'}}>{adminText("You have read-only access to SEO.")}</p>
      )}
    </form>
  );
}

export default function SeoControlCenter({
  canWrite = false,
  canWriteRedirects = false,
  initialSettings = {},
  initialTab = 'overview',
}) {
  const {toast} = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') || initialTab || 'overview';
  const tab = TABS.some((item) => item.id === rawTab) ? rawTab : 'overview';

  const [audit, setAudit] = useState(null);
  const [pages, setPages] = useState({entries: {}, targets: []});
  const [settings, setSettings] = useState(initialSettings);
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pagesMode, setPagesMode] = useState('table'); // table | bulk
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectTab = useCallback(
    (nextTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextTab === 'overview') params.delete('tab');
      else params.set('tab', nextTab);
      const qs = params.toString();
      router.replace(qs ? `/admin/seo?${qs}` : '/admin/seo', {scroll: false});
    },
    [router, searchParams],
  );

  const pageRows = useMemo(() => {
    const byKey = new Map();
    for (const target of pages.targets || []) {
      byKey.set(target.key, {
        ...emptyPageSeo(target),
        ...(pages.entries?.[target.key] || {}),
        key: target.key,
      });
    }
    for (const [key, entry] of Object.entries(pages.entries || {})) {
      if (!byKey.has(key)) {
        byKey.set(key, emptyPageSeo({...entry, key}));
      }
    }
    return Array.from(byKey.values());
  }, [pages]);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pageRows;
    return pageRows.filter((row) =>
      [row.key, row.path, row.labelEn, row.labelAr, row.titleEn, row.titleAr]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [pageRows, query]);

  const openEditor = useCallback(
    (key) => {
      const row = pageRows.find((item) => item.key === key);
      const entry = pages.entries?.[key] || row || emptyPageSeo({key});
      setSelectedKey(key);
      setDraft(emptyPageSeo({...entry, key}));
      if (typeof window !== 'undefined' && window.location.hash !== `#${encodeURIComponent(key)}`) {
        window.history.replaceState(null, '', `#${encodeURIComponent(key)}`);
      }
    },
    [pageRows, pages.entries],
  );

  const closeEditor = useCallback(() => {
    setSelectedKey(null);
    setDraft(null);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [auditRes, pagesRes, redirectsRes, seoRes] = await Promise.all([
        fetch('/api/admin/seo/audit'),
        fetch('/api/admin/seo/pages'),
        fetch('/api/admin/seo/redirects'),
        fetch('/api/admin/seo'),
      ]);

      const auditData = await auditRes.json();
      if (!auditRes.ok) throw new Error(auditData.error || 'Audit failed');
      setAudit(auditData);

      const pagesData = await pagesRes.json();
      if (!pagesRes.ok) throw new Error(pagesData.error || 'Pages load failed');
      setPages({
        entries: pagesData.entries || {},
        targets: pagesData.targets || [],
      });

      if (redirectsRes.ok) {
        const redirectsData = await redirectsRes.json();
        setRedirects(redirectsData.items || redirectsData.document?.items || []);
      }

      if (seoRes.ok) {
        const seoData = await seoRes.json();
        if (seoData.settings) setSettings(seoData.settings);
      }
    } catch (err) {
      toast({
        title: 'Could not load SEO data',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [auditRes, pagesRes, redirectsRes, seoRes] = await Promise.all([
          fetch('/api/admin/seo/audit'),
          fetch('/api/admin/seo/pages'),
          fetch('/api/admin/seo/redirects'),
          fetch('/api/admin/seo'),
        ]);
        if (cancelled) return;

        const auditData = await auditRes.json();
        if (!auditRes.ok) throw new Error(auditData.error || 'Audit failed');
        setAudit(auditData);

        const pagesData = await pagesRes.json();
        if (!pagesRes.ok) throw new Error(pagesData.error || 'Pages load failed');
        setPages({
          entries: pagesData.entries || {},
          targets: pagesData.targets || [],
        });

        if (redirectsRes.ok) {
          const redirectsData = await redirectsRes.json();
          setRedirects(redirectsData.items || redirectsData.document?.items || []);
        }

        if (seoRes.ok) {
          const seoData = await seoRes.json();
          if (seoData.settings) setSettings(seoData.settings);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: 'Could not load SEO data',
            description: err.message,
            variant: 'error',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    const keyParam = searchParams.get('key');
    if (!keyParam) return;
    if (!(pageRows.some((row) => row.key === keyParam) || pages.entries?.[keyParam])) return;
    const id = window.setTimeout(() => openEditor(keyParam), 0);
    return () => window.clearTimeout(id);
  }, [searchParams, pageRows, pages.entries, openEditor]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const key = decodeURIComponent(hash);
      if (pageRows.some((row) => row.key === key) || pages.entries?.[key]) {
        openEditor(key);
      }
    }
    window.addEventListener('hashchange', onHash);
    if (window.location.hash) {
      const id = window.setTimeout(onHash, 0);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener('hashchange', onHash);
      };
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, [pages.entries, pageRows, openEditor]);

  async function saveDraft() {
    if (!canWrite || !draft?.key) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/pages', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setPages((prev) => ({
        ...prev,
        entries: {...prev.entries, [data.entry.key]: data.entry},
      }));
      toast({title: 'Page SEO saved', variant: 'success'});
      closeEditor();
      await loadAll();
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveRedirectsList(nextItems) {
    if (!canWriteRedirects) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: nextItems}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redirects save failed');
      setRedirects(data.items || data.document?.items || nextItems);
      toast({title: 'Redirects saved', variant: 'success'});
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  const summary = audit?.summary || {};
  const issues = audit?.issues || [];
  const disallowAll = settings.robotsIndex === false;
  const sitemapIncluded = pageRows.filter((row) => row.sitemapInclude !== false).length;
  const sitemapExcluded = pageRows.length - sitemapIncluded;

  if (loading && !audit) {
    return (
      <div className="cms-card">
        <p style={{margin: 0, color: 'var(--cms-muted)'}}>{adminText("Loading SEO Control Center…")}</p>
      </div>
    );
  }

  return (
    <div className="cms-stack cms-seo-center">
      <div className="cms-pipeline" role="tablist" aria-label={adminText("SEO sections")}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => selectTab(item.id)}
          >
            {adminText(item.label)}
            {item.id === 'issues' && issues.length ? (
              <span className="cms-seo-tab-count">{adminText(issues.length)}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="cms-stack">
          <div className="cms-stat-grid">
            <div className="cms-stat-card">
              <span>{adminText("Pages tracked")}</span>
              <strong>{adminText(summary.total ?? pageRows.length)}</strong>
              <em>{adminText("SEO targets")}</em>
            </div>
            <div className="cms-stat-card">
              <span>{adminText("Open issues")}</span>
              <strong>{adminText(summary.issues ?? issues.length)}</strong>
              <em>{adminText(summary.withIssues || 0)}{adminText(" pages affected")}</em>
            </div>
            <div className="cms-stat-card">
              <span>{adminText("Missing titles")}</span>
              <strong>{adminText(summary.missingTitle ?? 0)}</strong>
              <em>{adminText("English title gaps")}</em>
            </div>
            <div className="cms-stat-card">
              <span>{adminText("Avg checklist")}</span>
              <strong>
                {adminText(summary.avgScore ?? 0)}
                <span style={{fontSize: 16, color: 'var(--cms-muted)'}}>
                  /{adminText(summary.maxScore ?? 9)}
                </span>
              </strong>
              <em>{adminText(summary.noindex || 0)}{adminText(" noindex · ")}{adminText(summary.withOg || 0)}{adminText(" with OG")}</em>
            </div>
          </div>

          {disallowAll ? (
            <div className="cms-seo-alert is-danger">
              <AlertTriangle size={18} />
              <div>
                <strong>{adminText("Site-wide indexing is disabled")}</strong>
                <p>{adminText("Robots currently disallow all crawlers. Review the Robots tab.")}</p>
              </div>
              <button type="button" className="cms-btn-ghost" onClick={() => selectTab('robots')}>{adminText("Open robots")}</button>
            </div>
          ) : null}

          <div className="cms-card">
            <h2 className="cms-dash-section-title" style={{marginTop: 0}}>{adminText("Quick actions")}</h2>
            <div className="cms-actions">
              <button type="button" className="cms-btn" onClick={() => selectTab('pages')}>{adminText("Edit page SEO")}</button>
              <button type="button" className="cms-btn-ghost" onClick={() => selectTab('issues')}>{adminText("Review issues")}</button>
              <button type="button" className="cms-btn-ghost" onClick={() => selectTab('defaults')}>{adminText("Global defaults")}</button>
              <Link href="/sitemap.xml" className="cms-btn-ghost" target="_blank">{adminText("Open sitemap.xml")}</Link>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'issues' ? (
        <div className="cms-stack">
          {!issues.length ? (
            <EmptyState
              title={adminText("No SEO issues")}
              description={adminText("All tracked pages pass the current audit checks.")}
            />
          ) : (
            <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>{adminText("Severity")}</th>
                    <th>{adminText("Page")}</th>
                    <th>{adminText("Locale")}</th>
                    <th>{adminText("Issue")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue, index) => (
                    <tr key={`${issue.key}-${issue.issue}-${index}`}>
                      <td>
                        <StatusBadge status={issue.severity === 'error' ? 'rejected' : issue.severity === 'warn' ? 'review' : 'new'}>
                          {adminText(issue.severity)}
                        </StatusBadge>
                      </td>
                      <td>
                        <strong>{adminText(issue.path ? pathLabel(issue.path) : issue.key)}</strong>
                        <div style={{color: 'var(--cms-muted)', fontSize: 12}}>{adminText(issue.type)}</div>
                      </td>
                      <td>{adminText(issue.locale || '—')}</td>
                      <td>{adminText(issue.issue)}</td>
                      <td>
                        <a
                          href={`#${encodeURIComponent(issue.key)}`}
                          className="cms-btn-ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            openEditor(issue.key);
                          }}
                        >{adminText("Fix")}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {tab === 'pages' ? (
        <div className="cms-stack">
          <div className="cms-crm-toolbar">
            <label className="cms-crm-search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={adminText("Search pages, paths, titles…")}
                disabled={pagesMode === 'bulk'}
              />
            </label>
            <div className="cms-seo-toggle" role="group" aria-label={adminText("Pages view")}>
              <button
                type="button"
                className={pagesMode === 'table' ? 'is-active' : ''}
                onClick={() => setPagesMode('table')}
              >{adminText("Table")}</button>
              <button
                type="button"
                className={pagesMode === 'bulk' ? 'is-active' : ''}
                onClick={() => setPagesMode('bulk')}
              >{adminText("Bulk edit")}</button>
            </div>
            {pagesMode === 'table' ? (
              <span style={{color: 'var(--cms-muted)', fontSize: 13}}>
                {adminText(filteredPages.length)}{adminText(" of ")}{adminText(pageRows.length)}
              </span>
            ) : null}
          </div>

          {pagesMode === 'bulk' ? (
            <SeoBulkEditor
              key={pageRows.map((r) => `${r.key}:${r.updatedAt || ''}`).join('|')}
              rows={pageRows}
              canWrite={canWrite}
              onSaved={() => loadAll()}
            />
          ) : !filteredPages.length ? (
            <EmptyState title={adminText("No matching pages")} description={adminText("Try a different search.")} />
          ) : (
            <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>{adminText("Page")}</th>
                    <th>{adminText("Type")}</th>
                    <th>{adminText("Title EN")}</th>
                    <th>{adminText("Status")}</th>
                    <th>{adminText("Score")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((row) => {
                    const status = statusForEntry(row);
                    const checklist = seoChecklist(row);
                    return (
                      <tr
                        key={row.key}
                        className="cms-crm-row"
                        onClick={() => openEditor(row.key)}
                        style={{cursor: 'pointer'}}
                      >
                        <td>
                          <strong>{adminText(row.labelEn || row.key)}</strong>
                          <div style={{color: 'var(--cms-muted)', fontSize: 12}}>
                            {adminText(pathLabel(row.path))}
                          </div>
                        </td>
                        <td>{adminText(row.type)}</td>
                        <td>{row.titleEn || '—'}</td>
                        <td>
                          <StatusBadge status={status}>{adminText(statusLabel(status))}</StatusBadge>
                        </td>
                        <td>
                          {adminText(checklist.score)}/{adminText(checklist.max)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {tab === 'defaults' ? (
        <DefaultsForm
          key={settings.updatedAt || 'seo-defaults'}
          initialSettings={settings}
          canWrite={canWrite}
          onSaved={(next) => setSettings(next)}
        />
      ) : null}

      {tab === 'redirects' ? (
        <div className="cms-stack">
          <div className="cms-actions">
            {canWriteRedirects ? (
              <button
                type="button"
                className="cms-btn"
                onClick={() => setRedirects((prev) => [...prev, newRedirect()])}
              >{adminText("Add redirect")}</button>
            ) : null}
            {canWriteRedirects ? (
              <button
                type="button"
                className="cms-btn-ghost"
                disabled={saving}
                onClick={() => saveRedirectsList(redirects)}
              >
                {adminText(saving ? 'Saving…' : 'Save redirects')}
              </button>
            ) : null}
          </div>

          {!redirects.length ? (
            <EmptyState
              title={adminText("No redirects yet")}
              description={adminText("Add 301/302 rules for moved URLs.")}
              actions={
                canWriteRedirects ? (
                  <button
                    type="button"
                    className="cms-btn"
                    onClick={() => setRedirects([newRedirect()])}
                  >{adminText("Add first redirect")}</button>
                ) : null
              }
            />
          ) : (
            <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>{adminText("From")}</th>
                    <th>{adminText("To")}</th>
                    <th>{adminText("Code")}</th>
                    <th>{adminText("Enabled")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((item, index) => (
                    <tr key={item.id || `${item.from}-${index}`}>
                      <td>
                        <input
                          value={item.from || ''}
                          disabled={!canWriteRedirects || saving}
                          placeholder={adminText("/old-path")}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRedirects((prev) =>
                              prev.map((row, i) => (i === index ? {...row, from: value} : row)),
                            );
                          }}
                        />
                      </td>
                      <td>
                        <input
                          value={item.to || ''}
                          disabled={!canWriteRedirects || saving}
                          placeholder={adminText("/new-path")}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRedirects((prev) =>
                              prev.map((row, i) => (i === index ? {...row, to: value} : row)),
                            );
                          }}
                        />
                      </td>
                      <td>
                        <select
                          value={item.statusCode || 301}
                          disabled={!canWriteRedirects || saving}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setRedirects((prev) =>
                              prev.map((row, i) =>
                                i === index ? {...row, statusCode: value} : row,
                              ),
                            );
                          }}
                        >
                          <option value={301}>301</option>
                          <option value={302}>302</option>
                          <option value={307}>307</option>
                          <option value={308}>308</option>
                        </select>
                      </td>
                      <td>
                        <label className="cms-check">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            disabled={!canWriteRedirects || saving}
                            onChange={(e) => {
                              const value = e.target.checked;
                              setRedirects((prev) =>
                                prev.map((row, i) =>
                                  i === index ? {...row, enabled: value} : row,
                                ),
                              );
                            }}
                          />
                        </label>
                      </td>
                      <td>
                        {canWriteRedirects ? (
                          <button
                            type="button"
                            className="cms-btn-danger"
                            disabled={saving}
                            onClick={() =>
                              setRedirects((prev) => prev.filter((_, i) => i !== index))
                            }
                          >{adminText("Remove")}</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {tab === 'sitemap' ? (
        <div className="cms-stack">
          <div className="cms-stat-grid">
            <div className="cms-stat-card">
              <span>{adminText("Included")}</span>
              <strong>{adminText(sitemapIncluded)}</strong>
              <em>{adminText("sitemapInclude = true")}</em>
            </div>
            <div className="cms-stat-card">
              <span>{adminText("Excluded")}</span>
              <strong>{adminText(sitemapExcluded)}</strong>
              <em>{adminText("opted out of sitemap")}</em>
            </div>
            <div className="cms-stat-card">
              <span>{adminText("Locales")}</span>
              <strong>2</strong>
              <em>{adminText("en · ar")}</em>
            </div>
            <a className="cms-stat-card" href="/sitemap.xml" target="_blank" rel="noreferrer">
              <span>{adminText("Public file")}</span>
              <strong style={{fontSize: 18}}>{adminText("/sitemap.xml")}</strong>
              <em>{adminText("Open in new tab")}</em>
            </a>
          </div>
          <div className="cms-card">
            <p style={{margin: 0, color: 'var(--cms-muted)'}}>{adminText("The live sitemap is generated from public routes. Per-page")}{adminText(' ')}
              <code>sitemapInclude</code>{adminText(" flags are managed in the page SEO editor.")}</p>
          </div>
        </div>
      ) : null}

      {tab === 'robots' ? (
        <div className="cms-stack">
          {disallowAll ? (
            <div className="cms-seo-alert is-danger">
              <AlertTriangle size={18} />
              <div>
                <strong>{adminText("Disallow all is active")}</strong>
                <p>{adminText("Global ")}<code>robotsIndex</code>{adminText(" is false — crawlers receive")}{adminText(' ')}
                  <code>Disallow: /</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="cms-seo-alert is-ok">
              <div>
                <strong>{adminText("Indexing allowed")}</strong>
                <p>{adminText("Public pages may be crawled; /admin and /api/admin remain disallowed.")}</p>
              </div>
            </div>
          )}

          <div className="cms-card">
            <h2 className="cms-dash-section-title" style={{marginTop: 0}}>{adminText("Effective robots rules")}</h2>
            <pre className="cms-seo-robots-pre">
              {disallowAll
                ? `User-agent: *\nDisallow: /\n\nSitemap: ${(settings.canonicalBase || adminText('https://www.asasengg.ae')).replace(/\/$/, '')}/sitemap.xml`
                : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${(settings.canonicalBase || adminText('https://www.asasengg.ae')).replace(/\/$/, '')}/sitemap.xml`}
            </pre>
            <div className="cms-actions" style={{marginTop: 16}}>
              <button type="button" className="cms-btn-ghost" onClick={() => selectTab('defaults')}>{adminText("Edit global robots toggles")}</button>
              <Link href="/robots.txt" className="cms-btn-ghost" target="_blank">{adminText("Open /robots.txt")}</Link>
            </div>
          </div>
        </div>
      ) : null}

      {selectedKey && draft ? (
        <div
          className="cms-drawer-backdrop"
          role="presentation"
          onClick={() => !saving && closeEditor()}
        >
          <aside
            className="cms-drawer cms-seo-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={adminText("Edit page SEO")}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cms-drawer-head">
              <div>
                <p className="cms-drawer-kicker">{adminText("Page SEO")}</p>
                <h2>{adminText(draft.labelEn || draft.key)}</h2>
                <p style={{margin: '4px 0 0', color: 'var(--cms-muted)', fontSize: 13}}>
                  {adminText(pathLabel(draft.path))}
                </p>
              </div>
              <AdminCloseButton onClick={closeEditor} disabled={saving} />
            </header>
            <div className="cms-drawer-body">
              <SeoPanel
                value={draft}
                onChange={setDraft}
                canWrite={canWrite}
                path={draft.path}
                fallbackTitle={settings.defaultTitleEn || ''}
                fallbackDescription={settings.defaultDescriptionEn || ''}
              />
              {canWrite ? (
                <div className="cms-drawer-foot">
                  <button type="button" className="cms-btn" onClick={saveDraft} disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save')}
                  </button>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
