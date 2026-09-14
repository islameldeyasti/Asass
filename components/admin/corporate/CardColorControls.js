'use client';

import MediaPicker from '@/components/admin/media/MediaPicker';
import {
  DEFAULT_CARD_COLORS,
  normalizeCardColors,
} from '@/lib/cms/corporate/employee-cards';

const COLOR_FIELDS = [
  {key: 'primary', label: 'Primary (brand)'},
  {key: 'accent', label: 'Accent'},
  {key: 'ink', label: 'Text'},
  {key: 'muted', label: 'Muted text'},
  {key: 'shellBg', label: 'Card background'},
  {key: 'headBg', label: 'Header / cover color'},
  {key: 'headText', label: 'Header text'},
  {key: 'overlayColor', label: 'Cover overlay color'},
];

/**
 * Colors + cover image + overlay — applies to every template via CSS variables.
 */
export default function CardColorControls({
  colors = DEFAULT_CARD_COLORS,
  coverImage = '',
  coverFocal = '50% 40%',
  canWrite = false,
  onChange,
}) {
  const C = normalizeCardColors(colors);

  function setColor(key, value) {
    onChange?.({
      colors: normalizeCardColors({...C, [key]: value}),
    });
  }

  function resetColors() {
    onChange?.({colors: {...DEFAULT_CARD_COLORS}});
  }

  return (
    <div className="ecs-layout-controls">
      <div className="ecs-layout-head">
        <strong>Colors &amp; cover</strong>
        <p className="ecs-help" style={{margin: '4px 0 0'}}>
          Change brand colors, card background, cover photo, and overlay. Works on every template.
        </p>
      </div>

      <div className="ecs-color-grid">
        {COLOR_FIELDS.map((field) => (
          <div key={field.key} className="adm-field ecs-color-field">
            <label htmlFor={`color-${field.key}`}>{field.label}</label>
            <div className="ecs-color-input">
              <input
                id={`color-${field.key}`}
                type="color"
                value={C[field.key]}
                disabled={!canWrite}
                onChange={(e) => setColor(field.key, e.target.value)}
              />
              <input
                type="text"
                value={C[field.key]}
                disabled={!canWrite}
                dir="ltr"
                onChange={(e) => setColor(field.key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="adm-actions">
        <button type="button" className="adm-btn-ghost" disabled={!canWrite} onClick={resetColors}>
          Reset colors
        </button>
      </div>

      <MediaPicker
        label="Cover / header background image"
        hint="Optional. Used on headers and cover bands across all templates."
        value={coverImage || ''}
        canWrite={canWrite}
        cropAspect={16 / 9}
        focalValue={coverFocal || '50% 40%'}
        onChange={(url) => onChange?.({coverImage: url || ''})}
        onFocalChange={(focal) => onChange?.({coverFocal: focal})}
      />

      <div className="adm-field ecs-layout-row">
        <div className="ecs-layout-label">
          <label htmlFor="cover-overlay">Cover overlay strength</label>
          <span>{C.overlayOpacity}%</span>
        </div>
        <input
          id="cover-overlay"
          type="range"
          min={0}
          max={90}
          step={1}
          value={C.overlayOpacity}
          disabled={!canWrite || !coverImage}
          onChange={(e) => setColor('overlayOpacity', Number(e.target.value))}
        />
        <p className="ecs-help" style={{margin: '4px 0 0'}}>
          {coverImage
            ? 'Darkens the cover image so logo and text stay readable.'
            : 'Upload a cover image to enable the overlay.'}
        </p>
      </div>
    </div>
  );
}
