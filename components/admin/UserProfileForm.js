'use client';
import {adminText} from '@/lib/admin/translate';
import {useRouter} from 'next/navigation';
import {useMemo, useState} from 'react';
import {ROLE_LABELS} from '@/lib/cms/permissions';

function emptyForm(user) {
  return {
    name: user?.name || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    nationality: user?.nationality || '',
    city: user?.city || '',
    country: user?.country || '',
    address: user?.address || '',
    bio: user?.bio || '',
    linkedin: user?.linkedin || '',
    availability: user?.availability || 'available',
    publicProfile: user?.publicProfile !== false,
    photoUrl: user?.photoUrl || '',
  };
}

export default function UserProfileForm({
  user,
  isSelf = false,
  canWrite = false,
  endpoint = '/api/admin/profile',
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => emptyForm(user));
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    if (photoFile) return URL.createObjectURL(photoFile);
    return form.photoUrl || '';
  }, [photoFile, form.photoUrl]);

  function setField(key, value) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'photoUrl') return;
        body.set(key, value === true || value === false ? String(value) : String(value ?? ''));
      });
      if (photoFile) body.set('photo', photoFile);
      if (!isSelf) body.set('id', user.id);
      const res = await fetch(endpoint, {
        method: 'PATCH',
        body,
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save profile');
      const next = data.profile || data.user;
      if (next) setForm(emptyForm(next));
      setPhotoFile(null);
      setMessage('Profile saved');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (!canWrite) return;
    if (password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (password !== password2) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = isSelf
        ? {currentPassword, password}
        : {id: user.id, password};
      const res = await fetch(isSelf ? '/api/admin/profile' : '/api/admin/users', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update password');
      setCurrentPassword('');
      setPassword('');
      setPassword2('');
      setMessage('Password updated');
    } catch (err) {
      setError(err.message || 'Could not update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="kt-profile">
      {error ? <p className="adm-error">{adminText(error)}</p> : null}
      {message ? <p className="adm-success">{adminText(message)}</p> : null}

      <div className="kt-profile-hero">
        <div className="kt-profile-avatar">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={user.name} />
          ) : (
            <span>{String(user.name || 'U').slice(0, 1)}</span>
          )}
        </div>
        <div>
          <h2>{adminText(user.name)}</h2>
          <p>
            {adminText(ROLE_LABELS[user.role] || user.role)}
            {form.jobTitle ? ` · ${form.jobTitle}` : ''}
          </p>
          <span className={`adm-badge ${user.active ? 'published' : 'draft'}`}>
            {adminText(user.active ? 'Active' : 'Disabled')}
          </span>
        </div>
      </div>

      <div className="kt-profile-grid">
        <form className="adm-card" onSubmit={saveProfile}>
          <h3 className="adm-section-title" style={{marginTop: 0}}>{adminText('Personal info')}</h3>
          <div className="adm-grid-2">
            <label className="adm-field">
              <span>{adminText('Photo')}</span>
              <input
                type="file"
                accept="image/*"
                disabled={!canWrite}
                onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
              />
            </label>
            <label className="adm-field">
              <span>{adminText('Full name')}</span>
              <input value={form.name} disabled={!canWrite} onChange={(e) => setField('name', e.target.value)} required />
            </label>
            <label className="adm-field">
              <span>{adminText('Job title')}</span>
              <input value={form.jobTitle} disabled={!canWrite} onChange={(e) => setField('jobTitle', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Department')}</span>
              <input value={form.department} disabled={!canWrite} onChange={(e) => setField('department', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Phone')}</span>
              <input value={form.phone} disabled={!canWrite} onChange={(e) => setField('phone', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('WhatsApp')}</span>
              <input value={form.whatsapp} disabled={!canWrite} onChange={(e) => setField('whatsapp', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Birthday')}</span>
              <input type="date" value={form.birthday} disabled={!canWrite} onChange={(e) => setField('birthday', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Gender')}</span>
              <select value={form.gender} disabled={!canWrite} onChange={(e) => setField('gender', e.target.value)}>
                <option value="">{adminText('Select')}</option>
                <option value="male">{adminText('Male')}</option>
                <option value="female">{adminText('Female')}</option>
                <option value="other">{adminText('Prefer not to say')}</option>
              </select>
            </label>
            <label className="adm-field">
              <span>{adminText('Nationality')}</span>
              <input value={form.nationality} disabled={!canWrite} onChange={(e) => setField('nationality', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('City')}</span>
              <input value={form.city} disabled={!canWrite} onChange={(e) => setField('city', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Country')}</span>
              <input value={form.country} disabled={!canWrite} onChange={(e) => setField('country', e.target.value)} />
            </label>
            <label className="adm-field" style={{gridColumn: '1 / -1'}}>
              <span>{adminText('Address')}</span>
              <input value={form.address} disabled={!canWrite} onChange={(e) => setField('address', e.target.value)} />
            </label>
            <label className="adm-field" style={{gridColumn: '1 / -1'}}>
              <span>{adminText('About')}</span>
              <textarea rows={4} value={form.bio} disabled={!canWrite} onChange={(e) => setField('bio', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('LinkedIn')}</span>
              <input value={form.linkedin} disabled={!canWrite} onChange={(e) => setField('linkedin', e.target.value)} />
            </label>
            <label className="adm-field">
              <span>{adminText('Availability')}</span>
              <select value={form.availability} disabled={!canWrite} onChange={(e) => setField('availability', e.target.value)}>
                <option value="available">{adminText('Available now')}</option>
                <option value="busy">{adminText('Busy')}</option>
                <option value="away">{adminText('Away')}</option>
              </select>
            </label>
          </div>
          {canWrite ? (
            <button className="adm-btn" type="submit" disabled={saving}>
              {adminText(saving ? 'Saving…' : 'Save profile')}
            </button>
          ) : null}
        </form>

        <div className="kt-profile-side">
          <div className="adm-card">
            <h3 className="adm-section-title" style={{marginTop: 0}}>{adminText('Account')}</h3>
            <p><strong>{adminText('Email')}</strong><br />{user.email}</p>
            <p><strong>{adminText('Role')}</strong><br />{adminText(ROLE_LABELS[user.role] || user.role)}</p>
            <p><strong>{adminText('Last login')}</strong><br />{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-GB') : '—'}</p>
          </div>

          {canWrite ? (
            <form className="adm-card" onSubmit={savePassword}>
              <h3 className="adm-section-title" style={{marginTop: 0}}>{adminText('Login & security')}</h3>
              {isSelf ? (
                <label className="adm-field">
                  <span>{adminText('Current password')}</span>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </label>
              ) : null}
              <label className="adm-field">
                <span>{adminText('New password')}</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </label>
              <label className="adm-field">
                <span>{adminText('Confirm new password')}</span>
                <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} minLength={6} required />
              </label>
              <button className="adm-btn" type="submit" disabled={saving}>
                {adminText(saving ? 'Updating…' : 'Update password')}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
