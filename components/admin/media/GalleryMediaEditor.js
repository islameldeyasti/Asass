'use client';

import MediaPicker from '@/components/admin/media/MediaPicker';

/**
 * Ordered gallery editor — each item is {src, crop, altEn, altAr}.
 */
export default function GalleryMediaEditor({
  label = 'Gallery',
  value = [],
  onChange,
  canWrite = false,
}) {
  const items = Array.isArray(value)
    ? value.map((entry) =>
        typeof entry === 'string'
          ? {src: entry, crop: '50% 40%', altEn: '', altAr: ''}
          : {
              src: entry?.src || '',
              crop: entry?.crop || '50% 40%',
              altEn: entry?.altEn || '',
              altAr: entry?.altAr || '',
            },
      )
    : [];

  function commit(next) {
    onChange?.(next.filter((item) => item.src));
  }

  function update(index, patch) {
    const next = items.map((item, i) => (i === index ? {...item, ...patch} : item));
    commit(next);
  }

  function remove(index) {
    commit(items.filter((_, i) => i !== index));
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    commit(next);
  }

  function addBlank() {
    commit([...items, {src: '', crop: '50% 40%', altEn: '', altAr: ''}]);
  }

  return (
    <div className="adm-field" style={{gridColumn: '1 / -1'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10}}>
        <strong>{label}</strong>
        {canWrite ? (
          <button type="button" className="adm-btn-ghost" onClick={addBlank}>
            Add image
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p style={{margin: 0, color: 'var(--cms-muted)', fontSize: 13}}>
          No gallery images yet. Add images to show multiple angles on the project page.
        </p>
      ) : null}
      <div style={{display: 'grid', gap: 16}}>
        {items.map((item, index) => (
          <div
            key={`${item.src || 'empty'}-${index}`}
            className="adm-card"
            style={{padding: 12, display: 'grid', gap: 10}}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
              <strong style={{fontSize: 13}}>Image {index + 1}</strong>
              {canWrite ? (
                <div style={{display: 'flex', gap: 6}}>
                  <button type="button" className="adm-btn-ghost" onClick={() => move(index, -1)}>
                    ↑
                  </button>
                  <button type="button" className="adm-btn-ghost" onClick={() => move(index, 1)}>
                    ↓
                  </button>
                  <button type="button" className="adm-btn-danger" onClick={() => remove(index)}>
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
            <MediaPicker
              label="Image"
              value={item.src}
              canWrite={canWrite}
              onChange={(url) => update(index, {src: url || ''})}
              focalValue={item.crop}
              onFocalChange={(crop) => update(index, {crop})}
            />
            <div className="adm-grid-2">
              <div className="adm-field">
                <label>Alt (EN)</label>
                <input
                  value={item.altEn}
                  disabled={!canWrite}
                  onChange={(e) => update(index, {altEn: e.target.value})}
                />
              </div>
              <div className="adm-field">
                <label>Alt (AR)</label>
                <input
                  dir="rtl"
                  value={item.altAr}
                  disabled={!canWrite}
                  onChange={(e) => update(index, {altAr: e.target.value})}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
