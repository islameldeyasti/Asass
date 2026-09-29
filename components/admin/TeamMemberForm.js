'use client';
import {adminText} from '@/lib/admin/translate';


import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {teamDepartments} from '@/lib/team/schema';
import MediaPicker from '@/components/admin/media/MediaPicker';
// Client-safe schema imports only (no filesystem store).

function listToText(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function projectsToText(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

export default function TeamMemberForm({member, projectOptions = [], mode = 'create'}) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    ...member,
    expertise_en_text: listToText(member.expertise_en),
    expertise_ar_text: listToText(member.expertise_ar),
    education_en_text: listToText(member.education_en),
    education_ar_text: listToText(member.education_ar),
    qualifications_en_text: listToText(member.qualifications_en),
    qualifications_ar_text: listToText(member.qualifications_ar),
    certifications_en_text: listToText(member.certifications_en),
    certifications_ar_text: listToText(member.certifications_ar),
    notable_projects_text: projectsToText(member.notable_projects),
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((current) => ({...current, [key]: value}));
  }

  function onDepartment(id) {
    const dept = teamDepartments.find((item) => item.id === id);
    setForm((current) => ({
      ...current,
      department_id: id,
      department_en: dept?.label || '',
      department_ar: dept?.labelAr || '',
      leadership: id === 'leadership' ? true : current.leadership,
    }));
  }

  const payload = {
      ...form,
      expertise_en: form.expertise_en_text,
      expertise_ar: form.expertise_ar_text,
      education_en: form.education_en_text,
      education_ar: form.education_ar_text,
      qualifications_en: form.qualifications_en_text,
      qualifications_ar: form.qualifications_ar_text,
      certifications_en: form.certifications_en_text,
      certifications_ar: form.certifications_ar_text,
      notable_projects: form.notable_projects_text,
  };

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = mode === 'create' ? '/api/admin/team' : `/api/admin/team/${member.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.replace(`/admin/team/${data.member.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!member?.id) return;
    if (!window.confirm(adminText('Delete this team member permanently?'))) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {method: 'DELETE'});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.replace('/admin/team');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Delete failed');
      setSaving(false);
    }
  }

  return (
    <div className="adm-stack">
      {mode === 'edit' ? (
        <div className="adm-actions" style={{justifyContent: 'flex-end'}}>
          <button type="button" className="adm-btn-danger" onClick={onDelete} disabled={saving}>{adminText("Delete")}</button>
        </div>
      ) : null}

      <form className="adm-card" onSubmit={onSubmit}>
        {error && <p className="adm-error">{adminText(error)}</p>}

        <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Identity")}</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>{adminText("Name (EN) *")}</label>
            <input value={form.name_en} onChange={(e) => setField('name_en', e.target.value)} required />
          </div>
          <div className="adm-field">
            <label>{adminText("Name (AR)")}</label>
            <input value={form.name_ar} onChange={(e) => setField('name_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Slug")}</label>
            <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder={adminText("auto from English name")} />
          </div>
          <div className="adm-field">
            <label>{adminText("Display order")}</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setField('display_order', e.target.value)}
            />
          </div>
          <div className="adm-field">
            <label>{adminText("Job title (EN) *")}</label>
            <input value={form.job_title_en} onChange={(e) => setField('job_title_en', e.target.value)} required />
          </div>
          <div className="adm-field">
            <label>{adminText("Job title (AR)")}</label>
            <input value={form.job_title_ar} onChange={(e) => setField('job_title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Department")}</label>
            <select value={form.department_id || ''} onChange={(e) => onDepartment(e.target.value)}>
              <option value="">—</option>
              {teamDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {adminText(dept.label)}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label>{adminText("Status")}</label>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="draft">{adminText("Draft")}</option>
              <option value="published">{adminText("Published")}</option>
            </select>
          </div>
        </div>

        <div className="adm-grid-3" style={{marginTop: 8, marginBottom: 8}}>
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setField('featured', e.target.checked)} />{adminText("Featured on homepage")}</label>
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.leadership)} onChange={(e) => setField('leadership', e.target.checked)} />{adminText("Leadership")}</label>
        </div>
        <p style={{margin: '0 0 18px', color: '#5b6472', fontSize: 13, lineHeight: 1.45}}>{adminText("Homepage shows ")}<strong>{adminText("Published + Featured")}</strong>{adminText(" members first. If nobody is Featured, it falls back to published members by display order. Draft members never appear publicly.")}</p>

        <h2 className="adm-section-title">{adminText("Portraits")}</h2>
        <div className="adm-grid-2">
          <MediaPicker
            label={adminText("Profile image")}
            hint="Crop and set focus so the face stays centered in cards and team pages."
            value={form.profile_image || ''}
            onChange={(url) => setField('profile_image', url || '')}
            mode="IMAGE"
            canWrite
            cropAspect={1}
            focalValue={form.profile_image_focal || '50% 30%'}
            onFocalChange={(focal) => setField('profile_image_focal', focal)}
          />
          <MediaPicker
            label={adminText("Secondary image")}
            value={form.secondary_image || ''}
            onChange={(url) => setField('secondary_image', url || '')}
            mode="IMAGE"
            canWrite
            focalValue={form.secondary_image_focal || '50% 40%'}
            onFocalChange={(focal) => setField('secondary_image_focal', focal)}
          />
        </div>

        <h2 className="adm-section-title">{adminText("Biography")}</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>{adminText("Short bio (EN)")}</label>
            <textarea value={form.short_bio_en} onChange={(e) => setField('short_bio_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Short bio (AR)")}</label>
            <textarea value={form.short_bio_ar} onChange={(e) => setField('short_bio_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Full bio (EN)")}</label>
            <textarea value={form.full_bio_en} onChange={(e) => setField('full_bio_en', e.target.value)} rows={8} />
          </div>
          <div className="adm-field">
            <label>{adminText("Full bio (AR)")}</label>
            <textarea value={form.full_bio_ar} onChange={(e) => setField('full_bio_ar', e.target.value)} dir="rtl" rows={8} />
          </div>
          <div className="adm-field">
            <label>{adminText("Quote (EN)")}</label>
            <textarea value={form.quote_en} onChange={(e) => setField('quote_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Quote (AR)")}</label>
            <textarea value={form.quote_ar} onChange={(e) => setField('quote_ar', e.target.value)} dir="rtl" />
          </div>
        </div>

        <h2 className="adm-section-title">{adminText("Expertise & credentials")}</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>{adminText("Expertise (EN) — one per line")}</label>
            <textarea value={form.expertise_en_text} onChange={(e) => setField('expertise_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Expertise (AR)")}</label>
            <textarea value={form.expertise_ar_text} onChange={(e) => setField('expertise_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Education (EN)")}</label>
            <textarea value={form.education_en_text} onChange={(e) => setField('education_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Education (AR)")}</label>
            <textarea value={form.education_ar_text} onChange={(e) => setField('education_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Qualifications (EN)")}</label>
            <textarea value={form.qualifications_en_text} onChange={(e) => setField('qualifications_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Qualifications (AR)")}</label>
            <textarea value={form.qualifications_ar_text} onChange={(e) => setField('qualifications_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Certifications (EN)")}</label>
            <textarea value={form.certifications_en_text} onChange={(e) => setField('certifications_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Certifications (AR)")}</label>
            <textarea value={form.certifications_ar_text} onChange={(e) => setField('certifications_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("Years experience")}</label>
            <input value={form.years_experience} onChange={(e) => setField('years_experience', e.target.value)} placeholder={adminText("e.g. 20+")} />
          </div>
        </div>

        <h2 className="adm-section-title">{adminText("Contact & projects")}</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>{adminText("Email (optional, public if set)")}</label>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Phone (optional, public if set)")}</label>
            <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("LinkedIn URL")}</label>
            <input value={form.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("Notable project slugs — one per line")}</label>
            <textarea
              value={form.notable_projects_text}
              onChange={(e) => setField('notable_projects_text', e.target.value)}
              placeholder={adminText(projectOptions.slice(0, 4).join('\n'))}
            />
            <small style={{color: '#5b6472'}}>{adminText("Available: ")}{adminText(projectOptions.slice(0, 8).join(', '))}
              {adminText(projectOptions.length > 8 ? '…' : '')}
            </small>
          </div>
        </div>

        <h2 className="adm-section-title">{adminText("SEO")}</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>{adminText("SEO title (EN)")}</label>
            <input value={form.seo_title_en} onChange={(e) => setField('seo_title_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("SEO title (AR)")}</label>
            <input value={form.seo_title_ar} onChange={(e) => setField('seo_title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>{adminText("SEO description (EN)")}</label>
            <textarea value={form.seo_description_en} onChange={(e) => setField('seo_description_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>{adminText("SEO description (AR)")}</label>
            <textarea value={form.seo_description_ar} onChange={(e) => setField('seo_description_ar', e.target.value)} dir="rtl" />
          </div>
        </div>

        <div className="adm-actions" style={{marginTop: 24}}>
          <button className="adm-btn" type="submit" disabled={saving}>
            {adminText(saving ? 'Saving…' : 'Save team member')}
          </button>
        </div>
      </form>
    </div>
  );
}
