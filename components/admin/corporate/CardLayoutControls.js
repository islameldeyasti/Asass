'use client';

import {
  DEFAULT_CARD_LAYOUT,
  LAYOUT_DENSITY_PRESETS,
  normalizeCardLayout,
} from '@/lib/cms/corporate/employee-cards';

const SLIDERS = [
  {key: 'padX', label: 'Padding left / right', min: 0, max: 48, step: 1, unit: 'px'},
  {key: 'padY', label: 'Padding top / bottom', min: 0, max: 56, step: 1, unit: 'px'},
  {key: 'headPadY', label: 'Header padding', min: 0, max: 40, step: 1, unit: 'px'},
  {key: 'gap', label: 'Button / chip gap', min: 0, max: 24, step: 1, unit: 'px'},
  {key: 'sectionSpace', label: 'Section spacing', min: 0, max: 36, step: 1, unit: 'px'},
  {key: 'actionsMargin', label: 'Actions top margin', min: 0, max: 40, step: 1, unit: 'px'},
  {key: 'radius', label: 'Card corner radius', min: 0, max: 36, step: 1, unit: 'px'},
  {key: 'nameSize', label: 'Name size', min: 1, max: 2.2, step: 0.05, unit: 'rem'},
  {key: 'titleSize', label: 'Title size', min: 0.75, max: 1.3, step: 0.05, unit: 'rem'},
  {key: 'bioSize', label: 'Bio size', min: 0.75, max: 1.2, step: 0.05, unit: 'rem'},
];

/**
 * Universal layout controls — apply to every card template via CSS variables.
 */
export default function CardLayoutControls({
  layout = DEFAULT_CARD_LAYOUT,
  density = 'default',
  canWrite = false,
  onChange,
}) {
  const L = normalizeCardLayout(layout);

  function commit(nextLayout, nextDensity) {
    onChange?.({
      layout: normalizeCardLayout(nextLayout),
      cardDensity: nextDensity,
    });
  }

  function setKey(key, value) {
    commit({...L, [key]: value}, 'custom');
  }

  function applyDensity(id) {
    const preset = LAYOUT_DENSITY_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    commit(preset.layout, id);
  }

  function resetDefaults() {
    commit(DEFAULT_CARD_LAYOUT, 'default');
  }

  return (
    <div className="ecs-layout-controls">
      <div className="ecs-layout-head">
        <strong>Spacing &amp; type</strong>
        <p className="ecs-help" style={{margin: '4px 0 0'}}>
          Works on every template. Adjust padding, margins, gaps, corners, and text sizes — preview updates live.
        </p>
      </div>

      <div className="adm-field">
        <label>Density preset</label>
        <div className="adm-actions" style={{flexWrap: 'wrap'}}>
          {LAYOUT_DENSITY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={density === preset.id ? 'adm-btn' : 'adm-btn-ghost'}
              disabled={!canWrite}
              onClick={() => applyDensity(preset.id)}
            >
              {preset.label}
            </button>
          ))}
          <button type="button" className="adm-btn-ghost" disabled={!canWrite} onClick={resetDefaults}>
            Reset
          </button>
        </div>
      </div>

      <div className="ecs-layout-sliders">
        {SLIDERS.map((slider) => (
          <div key={slider.key} className="adm-field ecs-layout-row">
            <div className="ecs-layout-label">
              <label htmlFor={`layout-${slider.key}`}>{slider.label}</label>
              <span>
                {slider.unit === 'rem' ? Number(L[slider.key]).toFixed(2) : L[slider.key]}
                {slider.unit}
              </span>
            </div>
            <input
              id={`layout-${slider.key}`}
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={L[slider.key]}
              disabled={!canWrite}
              onChange={(e) => setKey(slider.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
