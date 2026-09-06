'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useMemo, useState} from 'react';
import {teamDepartments} from '@/lib/team/schema';
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
  const [uploading, setUploading] = useState('');

  const title = mode === 'create' ? 'New team member' : `Edit · ${member.name_en || member.slug}`;

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

  async function uploadImage(file, field) {
    if (!file) return;
    setUploading(field);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/team/upload', {method: 'POST', body});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setField(field, data.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading('');
    }
  }

  const payload = useMemo(
    () => ({
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
    }),
    [form],
  );

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
    if (!window.confirm('Delete this team member permanently?')) return;
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
    <div className="adm-shell">
      <div className="adm-top">
        <div className="adm-brand">
          <strong>ASAS Admin</strong>
          <span>{title}</span>
        </div>
        <div className="adm-actions">
          <Link className="adm-btn-ghost" href="/admin/team">
            Back to list
          </Link>
          {mode === 'edit' && (
            <button type="button" className="adm-btn-danger" onClick={onDelete} disabled={saving}>
              Delete
            </button>
          )}
        </div>
      </div>

      <form className="adm-card" onSubmit={onSubmit}>
        {error && <p className="adm-error">{error}</p>}

        <h2 className="adm-section-title" style={{marginTop: 0}}>
          Identity
        </h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>Name (EN) *</label>
            <input value={form.name_en} onChange={(e) => setField('name_en', e.target.value)} required />
          </div>
          <div className="adm-field">
            <label>Name (AR)</label>
            <input value={form.name_ar} onChange={(e) => setField('name_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Slug</label>
            <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="auto from English name" />
          </div>
          <div className="adm-field">
            <label>Display order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setField('display_order', e.target.value)}
            />
          </div>
          <div className="adm-field">
            <label>Job title (EN) *</label>
            <input value={form.job_title_en} onChange={(e) => setField('job_title_en', e.target.value)} required />
          </div>
          <div className="adm-field">
            <label>Job title (AR)</label>
            <input value={form.job_title_ar} onChange={(e) => setField('job_title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Department</label>
            <select value={form.department_id || ''} onChange={(e) => onDepartment(e.target.value)}>
              <option value="">—</option>
              {teamDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="adm-grid-3" style={{marginTop: 8, marginBottom: 8}}>
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setField('featured', e.target.checked)} />
            Featured on homepage
          </label>
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.leadership)} onChange={(e) => setField('leadership', e.target.checked)} />
            Leadership
          </label>
        </div>
        <p style={{margin: '0 0 18px', color: '#5b6472', fontSize: 13, lineHeight: 1.45}}>
          Homepage shows <strong>Published + Featured</strong> members first. If nobody is Featured, it falls back to
          published members by display order. Draft members never appear publicly.
        </p>

        <h2 className="adm-section-title">Portraits</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>Profile image</label>
            {form.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="adm-preview" src={form.profile_image} alt="" />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => uploadImage(e.target.files?.[0], 'profile_image')}
              disabled={Boolean(uploading)}
            />
            <input
              value={form.profile_image}
              onChange={(e) => setField('profile_image', e.target.value)}
              placeholder="/assets/asas/team/…"
            />
            <input
              value={form.profile_image_focal}
              onChange={(e) => setField('profile_image_focal', e.target.value)}
              placeholder="Focal point e.g. 50% 30%"
            />
          </div>
          <div className="adm-field">
            <label>Secondary image (optional)</label>
            {form.secondary_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="adm-preview" src={form.secondary_image} alt="" />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => uploadImage(e.target.files?.[0], 'secondary_image')}
              disabled={Boolean(uploading)}
            />
            <input
              value={form.secondary_image}
              onChange={(e) => setField('secondary_image', e.target.value)}
              placeholder="/assets/asas/team/…"
            />
          </div>
        </div>

        <h2 className="adm-section-title">Biography</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>Short bio (EN)</label>
            <textarea value={form.short_bio_en} onChange={(e) => setField('short_bio_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Short bio (AR)</label>
            <textarea value={form.short_bio_ar} onChange={(e) => setField('short_bio_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Full bio (EN)</label>
            <textarea value={form.full_bio_en} onChange={(e) => setField('full_bio_en', e.target.value)} rows={8} />
          </div>
          <div className="adm-field">
            <label>Full bio (AR)</label>
            <textarea value={form.full_bio_ar} onChange={(e) => setField('full_bio_ar', e.target.value)} dir="rtl" rows={8} />
          </div>
          <div className="adm-field">
            <label>Quote (EN)</label>
            <textarea value={form.quote_en} onChange={(e) => setField('quote_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Quote (AR)</label>
            <textarea value={form.quote_ar} onChange={(e) => setField('quote_ar', e.target.value)} dir="rtl" />
          </div>
        </div>

        <h2 className="adm-section-title">Expertise & credentials</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>Expertise (EN) — one per line</label>
            <textarea value={form.expertise_en_text} onChange={(e) => setField('expertise_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Expertise (AR)</label>
            <textarea value={form.expertise_ar_text} onChange={(e) => setField('expertise_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Education (EN)</label>
            <textarea value={form.education_en_text} onChange={(e) => setField('education_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Education (AR)</label>
            <textarea value={form.education_ar_text} onChange={(e) => setField('education_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Qualifications (EN)</label>
            <textarea value={form.qualifications_en_text} onChange={(e) => setField('qualifications_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Qualifications (AR)</label>
            <textarea value={form.qualifications_ar_text} onChange={(e) => setField('qualifications_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Certifications (EN)</label>
            <textarea value={form.certifications_en_text} onChange={(e) => setField('certifications_en_text', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Certifications (AR)</label>
            <textarea value={form.certifications_ar_text} onChange={(e) => setField('certifications_ar_text', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>Years experience</label>
            <input value={form.years_experience} onChange={(e) => setField('years_experience', e.target.value)} placeholder="e.g. 20+" />
          </div>
        </div>

        <h2 className="adm-section-title">Contact & projects</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>Email (optional, public if set)</label>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Phone (optional, public if set)</label>
            <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Notable project slugs — one per line</label>
            <textarea
              value={form.notable_projects_text}
              onChange={(e) => setField('notable_projects_text', e.target.value)}
              placeholder={projectOptions.slice(0, 4).join('\n')}
            />
            <small style={{color: '#5b6472'}}>
              Available: {projectOptions.slice(0, 8).join(', ')}
              {projectOptions.length > 8 ? '…' : ''}
            </small>
          </div>
        </div>

        <h2 className="adm-section-title">SEO</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label>SEO title (EN)</label>
            <input value={form.seo_title_en} onChange={(e) => setField('seo_title_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>SEO title (AR)</label>
            <input value={form.seo_title_ar} onChange={(e) => setField('seo_title_ar', e.target.value)} dir="rtl" />
          </div>
          <div className="adm-field">
            <label>SEO description (EN)</label>
            <textarea value={form.seo_description_en} onChange={(e) => setField('seo_description_en', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>SEO description (AR)</label>
            <textarea value={form.seo_description_ar} onChange={(e) => setField('seo_description_ar', e.target.value)} dir="rtl" />
          </div>
        </div>

        <div className="adm-actions" style={{marginTop: 24}}>
          <button className="adm-btn" type="submit" disabled={saving || Boolean(uploading)}>
            {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save team member'}
          </button>
        </div>
      </form>
    </div>
  );
}
