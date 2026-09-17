'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import MediaPicker from '@/components/admin/media/MediaPicker';
import GalleryMediaEditor from '@/components/admin/media/GalleryMediaEditor';
import RelationPicker from '@/components/admin/ui/RelationPicker';
import TranslationTabs from '@/components/admin/ui/TranslationTabs';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';

function getValue(obj, key) {
  if (!obj || !key) return undefined;
  if (!key.includes('.')) return obj[key];
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setValue(obj, key, value) {
  if (!key.includes('.')) return {...obj, [key]: value};
  const parts = key.split('.');
  const next = {...obj};
  let cursor = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    cursor[part] = {...(cursor[part] || {})};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

function toFieldValue(item, field) {
  const raw = getValue(item, field.key);
  if (field.type === 'paragraphs') {
    if (Array.isArray(raw)) return raw.join('\n\n');
    return raw == null ? '' : String(raw);
  }
  if (field.type === 'list' || field.type === 'relations') {
    if (Array.isArray(raw)) return raw.join('\n');
    return raw == null ? '' : String(raw);
  }
  if (field.type === 'json') {
    return JSON.stringify(raw ?? null, null, 2);
  }
  if (field.type === 'checkbox') return Boolean(raw);
  if (field.type === 'number') return raw ?? '';
  return raw == null ? '' : raw;
}

function fromFieldValue(value, field) {
  if (field.type === 'paragraphs') {
    return String(value || '')
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  if (field.type === 'list') {
    return String(value || '')
      .split('\n')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  if (field.type === 'json') {
    return JSON.parse(String(value || 'null'));
  }
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') {
    if (value === '' || value == null) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
  }
  if (field.type === 'relations') {
    return Array.isArray(value) ? value : [];
  }
  return value;
}

function blankItem(fields, createDefaults = {}) {
  const base = {...createDefaults};
  for (const field of fields) {
    if (getValue(base, field.key) !== undefined) continue;
    if (field.type === 'checkbox') {
      base[field.key] = false;
    } else if (field.type === 'number') {
      base[field.key] = field.defaultValue ?? 0;
    } else if (field.type === 'select') {
      base[field.key] = field.options?.[0]?.value ?? '';
    } else if (field.type === 'paragraphs' || field.type === 'list' || field.type === 'relations' || field.type === 'gallery') {
      base[field.key] = [];
    } else if (field.type === 'json') {
      base[field.key] = field.defaultValue ?? null;
    } else {
      base[field.key] = '';
    }
  }
  return base;
}

function prepareDraft(item, fields) {
  const next = {...item};
  for (const field of fields) {
    if (field.type === 'paragraphs' || field.type === 'list' || field.type === 'json') {
      next[`__text_${field.key}`] = toFieldValue(item, field);
    }
  }
  return next;
}

function draftToPayload(draft, fields) {
  let payload = {...draft};
  for (const field of fields) {
    if (field.type === 'paragraphs' || field.type === 'list' || field.type === 'json') {
      const text = draft[`__text_${field.key}`] ?? toFieldValue(draft, field);
      payload = setValue(payload, field.key, fromFieldValue(text, field));
    }
    if (field.type === 'relations') {
      const raw = getValue(draft, field.key);
      payload = setValue(payload, field.key, fromFieldValue(raw, field));
    }
  }
  Object.keys(payload).forEach((key) => {
    if (key.startsWith('__text_')) delete payload[key];
  });
  return payload;
}

function isArabicKey(key = '') {
  return key.endsWith('Ar') || key.endsWith('_ar');
}

function findArabicPair(field, fieldMap) {
  const key = field.key;
  if (!key || isArabicKey(key)) return null;

  if (key.endsWith('En')) {
    const ar = fieldMap[`${key.slice(0, -2)}Ar`];
    if (ar && ar.type === field.type) return ar;
  }
  if (key.endsWith('_en')) {
    const ar = fieldMap[`${key.slice(0, -3)}_ar`];
    if (ar && ar.type === field.type) return ar;
  }
  const ar = fieldMap[`${key}Ar`];
  if (ar && ar.type === field.type) return ar;
  return null;
}

function partitionTranslationFields(fields) {
  const fieldMap = {};
  for (const field of fields) fieldMap[field.key] = field;

  const used = new Set();
  const enFields = [];
  const arFields = [];
  const generalFields = [];

  for (const field of fields) {
    if (used.has(field.key)) continue;
    const arPair = findArabicPair(field, fieldMap);
    if (arPair) {
      used.add(field.key);
      used.add(arPair.key);
      enFields.push(field);
      arFields.push({...arPair, dir: arPair.dir || 'rtl'});
      continue;
    }
    if (isArabicKey(field.key)) {
      // Orphan Arabic field without EN pair — keep in general.
      used.add(field.key);
      generalFields.push(field);
      continue;
    }
    used.add(field.key);
    generalFields.push(field);
  }

  return {enFields, arFields, generalFields};
}

export default function CollectionTable({
  resource,
  items: initialItems = [],
  titleKey = 'title',
  slugKey = 'slug',
  idKey = 'id',
  statusKey = 'status',
  fields = [],
  canWrite = false,
  readOnly = false,
  createDefaults = {},
  emptyLabel = 'No items yet.',
  allowDelete = true,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState(null);
  const [rawJson, setRawJson] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const writable = canWrite && !readOnly;

  const translationGroups = useMemo(() => partitionTranslationFields(fields), [fields]);
  const hasTranslations =
    translationGroups.enFields.length > 0 || translationGroups.arFields.length > 0;

  function openEdit(item) {
    setError('');
    setMessage('');
    const prepared = prepareDraft(item, fields);
    setDraft(prepared);
    setRawJson(JSON.stringify(item, null, 2));
  }

  function openCreate() {
    openEdit(blankItem(fields, createDefaults));
  }

  function setField(key, value) {
    setDraft((current) => setValue(current || {}, key, value));
  }

  async function onSave(event) {
    event?.preventDefault?.();
    if (!writable) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = draftToPayload(draft, fields);
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource, item: payload}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      const saved = data.item;
      setItems((current) => {
        const key = saved?.[idKey] ?? saved?.[slugKey];
        const index = current.findIndex(
          (entry) => (entry?.[idKey] ?? entry?.[slugKey]) === key,
        );
        if (index >= 0) {
          const copy = [...current];
          copy[index] = saved;
          return copy;
        }
        return [...current, saved];
      });
      setMessage('Saved.');
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item) {
    if (!writable || !allowDelete) return;
    const label = getValue(item, titleKey) || getValue(item, slugKey) || item?.[idKey];
    if (!window.confirm(`Delete “${label}”?`)) return;
    setError('');
    try {
      const params = new URLSearchParams({resource});
      if (item?.[slugKey]) params.set('slug', String(item[slugKey]));
      else if (item?.[idKey] != null) params.set('id', String(item[idKey]));
      const res = await fetch(`/api/admin/content?${params.toString()}`, {method: 'DELETE'});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      const key = item?.[idKey] ?? item?.[slugKey];
      setItems((current) =>
        current.filter((entry) => (entry?.[idKey] ?? entry?.[slugKey]) !== key),
      );
      router.refresh();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  function renderFieldInput(field) {
    const textKey = `__text_${field.key}`;
    const isSpecial = field.type === 'paragraphs' || field.type === 'list' || field.type === 'json';
    const value = isSpecial
      ? draft?.[textKey] ?? toFieldValue(draft, field)
      : toFieldValue(draft, field);
    const disabled = !writable;

    if (field.type === 'checkbox') {
      return (
        <label className="adm-check" style={{marginTop: 0}}>
          <input
            type="checkbox"
            checked={Boolean(getValue(draft, field.key))}
            onChange={(e) => setField(field.key, e.target.checked)}
            disabled={disabled}
          />
          {field.label}
        </label>
      );
    }

    if (field.type === 'select') {
      return (
        <div className="adm-field">
          <label htmlFor={`f-${field.key}`}>{field.label}</label>
          <select
            id={`f-${field.key}`}
            value={value}
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

    if (field.type === 'relations') {
      const selected = getValue(draft, field.key);
      return (
        <RelationPicker
          label={field.label}
          value={Array.isArray(selected) ? selected : []}
          options={field.options || []}
          onChange={(next) => setField(field.key, next)}
          disabled={disabled}
          placeholder={field.placeholder || 'Search…'}
        />
      );
    }

    if (field.type === 'image' || field.type === 'media') {
      const focalKey = field.focalKey || (field.type === 'image' ? `${field.key}Focal` : null);
      return (
        <MediaPicker
          label={field.label}
          value={typeof value === 'string' ? value : value == null ? '' : String(value)}
          onChange={(url) => setField(field.key, url)}
          mode={field.mode || (field.type === 'media' ? 'DOCUMENT' : 'IMAGE')}
          canWrite={writable}
          enableCrop={field.type === 'image'}
          enableFocal={field.type === 'image' && Boolean(focalKey)}
          focalValue={focalKey ? getValue(draft, focalKey) || '50% 50%' : '50% 50%'}
          onFocalChange={
            focalKey
              ? (focal) => setField(focalKey, focal)
              : undefined
          }
          cropAspect={field.cropAspect || null}
        />
      );
    }

    if (field.type === 'gallery') {
      const selected = getValue(draft, field.key);
      return (
        <GalleryMediaEditor
          label={field.label}
          value={Array.isArray(selected) ? selected : []}
          onChange={(next) => setField(field.key, next)}
          canWrite={writable}
        />
      );
    }

    if (
      field.type === 'textarea' ||
      field.type === 'paragraphs' ||
      field.type === 'list' ||
      field.type === 'json'
    ) {
      return (
        <div className="adm-field">
          <label htmlFor={`f-${field.key}`}>{field.label}</label>
          <textarea
            id={`f-${field.key}`}
            value={value}
            rows={field.rows || (field.type === 'json' ? 10 : 5)}
            dir={field.dir}
            onChange={(e) => {
              if (isSpecial) setField(textKey, e.target.value);
              else setField(field.key, e.target.value);
            }}
            disabled={disabled}
          />
          {field.hint ? <small style={{color: '#5b6472'}}>{field.hint}</small> : null}
        </div>
      );
    }

    return (
      <div className="adm-field">
        <label htmlFor={`f-${field.key}`}>{field.label}</label>
        <input
          id={`f-${field.key}`}
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          dir={field.dir}
          onChange={(e) => setField(field.key, e.target.value)}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div>
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      <div className="adm-card">
        <div className="adm-list-toolbar">
          <div>
            <strong className="adm-list-count">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </strong>
            <p className="adm-section-help" style={{margin: '4px 0 0'}}>
              Search, edit, and publish content for the website.
            </p>
          </div>
          {writable ? (
            <button type="button" className="adm-btn" onClick={openCreate}>
              Add new
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="adm-empty">
            <p>{emptyLabel}</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Web address</th>
                {statusKey ? <th>Status</th> : null}
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const key = item?.[idKey] ?? item?.[slugKey];
                return (
                  <tr key={String(key)}>
                    <td>
                      <strong>{getValue(item, titleKey) || '—'}</strong>
                    </td>
                    <td style={{color: '#5b6472', fontSize: 13}}>
                      {getValue(item, slugKey) || item?.[idKey] || '—'}
                    </td>
                    {statusKey ? (
                      <td>
                        {item?.[statusKey] ? (
                          <span className={`adm-badge ${item[statusKey]}`}>{item[statusKey]}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    ) : null}
                    <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => openEdit(item)}
                      >
                        {writable ? 'Edit' : 'View'}
                      </button>
                      {writable && allowDelete ? (
                        <button
                          type="button"
                          className="adm-btn-danger"
                          style={{marginLeft: 8}}
                          onClick={() => onDelete(item)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {draft ? (
        <div
          className="adm-modal-backdrop"
          role="presentation"
          onClick={() => !saving && setDraft(null)}
        >
          <div
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-head">
              <h2>{writable ? 'Edit content' : 'View content'}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>

            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                {hasTranslations ? (
                  <TranslationTabs
                    enFields={translationGroups.enFields}
                    arFields={translationGroups.arFields}
                    generalFields={translationGroups.generalFields}
                    values={draft}
                    renderField={renderFieldInput}
                  />
                ) : (
                  translationGroups.generalFields.map((field) => (
                    <div key={field.key}>{renderFieldInput(field)}</div>
                  ))
                )}

                <details
                  className="adm-advanced-json"
                  onToggle={(e) => {
                    if (e.currentTarget.open) {
                      try {
                        setRawJson(JSON.stringify(draftToPayload(draft, fields), null, 2));
                      } catch {
                        setRawJson(JSON.stringify(draft, null, 2));
                      }
                    }
                  }}
                >
                  <summary>Developer tools</summary>
                  <p className="adm-section-help">
                    For technical support only. Normal editors can ignore this section.
                  </p>
                  <div className="adm-field" style={{marginTop: 12}}>
                    <label htmlFor="raw-json">Raw data</label>
                    <textarea
                      id="raw-json"
                      value={rawJson}
                      onChange={(e) => setRawJson(e.target.value)}
                      rows={14}
                      disabled={!writable}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 12,
                      }}
                    />
                    {writable ? (
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        style={{marginTop: 8}}
                        onClick={() => {
                          try {
                            openEdit(JSON.parse(rawJson));
                          } catch (err) {
                            setError(err.message || 'Invalid JSON');
                          }
                        }}
                      >
                        Apply JSON to fields
                      </button>
                    ) : null}
                  </div>
                </details>
              </div>

              <div className="adm-modal-foot">
                <div style={{flex: 1}} />
                {writable ? (
                  <button type="submit" className="adm-btn" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
