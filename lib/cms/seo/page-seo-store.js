/**
 * Persist per-page SEO overrides in the CMS json-store (`page-seo` document).
 */

import {ensureDocument, writeDocument} from '../json-store';
import {emptyPageSeo, descriptionLengthHint, titleLengthHint} from './model';
import {listSeoTargets} from './registry';

function nowIso() {
  return new Date().toISOString();
}

function emptyStore() {
  return {entries: {}, updatedAt: nowIso()};
}

function isNonEmpty(value) {
  return Boolean(String(value || '').trim());
}

function mergeSeedEntry(target, existing) {
  if (!existing) {
    return emptyPageSeo({
      ...target,
      updatedAt: nowIso(),
    });
  }

  const next = emptyPageSeo({
    ...target,
    ...existing,
    key: target.key,
    type: target.type || existing.type || 'page',
    path: target.path ?? existing.path ?? '',
    labelEn: target.labelEn || existing.labelEn || '',
    labelAr: target.labelAr || existing.labelAr || '',
    schemaType: existing.schemaType || target.schemaType || '',
    updatedAt: existing.updatedAt || nowIso(),
  });

  // Do not overwrite existing non-empty titles (or other filled SEO copy).
  if (isNonEmpty(existing.titleEn)) next.titleEn = existing.titleEn;
  if (isNonEmpty(existing.titleAr)) next.titleAr = existing.titleAr;
  if (isNonEmpty(existing.descriptionEn)) next.descriptionEn = existing.descriptionEn;
  if (isNonEmpty(existing.descriptionAr)) next.descriptionAr = existing.descriptionAr;
  if (isNonEmpty(existing.ogTitleEn)) next.ogTitleEn = existing.ogTitleEn;
  if (isNonEmpty(existing.ogTitleAr)) next.ogTitleAr = existing.ogTitleAr;
  if (isNonEmpty(existing.ogDescriptionEn)) next.ogDescriptionEn = existing.ogDescriptionEn;
  if (isNonEmpty(existing.ogDescriptionAr)) next.ogDescriptionAr = existing.ogDescriptionAr;
  if (isNonEmpty(existing.ogImage)) next.ogImage = existing.ogImage;
  if (isNonEmpty(existing.canonicalOverride)) next.canonicalOverride = existing.canonicalOverride;

  return next;
}

export async function getAllPageSeo() {
  const doc = await ensureDocument('page-seo', emptyStore);
  return {
    entries: doc?.entries && typeof doc.entries === 'object' ? doc.entries : {},
    updatedAt: doc?.updatedAt || nowIso(),
  };
}

export async function getPageSeo(key) {
  if (!key) return null;
  const {entries} = await getAllPageSeo();
  return entries[key] || null;
}

export async function upsertPageSeo(key, patch = {}) {
  if (!key) {
    const error = new Error('SEO key is required');
    error.status = 400;
    throw error;
  }
  const current = await getAllPageSeo();
  const existing = current.entries[key] || emptyPageSeo({key});
  const nextEntry = emptyPageSeo({
    ...existing,
    ...patch,
    key,
    updatedAt: nowIso(),
  });
  nextEntry.robotsIndex = nextEntry.robotsIndex !== false;
  nextEntry.robotsFollow = nextEntry.robotsFollow !== false;
  nextEntry.sitemapInclude = nextEntry.sitemapInclude !== false;

  const next = {
    entries: {...current.entries, [key]: nextEntry},
    updatedAt: nowIso(),
  };
  await writeDocument('page-seo', next);
  return nextEntry;
}

/**
 * Seed missing targets into the store. Existing non-empty titles are preserved.
 */
