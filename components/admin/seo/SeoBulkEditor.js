'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import EmptyState from '@/components/admin/ui/EmptyState';
import {useToast} from '@/components/admin/ui/ToastProvider';

function truncate(str, max = 72) {
  const value = String(str || '');
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/**
 * Batch-edit titles/descriptions and index flags for many SEO records.
 */
export default function SeoBulkEditor({
  rows = [],
  canWrite = false,
  onSaved,
}) {
  const {toast} = useToast();
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.key,
        {
          key: row.key,
          titleEn: row.titleEn || '',
          titleAr: row.titleAr || '',
          descriptionEn: row.descriptionEn || '',
          robotsIndex: row.robotsIndex !== false,
        },
      ]),
    ),
  );
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((row) => drafts[row.key]);
    if (!q) return list;
    return list.filter((row) => {
      const d = drafts[row.key] || {};
      return [row.key, row.path, row.labelEn, d.titleEn, d.titleAr]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [rows, drafts, query]);

  function patchRow(key, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [key]: {...prev[key], [field]: value},
    }));
  }

  async function onSave() {
    if (!canWrite) return;
    setSaving(true);
    try {
      const entries = Object.values(drafts);
      const res = await fetch('/api/admin/seo/pages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({entries}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk save failed');
      toast({title: 'Bulk SEO saved', variant: 'success'});
      onSaved?.(data);
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save bulk edits',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!rows.length) {
    return (
      <EmptyState
        title={adminText("No SEO records")}
        description={adminText("Seed page SEO entries from the All pages tab first.")}
      />
    );
  }

  return (
    <div className="cms-stack">
      <div className="cms-crm-toolbar">
        <label className="cms-crm-search">
          <span className="sr-only">{adminText("Search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={adminText("Filter by key, path, or title…")}
            aria-label={adminText("Filter bulk SEO rows")}
          />
        </label>
        {canWrite ? (
          <button type="button" className="cms-btn" onClick={onSave} disabled={saving}>
            {adminText(saving ? 'Saving…' : 'Save batch')}
          </button>
        ) : null}
      </div>

      <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="cms-table">
          <thead>
            <tr>
              <th>{adminText("Key")}</th>
              <th>{adminText("Title EN")}</th>
              <th>{adminText("Title AR")}</th>
              <th>{adminText("Description EN")}</th>
              <th>{adminText("Index")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const draft = drafts[row.key] || {};
              return (
                <tr key={row.key}>
                  <td>
                    <code style={{fontSize: 12}}>{row.key}</code>
                  </td>
                  <td>
                    <input
                      value={draft.titleEn || ''}
                      disabled={!canWrite || saving}
                      onChange={(e) => patchRow(row.key, 'titleEn', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={draft.titleAr || ''}
                      disabled={!canWrite || saving}
                      dir="rtl"
                      onChange={(e) => patchRow(row.key, 'titleAr', e.target.value)}
                    />
                  </td>
                  <td title={adminText(draft.descriptionEn || '')}>
                    <input
                      value={draft.descriptionEn || ''}
                      disabled={!canWrite || saving}
                      onChange={(e) => patchRow(row.key, 'descriptionEn', e.target.value)}
                      placeholder={adminText(truncate(row.descriptionEn, 40) || 'Description')}
                    />
                  </td>
                  <td>
                    <label className="cms-check">
                      <input
                        type="checkbox"
                        checked={draft.robotsIndex !== false}
                        disabled={!canWrite || saving}
                        onChange={(e) => patchRow(row.key, 'robotsIndex', e.target.checked)}
                      />{adminText("Index")}</label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
