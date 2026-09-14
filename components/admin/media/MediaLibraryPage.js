'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import FocalPointPicker from '@/components/admin/media/FocalPointPicker';
import ImageCropDialog from '@/components/admin/media/ImageCropDialog';

function isImageItem(item) {
  return String(item?.mime || '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(item?.url || '');
}

function formatBytes(size) {
  const n = Number(size) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage({initialItems = [], canWrite = false}) {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [usageFilter, setUsageFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [usageConflict, setUsageConflict] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const inputRef = useRef(null);
  const replaceRef = useRef(null);

  const load = useCallback(async (q = '', usage = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('includeUsage', '1');
      if (usage) params.set('usage', usage);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load media');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(query, usageFilter), 250);
    return () => clearTimeout(handle);
  }, [query, usageFilter, load]);

  const filtered = useMemo(() => {
    const list = [...items];
    if (sort === 'oldest') list.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    else if (sort === 'name') {
      list.sort((a, b) =>
        String(a.titleEn || a.filename || '').localeCompare(String(b.titleEn || b.filename || '')),
      );
    } else if (sort === 'size') list.sort((a, b) => (Number(b.size) || 0) - (Number(a.size) || 0));
    else list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return list;
  }, [items, sort]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!canWrite || !files.length) return;
    setUploading(true);
    setProgress(10);
    setError('');
    setMessage('');
    try {
      const body = new FormData();
      files.forEach((file) => body.append('file', file));
      setProgress(45);
      const res = await fetch('/api/admin/media', {method: 'POST', body});
      setProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const uploaded = Array.isArray(data.items) ? data.items : data.item ? [data.item] : [];
      setItems((current) => {
        const ids = new Set(uploaded.map((item) => item.id));
        return [...uploaded, ...current.filter((entry) => !ids.has(entry.id))];
      });
      if (uploaded[0]) setSelected({...uploaded[0], usages: [], usageCount: 0});
      setMessage(uploaded.length > 1 ? `Uploaded ${uploaded.length} files.` : 'Uploaded.');
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  }

  async function replaceFile(file) {
    if (!canWrite || !selected?.id || !file) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('replaceId', selected.id);
      const res = await fetch('/api/admin/media', {method: 'POST', body});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Replace failed');
      setItems((current) =>
        current.map((entry) => (entry.id === data.item.id ? {...entry, ...data.item} : entry)),
      );
      setSelected((cur) => ({...cur, ...data.item}));
      setMessage('File replaced. Existing references keep working.');
    } catch (err) {
      setError(err.message || 'Replace failed');
    } finally {
      setUploading(false);
    }
  }

  async function saveMeta(event) {
    event?.preventDefault?.();
    if (!canWrite || !selected?.id) return;
    setSavingMeta(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: selected.id,
          altEn: selected.altEn || '',
          altAr: selected.altAr || '',
          titleEn: selected.titleEn || '',
          titleAr: selected.titleAr || '',
          captionEn: selected.captionEn || '',
          captionAr: selected.captionAr || '',
          folder: selected.folder || '',
          focalPoint: selected.focalPoint || '50% 50%',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setItems((current) =>
        current.map((entry) => (entry.id === data.item.id ? {...entry, ...data.item} : entry)),
      );
      setSelected((cur) => ({...cur, ...data.item}));
      setMessage('Metadata saved.');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSavingMeta(false);
    }
  }

  async function onDelete(item, {force = false} = {}) {
    if (!canWrite || !item?.id) return;
    const label = item.titleEn || item.filename || item.id;
    if (!force && !window.confirm(`Delete “${label}”?`)) return;
    setError('');
    setMessage('');
    setUsageConflict(null);
    try {
      const params = new URLSearchParams({id: item.id});
      if (force) params.set('force', '1');
      const res = await fetch(`/api/admin/media?${params.toString()}`, {method: 'DELETE'});
      const data = await res.json();
      if (res.status === 409 && data.code === 'MEDIA_IN_USE') {
        setUsageConflict({item, usages: data.usages || [], message: data.error});
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      setMessage(force ? 'Deleted (forced).' : 'Deleted.');
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('URL copied.');
    } catch {
      setError('Could not copy URL.');
    }
  }

  return (
    <div className="adm-media-page">
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      {usageConflict ? (
        <div className="adm-card" style={{marginBottom: 16, borderColor: '#A02315'}}>
          <strong>{usageConflict.message}</strong>
          <ul style={{margin: '10px 0', paddingLeft: 18}}>
            {usageConflict.usages.map((usage, index) => (
              <li key={`${usage.path}-${index}`} style={{fontSize: 13, marginBottom: 4}}>
                <strong>{usage.module}</strong>
                {usage.label ? ` → ${usage.label}` : ''}
                {usage.href ? (
                  <>
                    {' '}
                    <a href={usage.href}>Open</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          <p style={{fontSize: 13, color: 'var(--cms-muted)'}}>
            Prefer Replace File to update the binary without breaking pages, or remove references
            first. Force delete only if you accept broken images.
          </p>
          <div className="adm-actions">
            <button type="button" className="adm-btn-ghost" onClick={() => setUsageConflict(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn-danger"
              onClick={() => onDelete(usageConflict.item, {force: true})}
            >
              Force delete
            </button>
          </div>
        </div>
      ) : null}

      <div className="adm-card" style={{marginBottom: 16}}>
        <div className="adm-media-toolbar" style={{flexWrap: 'wrap', gap: 12}}>
          <div className="adm-field" style={{marginBottom: 0, flex: 1, minWidth: 180}}>
            <label htmlFor="media-page-search">Search</label>
            <input
              id="media-page-search"
              type="search"
              value={query}
              placeholder="Search media…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="adm-field" style={{marginBottom: 0, minWidth: 140}}>
            <label htmlFor="media-usage-filter">Usage</label>
            <select
              id="media-usage-filter"
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="used">Used</option>
              <option value="unused">Unused</option>
            </select>
          </div>
          <div className="adm-field" style={{marginBottom: 0, minWidth: 140}}>
            <label htmlFor="media-sort">Sort</label>
            <select id="media-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </div>
          <div className="adm-actions" style={{alignSelf: 'end'}}>
            <button
              type="button"
              className={view === 'grid' ? 'adm-btn' : 'adm-btn-ghost'}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={view === 'list' ? 'adm-btn' : 'adm-btn-ghost'}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
        </div>

        {canWrite ? (
          <div
            className={`adm-media-dropzone${dragOver ? ' is-dragover' : ''}`}
            style={{marginTop: 16}}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              uploadFiles(e.dataTransfer?.files);
            }}
          >
            <p>
              {uploading
                ? `Uploading… ${progress}%`
                : 'Drop multiple files here (JPEG, PNG, WebP, GIF, PDF · max 12 MB each).'}
            </p>
            <button
              type="button"
              className="adm-btn"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              hidden
              onChange={(e) => {
                uploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {uploading ? (
              <div className="adm-media-progress" aria-hidden>
                <span style={{width: `${progress}%`}} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="adm-media-layout">
        <div className="adm-card">
          <strong style={{display: 'block', marginBottom: 12, color: '#070463'}}>
            {filtered.length} asset{filtered.length === 1 ? '' : 's'}
            {loading ? ' · loading…' : ''}
          </strong>

          {filtered.length === 0 ? (
            <div className="adm-empty">
              <p>No media yet. Upload files to build the library, then pick them from any editor.</p>
              {canWrite ? (
                <button type="button" className="adm-btn" onClick={() => inputRef.current?.click()}>
                  Upload media
                </button>
              ) : null}
            </div>
          ) : view === 'grid' ? (
            <div className="adm-media-grid">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`adm-media-tile${selected?.id === item.id ? ' is-selected' : ''}`}
                  onClick={() => setSelected(item)}
                >
                  <div className="adm-media-tile-preview">
                    {isImageItem(item) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.altEn || item.titleEn || ''}
                        style={{objectPosition: item.focalPoint || '50% 50%'}}
                      />
                    ) : (
                      <span className="adm-media-file-badge">PDF</span>
                    )}
                  </div>
                  <span className="adm-media-tile-label">
                    {item.titleEn || item.filename || item.id}
                  </span>
                  {typeof item.usageCount === 'number' ? (
                    <span style={{fontSize: 11, color: 'var(--cms-muted)'}}>
                      {item.usageCount ? `Used · ${item.usageCount}` : 'Unused'}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Usage</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {isImageItem(item) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={item.url} alt="" />
                      ) : (
                        <span className="adm-media-file-badge">PDF</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        style={{padding: '4px 8px', minHeight: 0}}
                        onClick={() => setSelected(item)}
                      >
                        {item.titleEn || item.filename || item.id}
                      </button>
                    </td>
                    <td style={{color: '#5b6472', fontSize: 13}}>{item.mime || '—'}</td>
                    <td style={{color: '#5b6472', fontSize: 13}}>{formatBytes(item.size)}</td>
                    <td style={{color: '#5b6472', fontSize: 13}}>
                      {typeof item.usageCount === 'number' ? item.usageCount : '—'}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {canWrite ? (
                        <button
                          type="button"
                          className="adm-btn-danger"
                          onClick={() => onDelete(item)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className={`adm-card adm-media-drawer${selected ? ' is-open' : ''}`}>
          {selected ? (
            <form onSubmit={saveMeta}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 12}}>
                <h2 className="adm-section-title" style={{margin: 0}}>
                  Details
                </h2>
                <button type="button" className="adm-btn-ghost" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>

              <div className="adm-media-drawer-preview">
                {isImageItem(selected) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.url}
                    alt={selected.altEn || ''}
                    style={{objectPosition: selected.focalPoint || '50% 50%'}}
                  />
                ) : (
                  <span className="adm-media-file-badge">PDF</span>
                )}
              </div>

              <p style={{fontSize: 12, color: '#5b6472', wordBreak: 'break-all'}}>
                {selected.filename || selected.url}
              </p>
              <p style={{fontSize: 13, color: '#5b6472'}}>
                {selected.mime || '—'} · {formatBytes(selected.size)}
                {selected.uploadedBy ? ` · ${selected.uploadedBy}` : ''}
              </p>
              {selected.createdAt ? (
                <p style={{fontSize: 12, color: '#5b6472'}}>
                  Uploaded {new Date(selected.createdAt).toLocaleString()}
                </p>
              ) : null}

              <div className="adm-field">
                <label htmlFor="media-title-en">Title (EN)</label>
                <input
                  id="media-title-en"
                  value={selected.titleEn || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, titleEn: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-title-ar">Title (AR)</label>
                <input
                  id="media-title-ar"
                  dir="rtl"
                  value={selected.titleAr || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, titleAr: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-alt-en">Alt text (EN)</label>
                <input
                  id="media-alt-en"
                  value={selected.altEn || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, altEn: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-alt-ar">Alt text (AR)</label>
                <input
                  id="media-alt-ar"
                  dir="rtl"
                  value={selected.altAr || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, altAr: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-caption-en">Caption (EN)</label>
                <input
                  id="media-caption-en"
                  value={selected.captionEn || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, captionEn: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-caption-ar">Caption (AR)</label>
                <input
                  id="media-caption-ar"
                  dir="rtl"
                  value={selected.captionAr || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, captionAr: e.target.value}))}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="media-folder">Folder</label>
                <input
                  id="media-folder"
                  value={selected.folder || ''}
                  disabled={!canWrite}
                  onChange={(e) => setSelected((cur) => ({...cur, folder: e.target.value}))}
                />
              </div>

              {isImageItem(selected) ? (
                <>
                  <FocalPointPicker
                    src={selected.url}
                    value={selected.focalPoint || '50% 50%'}
                    disabled={!canWrite}
                    onChange={(focalPoint) => setSelected((cur) => ({...cur, focalPoint}))}
                  />
                  {canWrite ? (
                    <div className="adm-actions" style={{marginTop: 4}}>
                      <button type="button" className="adm-btn-ghost" onClick={() => setCropOpen(true)}>
                        Crop as new file
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}

              <div style={{marginTop: 8}}>
                <strong style={{fontSize: 13}}>Used in</strong>
                {Array.isArray(selected.usages) && selected.usages.length ? (
                  <ul style={{margin: '8px 0 0', paddingLeft: 18}}>
                    {selected.usages.map((usage, index) => (
                      <li key={`${usage.path}-${index}`} style={{fontSize: 12, marginBottom: 4}}>
                        {usage.module}
                        {usage.label ? ` → ${usage.label}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{margin: '6px 0 0', fontSize: 12, color: 'var(--cms-muted)'}}>
                    Not referenced in CMS content yet.
                  </p>
                )}
              </div>

              {canWrite ? (
                <div className="adm-actions" style={{flexWrap: 'wrap'}}>
                  <button type="submit" className="adm-btn" disabled={savingMeta}>
                    {savingMeta ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="adm-btn-ghost"
                    onClick={() => replaceRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace file
                  </button>
                  <button
                    type="button"
                    className="adm-btn-ghost"
                    onClick={() => copyUrl(selected.url)}
                  >
                    Copy URL
                  </button>
                  <a className="adm-btn-ghost" href={selected.url} download>
                    Download
                  </a>
                  <button
                    type="button"
                    className="adm-btn-danger"
                    onClick={() => onDelete(selected)}
                  >
                    Delete
                  </button>
                  <input
                    ref={replaceRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) replaceFile(file);
                    }}
                  />
                </div>
              ) : null}
            </form>
          ) : (
            <div className="adm-empty">
              <p>Select an asset to edit metadata, focal point, and usage.</p>
            </div>
          )}
        </aside>
      </div>

      <ImageCropDialog
        open={cropOpen}
        src={selected?.url || ''}
        onClose={() => setCropOpen(false)}
        onCropped={async (url, item) => {
          setMessage('Cropped image saved to Media Library.');
          await load(query, usageFilter);
          if (item) setSelected(item);
          else if (url) {
            setSelected((cur) => (cur ? {...cur, url} : cur));
          }
        }}
      />
    </div>
  );
}