export async function ensurePageSeoSeeded() {
  const [current, targets] = await Promise.all([getAllPageSeo(), listSeoTargets()]);
  const entries = {...(current.entries || {})};
  let changed = false;

  for (const target of targets) {
    const prev = entries[target.key];
    const merged = mergeSeedEntry(target, prev);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(merged)) {
      entries[target.key] = merged;
      changed = true;
    }
  }

  if (!changed) {
    return {entries, updatedAt: current.updatedAt || nowIso()};
  }

  const next = {entries, updatedAt: nowIso()};
  await writeDocument('page-seo', next);
  return next;
}

function pushIssue(issues, {key, path, type, locale, issue, severity, href}) {
  issues.push({key, path, type, locale, issue, severity, href});
}

function adminHref(key) {
  return `/admin/seo?key=${encodeURIComponent(key)}`;
}

/**
 * Audit all SEO targets + stored entries.
 * @returns {Promise<Array<{key: string, path: string, type: string, locale: string, issue: string, severity: string, href: string}>>}
 */
export async function auditPageSeo() {
  const [{entries}, targets] = await Promise.all([getAllPageSeo(), listSeoTargets()]);
  const issues = [];
  const byKey = new Map(targets.map((t) => [t.key, t]));

  // Include orphan entries that no longer match a live target.
  for (const entry of Object.values(entries || {})) {
    if (entry?.key && !byKey.has(entry.key)) {
      byKey.set(entry.key, emptyPageSeo(entry));
    }
  }

  for (const target of byKey.values()) {
    const entry = entries?.[target.key] || target;
    const key = target.key;
    const path = entry.path ?? target.path ?? '';
    const type = entry.type || target.type || 'page';
    const href = adminHref(key);

    for (const locale of ['en', 'ar']) {
      const titleKey = locale === 'en' ? 'titleEn' : 'titleAr';
      const descKey = locale === 'en' ? 'descriptionEn' : 'descriptionAr';
      const title = entry[titleKey] || '';
      const description = entry[descKey] || '';

      if (!isNonEmpty(title)) {
        pushIssue(issues, {
          key,
          path,
          type,
          locale,
          issue: `Missing title (${locale.toUpperCase()})`,
          severity: 'error',
          href,
        });
      } else {
        const hint = titleLengthHint(title);
        if (hint.status === 'bad') {
          pushIssue(issues, {
            key,
            path,
            type,
            locale,
            issue: `Title length out of range (${hint.count} chars)`,
            severity: 'warn',
            href,
          });
        } else if (hint.status === 'warn') {
          pushIssue(issues, {
            key,
            path,
            type,
            locale,
            issue: `Title length suboptimal (${hint.count} chars)`,
            severity: 'warn',
            href,
          });
        }
      }

      if (!isNonEmpty(description)) {
        pushIssue(issues, {
          key,
          path,
          type,
          locale,
          issue: `Missing meta description (${locale.toUpperCase()})`,
          severity: 'error',
          href,
        });
      } else {
        const hint = descriptionLengthHint(description);
        if (hint.status === 'bad') {
          pushIssue(issues, {
            key,
            path,
            type,
            locale,
            issue: `Description length out of range (${hint.count} chars)`,
            severity: 'warn',
            href,
          });
        } else if (hint.status === 'warn') {
          pushIssue(issues, {
            key,
            path,
            type,
            locale,
            issue: `Description length suboptimal (${hint.count} chars)`,
            severity: 'warn',
            href,
          });
        }
      }
    }

    if (!isNonEmpty(entry.ogImage)) {
      pushIssue(issues, {
        key,
        path,
        type,
        locale: 'all',
        issue: 'Missing Open Graph image',
        severity: 'warn',
        href,
      });
    }

    if (entry.robotsIndex === false) {
      pushIssue(issues, {
        key,
        path,
        type,
        locale: 'all',
        issue: 'Page is set to noindex',
        severity: 'info',
        href,
      });
    }

    if (entry.sitemapInclude === false) {
      pushIssue(issues, {
        key,
        path,
        type,
        locale: 'all',
        issue: 'Excluded from sitemap',
        severity: 'info',
        href,
      });
    }
  }

  return issues;
}
