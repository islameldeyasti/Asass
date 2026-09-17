'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';

function isImageItem(item) {
  return String(item?.mime || '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(item?.url || '');
}

function isDocumentItem(item) {
  return String(item?.mime || '') === 'application/pdf' || /\.pdf$/i.test(item?.url || '');
}

function itemLabel(item) {
  return item?.titleEn || item?.filename || item?.url || 'Untitled';
}

export default function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
  mode = 'IMAGE',
  canWrite = false,
  title = 'Media library',
}) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
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
    if (!open) return undefined;
    const handle = setTimeout(() => load(query), query ? 250 : 0);
    return () => clearTimeout(handle);
  }, [open, query, load]);

  const visible = useMemo(() => {
    if (mode === 'DOCUMENT') return items.filter(isDocumentItem);
    if (mode === 'IMAGE') return items.filter(isImageItem);
    return items;
  }, [items, mode]);

  async function uploadFile(file) {
    if (!canWrite || !file) return;
    const mime = String(file.type || '').toLowerCase();
    if (mode === 'IMAGE' && !mime.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    if (mode === 'DOCUMENT' && mime !== 'application/pdf') {
      setError('Please choose a PDF document.');
      return;
    }
    setUploading(true);
    setProgress(12);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      setProgress(45);
      const res = await fetch('/api/admin/media', {method: 'POST', body});
      setProgress(85);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setProgress(100);
      setItems((current) => [data.item, ...current.filter((entry) => entry.id !== data.item.id)]);
      if (data.item) {
        onSelect?.(data.item);
        onClose?.();
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  }

  if (!open) return null;

  return (
    <div className="adm-modal-backdrop" role="presentation" onClick={() => !uploading && onClose?.()}>
      <div
        className="adm-modal adm-media-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <AdminCloseButton onClick={onClose} disabled={uploading} />
        </div>

        <div className="adm-modal-body">
          {error ? <p className="adm-error">{error}</p> : null}

          {canWrite ? (
            <div
              className={`adm-media-dropzone${dragOver ? ' is-dragover' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <p>
                {uploading
                  ? `Uploading… ${progress}%`
                  : 'Drag & drop a file here, or browse from your computer.'}
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
                accept={
                  mode === 'DOCUMENT'
                    ? 'application/pdf,.pdf'
                    : 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
                }
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) uploadFile(file);
                }}
              />
              {uploading ? (
                <div className="adm-media-progress" aria-hidden>
                  <span style={{width: `${progress}%`}} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="adm-field" style={{marginTop: canWrite ? 16 : 0}}>
            <label htmlFor="media-lib-search">Search</label>
            <input
              id="media-lib-search"
              type="search"
              value={query}
              placeholder="Search by name, alt, or path…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? <p style={{color: '#5b6472', fontSize: 14}}>Loading…</p> : null}

          {!loading && visible.length === 0 ? (
            <div className="adm-empty">
              <p>No media found{query ? ` for “${query}”` : ''}.</p>
            </div>
          ) : (
            <div className="adm-media-grid">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="adm-media-tile"
                  onClick={() => {
                    onSelect?.(item);
                    onClose?.();
                  }}
                >
                  <div className="adm-media-tile-preview">
                    {isImageItem(item) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.altEn || itemLabel(item)} />
                    ) : (
                      <span className="adm-media-file-badge">PDF</span>
                    )}
                  </div>
                  <span className="adm-media-tile-label">{itemLabel(item)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
