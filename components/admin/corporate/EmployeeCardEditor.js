'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Save,
} from 'lucide-react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import DigitalCardProfile from '@/components/corporate/cards/DigitalCardProfile';
import TemplateGallery from '@/components/admin/corporate/TemplateGallery';
import CardLayoutControls from '@/components/admin/corporate/CardLayoutControls';
import CardColorControls from '@/components/admin/corporate/CardColorControls';
import {
  THEME_PRESETS,
  SECTION_KEYS,
  buildPublicCardPath,
  copyCardDesign,
  getCardTemplate,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {company as defaultCompany} from '@/data/company';
import '@/app/corporate-cards.css';

const TABS = [
  {id: 'profile', label: 'Profile'},
  {id: 'design', label: 'Design'},
  {id: 'contact', label: 'Contact'},
  {id: 'qr', label: 'QR & Share'},
  {id: 'publish', label: 'Publish'},
];

function listToText(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function textToList(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function VisibilityToggle({label, checked, onChange, disabled}) {
  return (
    <label className="adm-switch ecs-visibility">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="adm-switch-track" aria-hidden />
      <span>
        {checked ? 'Shown publicly' : 'Hidden'}
        <em style={{display: 'block', color: 'var(--cms-muted)', fontStyle: 'normal', fontWeight: 400}}>
          {label}
        </em>
      </span>
    </label>
  );
}

export default function EmployeeCardEditor({
  member: initialMember,
  company = defaultCompany,
  branding,
  canWrite = false,
  canPublish = false,
  peers = [],
}) {
  const router = useRouter();
  const [tab, setTab] = useState('design');
  const [draft, setDraft] = useState(() => {
    const card = normalizeDigitalCard(initialMember?.digital_card);
    return {...initialMember, digital_card: card};
  });
  const [specialtiesEnText, setSpecialtiesEnText] = useState(() =>
    listToText(normalizeDigitalCard(initialMember?.digital_card).specialtiesEn),
  );
  const [specialtiesArText, setSpecialtiesArText] = useState(() =>
    listToText(normalizeDigitalCard(initialMember?.digital_card).specialtiesAr),
  );
  const [previewLocale, setPreviewLocale] = useState('en');
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [focusPreview, setFocusPreview] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copyFromId, setCopyFromId] = useState('');

  const card = draft.digital_card;
  const template = getCardTemplate(card.templateId);
  const publicPath = card.publicId ? buildPublicCardPath(card.publicId) : '';

  useEffect(() => {
    let cancelled = false;
    async function loadQr() {
      if (!publicPath) {
        setQrDataUrl('');
        return;
      }
      try {
        const QRCode = (await import('qrcode')).default;
        // Absolute URL only inside effect (client) so SSR/client markup stays identical.
        const absoluteUrl = `${window.location.origin}${publicPath}`;
        const url = await QRCode.toDataURL(absoluteUrl, {
          errorCorrectionLevel: 'Q',
          margin: 2,
          width: 512,
          color: {dark: '#070463', light: '#ffffff'},
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl('');
      }
    }
    loadQr();
    return () => {
      cancelled = true;
    };
  }, [publicPath]);

  function setCard(patch) {
    setDraft((current) => ({
      ...current,
      digital_card: normalizeDigitalCard({...current.digital_card, ...patch}),
    }));
  }

  function setMemberField(key, value) {
    setDraft((current) => ({...current, [key]: value}));
  }

  async function save({publish = false, disable = false} = {}) {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      let nextCard = normalizeDigitalCard({
        ...card,
        specialtiesEn: textToList(specialtiesEnText),
        specialtiesAr: textToList(specialtiesArText),
      });
      if (publish) {
        if (!canPublish) throw new Error('Publish permission required');
        nextCard = {...nextCard, enabled: true, status: 'published'};
      }
      if (disable) {
        nextCard = {...nextCard, enabled: false, status: 'disabled'};
      }
      const res = await fetch(`/api/admin/team/${draft.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          digital_card: nextCard,
          profile_image: draft.profile_image,
          profile_image_focal: draft.profile_image_focal,
          name_en: draft.name_en,
          name_ar: draft.name_ar,
          job_title_en: draft.job_title_en,
          job_title_ar: draft.job_title_ar,
          department_en: draft.department_en,
          department_ar: draft.department_ar,
          short_bio_en: draft.short_bio_en,
          short_bio_ar: draft.short_bio_ar,
          email: draft.email,
          phone: draft.phone,
          linkedin_url: draft.linkedin_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft((current) => ({
        ...current,
        ...data.member,
        digital_card: normalizeDigitalCard(data.member.digital_card),
      }));
      setMessage(publish ? 'Published.' : disable ? 'Disabled.' : 'Saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicPath) return;
    const absoluteUrl = `${window.location.origin}${publicPath}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setMessage('Public URL copied.');
  }

  function applyDesignCopy() {
    const peer = peers.find((item) => item.id === copyFromId);
    if (!peer) return;
    setCard(copyCardDesign(peer.digital_card, card));
    setMessage('Design copied (personal data unchanged).');
  }

  const previewMember = useMemo(
    () => ({
      ...draft,
      digital_card: normalizeDigitalCard({
        ...card,
        specialtiesEn: textToList(specialtiesEnText),
        specialtiesAr: textToList(specialtiesArText),
      }),
    }),
    [draft, card, specialtiesEnText, specialtiesArText],
  );

  const status = !card.enabled
    ? 'disabled'
    : card.status === 'published'
      ? 'published'
      : card.status || 'draft';

  return (
    <div className={`ecs-studio${focusPreview ? ' is-focus' : ''}`}>
      <header className="ecs-topbar">
        <div>
          <Link className="adm-btn-ghost" href="/admin/corporate/employee-cards">
            <ArrowLeft size={14} /> Cards
          </Link>
          <h1>{draft.name_en || 'Employee card'}</h1>
          <p>
            <span className={`cms-badge cms-badge--${status}`}>{status}</span>
            {publicPath ? (
              <a href={publicPath} target="_blank" rel="noreferrer">
                {publicPath} <ExternalLink size={12} />
              </a>
            ) : (
              <span>Public ID assigned on first save</span>
            )}
          </p>
        </div>
        <div className="ecs-topbar-actions">
          <button type="button" className="adm-btn-ghost" onClick={() => setFocusPreview((v) => !v)}>
            <Eye size={14} /> {focusPreview ? 'Exit focus' : 'Focus preview'}
          </button>
          <button type="button" className="adm-btn-ghost" disabled={!canWrite || saving} onClick={() => save()}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
          {canPublish ? (
            <button type="button" className="adm-btn" disabled={!canWrite || saving} onClick={() => save({publish: true})}>
              Publish
            </button>
          ) : null}
        </div>
      </header>

      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      <div className="ecs-layout">
        {!focusPreview ? (
          <aside className="ecs-panel ecs-panel--left">
            <nav className="ecs-tabs" aria-label="Editor sections">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? 'is-active' : ''}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="ecs-panel-body">
              {tab === 'profile' ? (
                <div className="ecs-stack">
                  <MediaPicker
                    label="Profile photo"
                    hint="Used for the employee portrait on the digital card."
                    value={draft.profile_image || ''}
                    canWrite={canWrite}
                    cropAspect={1}
                    focalValue={draft.profile_image_focal || '50% 30%'}
                    onChange={(url) => setMemberField('profile_image', url || '')}
                    onFocalChange={(focal) => setMemberField('profile_image_focal', focal)}
                  />
                  <MediaPicker
                    label="Cover image"
                    hint="Separate background/cover for templates that show a cover. Optional but recommended."
                    value={card.coverImage || ''}
                    canWrite={canWrite}
                    cropAspect={16 / 9}
                    focalValue={card.coverFocal || '50% 40%'}
                    onChange={(url) => setCard({coverImage: url || ''})}
                    onFocalChange={(focal) => setCard({coverFocal: focal})}
                  />
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Full name (EN)</label>
                      <input value={draft.name_en || ''} disabled={!canWrite} onChange={(e) => setMemberField('name_en', e.target.value)} />
                    </div>
                    <div className="adm-field">
                      <label>Full name (AR)</label>
                      <input dir="rtl" value={draft.name_ar || ''} disabled={!canWrite} onChange={(e) => setMemberField('name_ar', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Position (EN)</label>
                      <input value={draft.job_title_en || ''} disabled={!canWrite} onChange={(e) => setMemberField('job_title_en', e.target.value)} />
                    </div>
                    <div className="adm-field">
                      <label>Position (AR)</label>
                      <input dir="rtl" value={draft.job_title_ar || ''} disabled={!canWrite} onChange={(e) => setMemberField('job_title_ar', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Department (EN)</label>
                      <input value={draft.department_en || ''} disabled={!canWrite} onChange={(e) => setMemberField('department_en', e.target.value)} />
                    </div>
                    <div className="adm-field">
                      <label>Department (AR)</label>
                      <input dir="rtl" value={draft.department_ar || ''} disabled={!canWrite} onChange={(e) => setMemberField('department_ar', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Short bio (EN)</label>
                      <textarea rows={4} value={draft.short_bio_en || ''} disabled={!canWrite} onChange={(e) => setMemberField('short_bio_en', e.target.value)} />
                    </div>
                    <div className="adm-field">
                      <label>Short bio (AR)</label>
                      <textarea rows={4} dir="rtl" value={draft.short_bio_ar || ''} disabled={!canWrite} onChange={(e) => setMemberField('short_bio_ar', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Specialties (EN)</label>
                      <textarea rows={3} value={specialtiesEnText} disabled={!canWrite} onChange={(e) => setSpecialtiesEnText(e.target.value)} />
                    </div>
                    <div className="adm-field">
                      <label>Specialties (AR)</label>
                      <textarea rows={3} dir="rtl" value={specialtiesArText} disabled={!canWrite} onChange={(e) => setSpecialtiesArText(e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label>Location (EN)</label>
                      <input value={card.officeLocationEn || ''} disabled={!canWrite} onChange={(e) => setCard({officeLocationEn: e.target.value})} />
                    </div>
                    <div className="adm-field">
                      <label>Location (AR)</label>
                      <input dir="rtl" value={card.officeLocationAr || ''} disabled={!canWrite} onChange={(e) => setCard({officeLocationAr: e.target.value})} />
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === 'design' ? (
                <div className="ecs-stack">
                  <strong>Templates</strong>
                  <p className="ecs-help">Choose a complete art direction — not a color swap.</p>
                  <TemplateGallery
                    member={previewMember}
                    card={card}
                    company={company}
                    branding={branding}
                    locale={previewLocale}
                    selectedId={card.templateId}
                    onSelect={(id) => setCard({templateId: id})}
                    qrDataUrl={qrDataUrl}
                  />
                  {template.supportsCover ? (
                    <p className="ecs-help">
                      This template uses the cover image from the Profile tab. Change it there anytime.
                    </p>
                  ) : (
                    <p className="ecs-help">
                      Cover image is saved on Profile. Switch to a cover-style template to display it.
                    </p>
                  )}
                  <div className="adm-field">
                    <label>Theme preset</label>
                    <select
                      value={card.themePreset}
                      disabled={!canWrite}
                      onChange={(e) => setCard({themePreset: e.target.value})}
                    >
                      {THEME_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Logo variant</label>
                    <select
                      value={card.logoVariant}
                      disabled={!canWrite}
                      onChange={(e) => setCard({logoVariant: e.target.value})}
                    >
                      <option value="auto">Auto (template)</option>
                      <option value="light">Light logo</option>
                      <option value="dark">Dark logo</option>
                    </select>
                  </div>

                  <CardColorControls
                    colors={card.colors}
                    coverImage={card.coverImage}
                    coverFocal={card.coverFocal}
                    canWrite={canWrite}
                    onChange={(patch) => setCard(patch)}
                  />

                  <CardLayoutControls
                    layout={card.layout}
                    density={card.cardDensity}
                    canWrite={canWrite}
                    onChange={(patch) => setCard(patch)}
                  />

                  <div className="ecs-toggles">
                    {[
                      ['showBio', 'Show bio'],
                      ['showDepartment', 'Show department'],
                      ['showQrOnCard', 'Show QR on card'],
                      ['showSocialButtons', 'Show social buttons'],
                      ['showContactActions', 'Show contact actions'],
                      ['showSpecialties', 'Show specialties'],
                      ['showQualifications', 'Show qualifications'],
                      ['showLanguages', 'Show languages'],
                    ].map(([key, label]) => (
                      <label key={key} className="ecs-check">
                        <input
                          type="checkbox"
                          checked={Boolean(card[key])}
                          disabled={!canWrite}
                          onChange={(e) => setCard({[key]: e.target.checked})}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="adm-field">
                    <label>Optional section order</label>
                    <p className="ecs-help">Comma-separated: {SECTION_KEYS.join(', ')}</p>
                    <input
                      value={(card.sectionsOrder || []).join(', ')}
                      disabled={!canWrite}
                      onChange={(e) =>
                        setCard({
                          sectionsOrder: e.target.value
                            .split(',')
                            .map((part) => part.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div className="adm-field">
                    <label>Copy design from employee</label>
                    <div className="ecs-inline">
                      <select value={copyFromId} onChange={(e) => setCopyFromId(e.target.value)} disabled={!canWrite}>
                        <option value="">Select…</option>
                        {peers
                          .filter((peer) => peer.id !== draft.id)
                          .map((peer) => (
                            <option key={peer.id} value={peer.id}>
                              {peer.name_en}
                            </option>
                          ))}
                      </select>
                      <button type="button" className="adm-btn-ghost" disabled={!canWrite || !copyFromId} onClick={applyDesignCopy}>
                        <Copy size={14} /> Copy design
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === 'contact' ? (
                <div className="ecs-stack">
                  <p className="ecs-help">Privacy is explicit — only checked fields appear publicly / in vCard.</p>
                  <div className="adm-field">
                    <label>Work email</label>
                    <input type="email" value={draft.email || ''} disabled={!canWrite} onChange={(e) => setMemberField('email', e.target.value)} />
                    <VisibilityToggle label="Email" checked={card.showEmail} disabled={!canWrite} onChange={(e) => setCard({showEmail: e.target.checked})} />
                  </div>
                  <div className="adm-field">
                    <label>Phone</label>
                    <input value={draft.phone || ''} disabled={!canWrite} onChange={(e) => setMemberField('phone', e.target.value)} dir="ltr" />
                    <VisibilityToggle label="Phone" checked={card.showPhone} disabled={!canWrite} onChange={(e) => setCard({showPhone: e.target.checked})} />
                  </div>
                  <div className="adm-field">
                    <label>Mobile</label>
                    <input value={card.mobile || ''} disabled={!canWrite} onChange={(e) => setCard({mobile: e.target.value})} dir="ltr" />
                    <VisibilityToggle label="Mobile" checked={card.showMobile} disabled={!canWrite} onChange={(e) => setCard({showMobile: e.target.checked})} />
                  </div>
                  <div className="adm-field">
                    <label>WhatsApp</label>
                    <input value={card.whatsapp || ''} disabled={!canWrite} onChange={(e) => setCard({whatsapp: e.target.value})} dir="ltr" placeholder="9715…" />
                    <VisibilityToggle label="WhatsApp" checked={card.showWhatsapp} disabled={!canWrite} onChange={(e) => setCard({showWhatsapp: e.target.checked})} />
                  </div>
                  <div className="adm-field">
                    <label>LinkedIn</label>
                    <input value={draft.linkedin_url || ''} disabled={!canWrite} onChange={(e) => setMemberField('linkedin_url', e.target.value)} dir="ltr" />
                    <VisibilityToggle label="LinkedIn" checked={card.showLinkedin} disabled={!canWrite} onChange={(e) => setCard({showLinkedin: e.target.checked})} />
                  </div>
                  <div className="adm-field">
                    <label>Website</label>
                    <input value={card.website || ''} disabled={!canWrite} onChange={(e) => setCard({website: e.target.value})} dir="ltr" />
                  </div>
                  <div className="adm-field">
                    <label>Office extension</label>
                    <input value={card.officeExtension || ''} disabled={!canWrite} onChange={(e) => setCard({officeExtension: e.target.value})} />
                  </div>
                  <VisibilityToggle label="Location" checked={card.showLocation} disabled={!canWrite} onChange={(e) => setCard({showLocation: e.target.checked})} />
                </div>
              ) : null}

              {tab === 'qr' ? (
                <div className="ecs-stack">
                  <div className="ecs-qr-panel">
                    <strong>Public profile</strong>
                    <p>
                      Status: <b>{status}</b>
                    </p>
                    <p className="ecs-help" dir="ltr">
                      {publicPath || 'Save once to allocate a stable public ID.'}
                    </p>
                    <div className="ecs-inline">
                      <button type="button" className="adm-btn-ghost" disabled={!publicPath} onClick={copyLink}>
                        Copy link
                      </button>
                      {publicPath ? (
                        <a className="adm-btn-ghost" href={publicPath} target="_blank" rel="noreferrer">
                          Open public profile
                        </a>
                      ) : null}
                    </div>
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="ecs-qr-large" src={qrDataUrl} alt="QR code" />
                    ) : (
                      <p className="ecs-help">QR appears after public ID is assigned.</p>
                    )}
                    <div className="ecs-inline">
                      <a
                        className="adm-btn"
                        href={
                          card.publicId
                            ? `/api/public/card-qr?publicId=${encodeURIComponent(card.publicId)}&format=png&size=1024`
                            : '#'
                        }
                      >
                        <Download size={14} /> PNG
                      </a>
                      <a
                        className="adm-btn-ghost"
                        href={
                          card.publicId
                            ? `/api/public/card-qr?publicId=${encodeURIComponent(card.publicId)}&format=svg&size=1024`
                            : '#'
                        }
                      >
                        SVG
                      </a>
                    </div>
                    <ul className="ecs-health">
                      <li>QR encodes stable URL only (not personal data)</li>
                      <li>QR keeps working when job/phone changes</li>
                      <li>Error correction: Q · quiet zone preserved</li>
                    </ul>
                  </div>
                </div>
              ) : null}

              {tab === 'publish' ? (
                <div className="ecs-stack">
                  <p>
                    Current status: <strong>{status}</strong>
                  </p>
                  <div className="ecs-inline">
                    <button type="button" className="adm-btn" disabled={!canWrite || !canPublish || saving} onClick={() => save({publish: true})}>
                      Publish
                    </button>
                    <button type="button" className="adm-btn-ghost" disabled={!canWrite || saving} onClick={() => save()}>
                      Save draft
                    </button>
                    <button type="button" className="adm-btn-danger" disabled={!canWrite || saving} onClick={() => save({disable: true})}>
                      Disable card
                    </button>
                  </div>
                  <p className="ecs-help">
                    Disabled cards keep their public ID and QR. Scanners see a branded unavailable state — not a broken 404.
                  </p>
                  <div className="ecs-analytics">
                    <strong>Analytics (aggregate)</strong>
                    <ul>
                      <li>Views: {card.views || 0}</li>
                      <li>vCard saves: {card.vcardDownloads || 0}</li>
                      <li>Calls: {card.callClicks || 0}</li>
                      <li>Email: {card.emailClicks || 0}</li>
                      <li>WhatsApp: {card.whatsappClicks || 0}</li>
                      <li>Shares: {card.shareClicks || 0}</li>
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}

        <section className="ecs-preview">
          <div className="ecs-preview-toolbar no-print">
            <div className="ecs-inline">
              <button type="button" className={previewDevice === 'mobile' ? 'adm-btn' : 'adm-btn-ghost'} onClick={() => setPreviewDevice('mobile')}>
                Mobile
              </button>
              <button type="button" className={previewDevice === 'desktop' ? 'adm-btn' : 'adm-btn-ghost'} onClick={() => setPreviewDevice('desktop')}>
                Desktop
              </button>
            </div>
            <div className="ecs-inline">
              <button type="button" className={previewLocale === 'en' ? 'adm-btn' : 'adm-btn-ghost'} onClick={() => setPreviewLocale('en')}>
                EN
              </button>
              <button type="button" className={previewLocale === 'ar' ? 'adm-btn' : 'adm-btn-ghost'} onClick={() => setPreviewLocale('ar')}>
                العربية
              </button>
            </div>
          </div>

          <div className={`ecs-device ecs-device--${previewDevice}`}>
            <DigitalCardProfile
              member={previewMember}
              card={previewMember.digital_card}
              company={company}
              branding={branding}
              locale={previewLocale}
              qrDataUrl={qrDataUrl}
              profileUrl={publicPath}
              compact={previewDevice === 'desktop'}
            />
          </div>
        </section>
      </div>

      <style jsx global>{`
        .ecs-studio { display: grid; gap: 14px; }
        .ecs-topbar {
          display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;
          padding: 12px 14px; border: 1px solid rgba(7,4,99,0.08); border-radius: 14px; background: #fff;
        }
        .ecs-topbar h1 { margin: 8px 0 4px; font-size: 1.25rem; }
        .ecs-topbar p { margin: 0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 13px; color: #5b6472; }
        .ecs-topbar-actions, .ecs-inline { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .ecs-layout {
          display: grid;
          grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }
        .ecs-studio.is-focus .ecs-layout { grid-template-columns: 1fr; }
        .ecs-panel {
          border: 1px solid rgba(7,4,99,0.08); border-radius: 14px; background: #fff; overflow: hidden;
        }
        .ecs-tabs {
          display: flex; flex-wrap: wrap; gap: 4px; padding: 10px; border-bottom: 1px solid rgba(7,4,99,0.08);
        }
        .ecs-tabs button {
          border: 0; background: transparent; border-radius: 999px; padding: 7px 12px; font-size: 12px; font-weight: 650; cursor: pointer; color: #5b6472;
        }
        .ecs-tabs button.is-active { background: #070463; color: #fff; }
        .ecs-panel-body { padding: 14px; max-height: calc(100vh - 220px); overflow: auto; }
        .ecs-stack { display: grid; gap: 12px; }
        .ecs-help { margin: 0; font-size: 12px; color: #5b6472; }
        .ecs-preview {
          border: 1px solid rgba(7,4,99,0.08); border-radius: 14px; background: #eef0f5; padding: 14px; min-height: 640px;
        }
        .ecs-preview-toolbar { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .ecs-device {
          margin: 0 auto; background: #fff; border-radius: 28px; padding: 18px 14px 24px;
          box-shadow: 0 18px 40px rgba(7,4,99,0.12);
        }
        .ecs-device--mobile { width: min(100%, 390px); }
        .ecs-device--desktop { width: min(100%, 520px); }
        .ecs-template-gallery {
          display: grid; grid-template-columns: 1fr; gap: 10px;
        }
        .ecs-template-tile {
          text-align: left; border: 1px solid rgba(7,4,99,0.1); border-radius: 14px; background: #f7f8fb; padding: 8px; cursor: pointer;
        }
        .ecs-template-tile.is-active { border-color: #070463; box-shadow: 0 0 0 2px rgba(7,4,99,0.15); }
        .ecs-template-preview {
          pointer-events: none; max-height: 220px; overflow: hidden; border-radius: 12px; background: #e8eaf2;
          transform: scale(0.92); transform-origin: top center;
        }
        .ecs-template-meta { display: grid; gap: 2px; padding: 8px 4px 2px; }
        .ecs-template-meta span { font-size: 11px; color: #5b6472; }
        .ecs-template-meta em { font-style: normal; font-size: 11px; font-weight: 700; color: #070463; }
        .ecs-visibility { display: flex; gap: 8px; align-items: center; margin-top: 6px; font-size: 12px; }
        .ecs-visibility em { color: #5b6472; font-style: normal; }
        .ecs-toggles, .ecs-check { display: grid; gap: 8px; font-size: 13px; }
        .ecs-layout-controls {
          display: grid; gap: 12px; padding: 12px; border: 1px solid rgba(7,4,99,0.08);
          border-radius: 12px; background: #f7f8fb;
        }
        .ecs-layout-sliders { display: grid; gap: 10px; }
        .ecs-layout-row { margin: 0; }
        .ecs-layout-label {
          display: flex; justify-content: space-between; gap: 8px; align-items: baseline; margin-bottom: 4px;
        }
        .ecs-layout-label label { margin: 0; font-size: 12px; }
        .ecs-layout-label span { font-size: 11px; font-weight: 700; color: #070463; font-variant-numeric: tabular-nums; }
        .ecs-layout-row input[type='range'] { width: 100%; accent-color: #070463; }
        .ecs-color-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .ecs-color-field { margin: 0; }
        .ecs-color-input {
          display: flex; gap: 8px; align-items: center;
        }
        .ecs-color-input input[type='color'] {
          width: 42px; height: 36px; padding: 2px; border-radius: 8px;
          border: 1px solid rgba(7,4,99,0.12); background: #fff; cursor: pointer;
        }
        .ecs-color-input input[type='text'] {
          flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
        }
        .ecs-check { display: flex; gap: 8px; align-items: center; }
        .ecs-qr-large { width: 220px; height: 220px; border-radius: 12px; background: #fff; padding: 8px; }
        .ecs-health { margin: 0; padding-left: 18px; font-size: 12px; color: #5b6472; }
        .ecs-analytics ul { margin: 8px 0 0; padding-left: 18px; font-size: 13px; }
        @media (max-width: 980px) {
          .ecs-layout { grid-template-columns: 1fr; }
          .ecs-panel-body { max-height: none; }
        }
      `}</style>
    </div>
  );
}
