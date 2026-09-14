'use client';

import {useState} from 'react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import {useToast} from '@/components/admin/ui/ToastProvider';
import {BRAND_COLORS, normalizeBranding} from '@/lib/cms/branding';

const SLOTS = [
  {
    key: 'primaryLogo',
    label: 'Primary logo',
    hint: 'Main brand mark used as the default logo.',
  },
  {
    key: 'lightLogo',
    label: 'Light logo',
    hint: 'For light backgrounds (header in light mode).',
  },
  {
    key: 'darkLogo',
    label: 'Dark / reverse logo',
    hint: 'White or light mark for navy/dark surfaces.',
  },
  {
    key: 'headerLogoLight',
    label: 'Header logo (light)',
    hint: 'Overrides light logo in the site header.',
  },
  {
    key: 'headerLogoDark',
    label: 'Header logo (dark)',
    hint: 'Overrides dark logo in the site header.',
  },
  {
    key: 'footerLogo',
    label: 'Footer logo',
    hint: 'Shown in the site footer.',
  },
  {
    key: 'mobileLogo',
    label: 'Mobile logo (optional)',
    hint: 'Optional compact mark for small screens.',
  },
  {
    key: 'favicon',
    label: 'Favicon',
    hint: 'Browser tab icon.',
  },
  {
    key: 'appleTouchIcon',
    label: 'Apple touch icon',
    hint: 'Home-screen icon for iOS.',
  },
  {
    key: 'defaultOgImage',
    label: 'Default social / OG image',
    hint: 'Fallback image for link previews.',
  },
  {
    key: 'printLogo',
    label: 'Print / letterhead mark',
    hint: 'Used by Letterhead Studio defaults.',
  },
  {
    key: 'letterheadLogo',
    label: 'Letterhead lockup',
    hint: 'Full ASAS lockup for official PDF letterhead.',
  },
  {
    key: 'emailLogo',
    label: 'Email / document logo',
    hint: 'Optional logo for email and document systems.',
  },
];

function PreviewPair({src, label}) {
  if (!src) {
    return (
      <div className="brand-preview-empty">
        No media selected for {label}
      </div>
    );
  }
  return (
    <div className="brand-preview-pair">
      <div className="brand-preview brand-preview--light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
        <span>Light background</span>
      </div>
      <div className="brand-preview brand-preview--dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" />
        <span>Dark background</span>
      </div>
    </div>
  );
}

export default function BrandingSettingsForm({
  initialBranding = {},
  canWrite = false,
}) {
  const {toast} = useToast();
  const [branding, setBranding] = useState(() => normalizeBranding(initialBranding));
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState('saved');

  function setSlot(key, url) {
    setBranding((prev) => normalizeBranding({...prev, [key]: url || ''}));
    setSaveState('unsaved');
  }

  async function save() {
    if (!canWrite) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'settings',
          document: {branding: normalizeBranding(branding)},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setBranding(normalizeBranding(data.document?.branding || branding));
      setSaveState('saved');
      toast?.({title: 'Branding saved', variant: 'success'});
    } catch (err) {
      setSaveState('error');
      toast?.({
        title: 'Could not save branding',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="brand-settings">
      <div className="cms-card brand-settings-hero">
        <div>
          <strong>Website branding</strong>
          <p>
            Upload logos, favicon, and social images here. Header, footer, SEO, and
            letterhead read from these settings — no file paths required.
          </p>
        </div>
        <div className="brand-settings-actions">
          <span className={`brand-save-pill is-${saveState}`}>
            {saveState === 'unsaved'
              ? 'Unsaved changes'
              : saveState === 'error'
                ? 'Save failed'
                : 'Saved'}
          </span>
          <button
            type="button"
            className="adm-btn"
            disabled={!canWrite || saving || saveState === 'saved'}
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save branding'}
          </button>
        </div>
      </div>

      <div className="cms-card brand-colors">
        <h3>Brand colors</h3>
        <p className="brand-hint">
          Official ASAS palette (protected). Editors cannot override the public design system
          from this screen.
        </p>
        <div className="brand-color-row">
          <div className="brand-swatch" style={{background: BRAND_COLORS.navy}}>
            <span>ASAS Navy</span>
            <code>{BRAND_COLORS.navy}</code>
          </div>
          <div className="brand-swatch" style={{background: BRAND_COLORS.rust}}>
            <span>ASAS Rust</span>
            <code>{BRAND_COLORS.rust}</code>
          </div>
        </div>
      </div>

      <div className="brand-slots">
        {SLOTS.map((slot) => (
          <section key={slot.key} className="cms-card brand-slot">
            <div className="brand-slot-head">
              <div>
                <h3>{slot.label}</h3>
                <p>{slot.hint}</p>
              </div>
            </div>
            <PreviewPair src={branding[slot.key]} label={slot.label} />
            <MediaPicker
              label={slot.label}
              value={branding[slot.key] || ''}
              canWrite={canWrite}
              onChange={(url) => setSlot(slot.key, url)}
            />
          </section>
        ))}
      </div>

      <style jsx global>{`
        .brand-settings {
          display: grid;
          gap: 16px;
        }
        .brand-settings-hero {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
        .brand-settings-hero p,
        .brand-slot p,
        .brand-hint {
          margin: 6px 0 0;
          color: var(--cms-muted);
          font-size: 13px;
          line-height: 1.45;
        }
        .brand-settings-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .brand-save-pill {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 999px;
          background: #ecfdf3;
          color: #15803d;
        }
        .brand-save-pill.is-unsaved {
          background: #fff7ed;
          color: #c2410c;
        }
        .brand-save-pill.is-error {
          background: #fef2f2;
          color: #b91c1c;
        }
        .brand-color-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .brand-swatch {
          border-radius: 12px;
          padding: 18px;
          color: #fff;
          display: grid;
          gap: 6px;
          min-height: 88px;
        }
        .brand-swatch code {
          font-size: 12px;
          opacity: 0.9;
        }
        .brand-slots {
          display: grid;
          gap: 14px;
        }
        .brand-slot-head h3 {
          margin: 0;
          font-size: 16px;
        }
        .brand-preview-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 12px 0;
        }
        .brand-preview {
          border-radius: 12px;
          min-height: 120px;
          display: grid;
          place-items: center;
          gap: 8px;
          padding: 16px;
          border: 1px solid var(--cms-border);
        }
        .brand-preview img {
          max-width: 120px;
          max-height: 72px;
          object-fit: contain;
        }
        .brand-preview span {
          font-size: 11px;
          color: var(--cms-muted);
        }
        .brand-preview--light {
          background: #fff;
        }
        .brand-preview--dark {
          background: #070463;
        }
        .brand-preview--dark span {
          color: rgba(255, 255, 255, 0.72);
        }
        .brand-preview-empty {
          margin: 12px 0;
          padding: 24px;
          border: 1px dashed var(--cms-border);
          border-radius: 12px;
          color: var(--cms-muted);
          text-align: center;
          font-size: 13px;
        }
        @media (max-width: 720px) {
          .brand-preview-pair {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
