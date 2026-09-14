'use client';

import {useState} from 'react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import {
  createDesignLayer,
  normalizeDesignLayers,
} from '@/lib/cms/corporate/letterhead-model';

const SLIDERS = [
  {key: 'x', label: 'Left', min: 0, max: 200, step: 0.5},
  {key: 'y', label: 'Top', min: 0, max: 280, step: 0.5},
  {key: 'w', label: 'Width', min: 1, max: 210, step: 0.5},
  {key: 'h', label: 'Height', min: 0.4, max: 120, step: 0.5},
  {key: 'opacity', label: 'Opacity', min: 0.1, max: 1, step: 0.05},
];

/**
 * Draw shapes + upload logos onto any letterhead (best with Blank).
 */
export default function LetterheadDesignTools({
  layers = [],
  canWrite = false,
  onChange,
}) {
  const list = normalizeDesignLayers(layers);
  const [selectedId, setSelectedId] = useState(list[0]?.id || '');
  const selected = list.find((item) => item.id === selectedId) || null;

  function commit(next) {
    const normalized = normalizeDesignLayers(next);
    onChange?.(normalized);
    if (selectedId && !normalized.some((item) => item.id === selectedId)) {
      setSelectedId(normalized[normalized.length - 1]?.id || '');
    }
  }

  function addLayer(type) {
    if (!canWrite) return;
    const layer = createDesignLayer(type);
    const next = [...list, layer];
    commit(next);
    setSelectedId(layer.id);
  }

  function updateSelected(patch) {
    if (!selected || !canWrite) return;
    commit(list.map((item) => (item.id === selected.id ? {...item, ...patch} : item)));
  }

  function removeSelected() {
    if (!selected || !canWrite) return;
    commit(list.filter((item) => item.id !== selected.id));
    setSelectedId('');
  }

  function moveSelected(delta) {
    if (!selected || !canWrite) return;
    const index = list.findIndex((item) => item.id === selected.id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= list.length) return;
    const next = [...list];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    commit(next.map((item, z) => ({...item, z})));
  }

  return (
    <div className="lhs-design-tools">
      <p className="lhs-label" style={{marginTop: 14}}>
        Draw &amp; logos
      </p>
      <p className="lhs-help" style={{margin: '0 0 8px', fontSize: 12, color: '#5b6472'}}>
        Build your own header/footer: add shapes and upload logos, then move them on the A4 page.
      </p>

      <div className="lhs-segment" style={{flexWrap: 'wrap'}}>
        <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => addLayer('rect')}>
          Rectangle
        </button>
        <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => addLayer('bar')}>
          Bar
        </button>
        <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => addLayer('line')}>
          Line
        </button>
        <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => addLayer('logo')}>
          Logo
        </button>
      </div>

      {list.length === 0 ? (
        <p className="lhs-help" style={{marginTop: 8, fontSize: 12, color: '#5b6472'}}>
          No custom layers yet. Start with Bar / Logo for a simple brand header.
        </p>
      ) : (
        <div className="lhs-layer-list">
          {list.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`lhs-layer-item${selectedId === layer.id ? ' is-active' : ''}`}
              onClick={() => setSelectedId(layer.id)}
            >
              <span>{layer.type}</span>
              <em>
                {Math.round(layer.w)}×{Math.round(layer.h)}mm
              </em>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div className="lhs-layer-editor">
          <div className="lhs-segment" style={{marginBottom: 8}}>
            <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => moveSelected(-1)}>
              ↑
            </button>
            <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={() => moveSelected(1)}>
              ↓
            </button>
            <button type="button" className="lhs-segment-btn" disabled={!canWrite} onClick={removeSelected}>
              Delete
            </button>
          </div>

          {selected.type === 'logo' ? (
            <MediaPicker
              label="Logo image"
              value={selected.src || ''}
              canWrite={canWrite}
              onChange={(url) => updateSelected({src: url || ''})}
            />
          ) : (
            <label className="lhs-field">
              <span>Color</span>
              <div className="ecs-color-input" style={{display: 'flex', gap: 8}}>
                <input
                  type="color"
                  value={selected.color || '#070463'}
                  disabled={!canWrite}
                  onChange={(e) => updateSelected({color: e.target.value})}
                />
                <input
                  className="lhs-input"
                  value={selected.color || '#070463'}
                  disabled={!canWrite}
                  dir="ltr"
                  onChange={(e) => updateSelected({color: e.target.value})}
                />
              </div>
            </label>
          )}

          {SLIDERS.map((slider) => (
            <label key={slider.key} className="lhs-field lhs-chrome-row">
              <span className="lhs-chrome-label">
                {slider.label}
                <em>
                  {slider.key === 'opacity'
                    ? Number(selected[slider.key] ?? 1).toFixed(2)
                    : `${Number(selected[slider.key] ?? 0).toFixed(1)}mm`}
                </em>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={selected[slider.key] ?? slider.min}
                disabled={!canWrite}
                onChange={(e) => updateSelected({[slider.key]: Number(e.target.value)})}
              />
            </label>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .lhs-layer-list {
          display: grid;
          gap: 4px;
          margin-top: 10px;
        }
        .lhs-layer-item {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          border: 1px solid rgba(7, 4, 99, 0.1);
          border-radius: 8px;
          background: #fff;
          padding: 8px 10px;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }
        .lhs-layer-item.is-active {
          border-color: #070463;
          box-shadow: 0 0 0 1px rgba(7, 4, 99, 0.2);
        }
        .lhs-layer-item em {
          font-style: normal;
          color: #64748b;
        }
        .lhs-layer-editor {
          margin-top: 10px;
          padding: 10px;
          border-radius: 10px;
          background: #f7f8fb;
          border: 1px solid rgba(7, 4, 99, 0.08);
          display: grid;
          gap: 8px;
        }
        .lhs-chrome-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .lhs-chrome-label em {
          font-style: normal;
          font-weight: 700;
          color: #070463;
        }
        .lhs-chrome-row input[type='range'] {
          width: 100%;
          accent-color: #070463;
        }
      `}</style>
    </div>
  );
}
