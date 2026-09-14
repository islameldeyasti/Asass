'use client';

import {
  DEFAULT_LETTERHEAD_CHROME_LAYOUT,
  normalizeLetterheadChromeLayout,
} from '@/lib/cms/corporate/letterhead-model';

const GROUPS = [
  {
    title: 'Header logo',
    items: [
      {key: 'logoLeft', label: 'Logo left', min: 0, max: 120, step: 0.5},
      {key: 'logoTop', label: 'Logo top', min: 0, max: 70, step: 0.5},
      {key: 'logoPad', label: 'Logo padding', min: 0, max: 10, step: 0.5},
    ],
  },
  {
    title: 'Address & email',
    items: [
      {key: 'addrLeft', label: 'Block left', min: 0, max: 100, step: 0.5},
      {key: 'addrBottom', label: 'Block bottom', min: 0, max: 36, step: 0.5},
      {key: 'emailGap', label: 'Address ↔ email gap', min: 0, max: 20, step: 0.5},
    ],
  },
  {
    title: 'Phones',
    items: [
      {key: 'phonesRight', label: 'Phones right', min: 0, max: 60, step: 0.5},
      {key: 'phonesBottom', label: 'Phones bottom', min: 0, max: 28, step: 0.5},
    ],
  },
  {
    title: 'Website / CTA',
    items: [
      {key: 'ctaRight', label: 'CTA right', min: 0, max: 60, step: 0.5},
      {key: 'ctaBottom', label: 'CTA bottom', min: 0, max: 36, step: 0.5},
    ],
  },
  {
    title: 'QR code',
    items: [
      {key: 'qrRight', label: 'QR right', min: 0, max: 60, step: 0.5},
      {key: 'qrBottom', label: 'QR bottom', min: 20, max: 80, step: 0.5},
      {key: 'qrSize', label: 'QR size', min: 14, max: 34, step: 0.5},
    ],
  },
];

/**
 * Sliders to move / pad letterhead chrome (logo + footer blocks).
 */
export default function LetterheadChromeControls({
  layout = DEFAULT_LETTERHEAD_CHROME_LAYOUT,
  canWrite = false,
  onChange,
  onPreviewFocus,
}) {
  const L = normalizeLetterheadChromeLayout(layout);

  function setKey(key, value) {
    const next = normalizeLetterheadChromeLayout({...L, [key]: value});
    onChange?.(next);
    if (key.startsWith('logo')) onPreviewFocus?.('header');
    else onPreviewFocus?.('footer');
  }

  function reset() {
    onChange?.({...DEFAULT_LETTERHEAD_CHROME_LAYOUT});
  }

  return (
    <div className="lhs-chrome-controls">
      <p className="lhs-label" style={{marginTop: 14}}>
        Move &amp; padding
      </p>
      <p className="lhs-help" style={{margin: '0 0 8px', fontSize: 12, color: '#5b6472'}}>
        Position the header logo and footer blocks (address, email, phones, website, QR). Values are in mm.
      </p>
      <button
        type="button"
        className="lhs-btn lhs-btn-ghost lhs-btn-block"
        disabled={!canWrite}
        onClick={reset}
        style={{marginBottom: 10}}
      >
        Reset positions
      </button>
      {GROUPS.map((group) => (
        <div key={group.title} className="lhs-chrome-group">
          <strong>{group.title}</strong>
          {group.items.map((item) => (
            <label key={item.key} className="lhs-field lhs-chrome-row">
              <span className="lhs-chrome-label">
                {item.label}
                <em>
                  {Number(L[item.key]).toFixed(1)}
                  mm
                </em>
              </span>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={L[item.key]}
                disabled={!canWrite}
                onChange={(e) => setKey(item.key, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      ))}
      <style jsx>{`
        .lhs-chrome-controls {
          display: grid;
          gap: 8px;
        }
        .lhs-chrome-group {
          display: grid;
          gap: 6px;
          padding: 10px;
          border: 1px solid rgba(7, 4, 99, 0.08);
          border-radius: 10px;
          background: #f7f8fb;
        }
        .lhs-chrome-group strong {
          font-size: 12px;
          color: #070463;
        }
        .lhs-chrome-row {
          margin: 0;
        }
        .lhs-chrome-label {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .lhs-chrome-label em {
          font-style: normal;
          font-weight: 700;
          color: #070463;
          font-variant-numeric: tabular-nums;
        }
        .lhs-chrome-row input[type='range'] {
          width: 100%;
          accent-color: #070463;
        }
      `}</style>
    </div>
  );
}
