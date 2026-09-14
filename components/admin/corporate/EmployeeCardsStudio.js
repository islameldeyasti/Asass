'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {IdCard, Plus} from 'lucide-react';
import {
  CARD_TEMPLATES,
  buildPublicCardPath,
  normalizeDigitalCard,
  resolveTemplateId,
} from '@/lib/cms/corporate/employee-cards';

function statusLabel(card) {
  if (!card?.enabled) return 'disabled';
  return card.status || 'draft';
}

function statusClass(card) {
  const s = statusLabel(card);
  if (s === 'published') return 'published';
  if (s === 'disabled') return 'draft';
  return 'draft';
}

export default function EmployeeCardsStudio({
  members: initialMembers = [],
  canWrite = false,
  canPublish = false,
}) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const departments = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.department_en) set.add(m.department_en);
    });
    return Array.from(set).sort();
  }, [members]);

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    let disabled = 0;
    let missingPhoto = 0;
    let missingQrReady = 0;
    members.forEach((m) => {
      const card = normalizeDigitalCard(m.digital_card);
      if (card.status === 'published' && card.enabled) published += 1;
      else if (card.status === 'disabled' || !card.enabled) disabled += 1;
      else draft += 1;
      if (!m.profile_image) missingPhoto += 1;
      if (!(card.enabled && card.status === 'published')) missingQrReady += 1;
    });
    return {published, draft, disabled, missingPhoto, missingQrReady};
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const card = normalizeDigitalCard(m.digital_card);
      if (deptFilter !== 'all' && m.department_en !== deptFilter) return false;
      if (statusFilter === 'published' && !(card.enabled && card.status === 'published')) {
        return false;
      }
      if (statusFilter === 'draft' && card.status !== 'draft') return false;
      if (
        statusFilter === 'disabled' &&
        !(card.status === 'disabled' || card.enabled === false)
      ) {
        return false;
      }
      if (!q) return true;
      return [m.name_en, m.name_ar, m.job_title_en, m.department_en, m.slug, m.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [members, query, deptFilter, statusFilter]);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  async function bulkSetStatus(nextStatus) {
    if (!canWrite) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setSaving(true);
    setError('');
    try {
      for (const id of ids) {
        const member = members.find((m) => m.id === id);
        if (!member) continue;
        const card = {
          ...normalizeDigitalCard(member.digital_card),
          enabled: nextStatus === 'published',
          status: nextStatus,
        };
        if (nextStatus === 'published' && !canPublish && !canWrite) continue;
        const res = await fetch(`/api/admin/team/${id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({digital_card: card}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Bulk update failed');
        setMembers((list) =>
          list.map((item) => (item.id === data.member.id ? data.member : item)),
        );
      }
      setSelectedIds(new Set());
      setNotice(
        nextStatus === 'published'
          ? 'Published selected cards'
          : 'Disabled selected cards',
      );
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      setError(err.message || 'Bulk update failed');
    } finally {
      setSaving(false);
    }
  }

  async function bulkCreateCards() {
    if (!canWrite) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/corporate/employee-cards/bulk', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'bulk-create', ids}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk create failed');
      const map = new Map((data.members || []).map((m) => [m.id, m]));
      setMembers((list) => list.map((item) => map.get(item.id) || item));
      setNotice(`Configured ${ids.length} digital card${ids.length === 1 ? '' : 's'}.`);
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      setError(err.message || 'Bulk create failed');
    } finally {
      setSaving(false);
    }
  }

  async function bulkQrZip(format = 'png') {
    if (!canWrite) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/corporate/employee-cards/bulk', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'bulk-qr-zip', ids, format}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'QR export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asas-employee-qr-${format}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice('QR ZIP downloaded.');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      setError(err.message || 'QR export failed');
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((m) => m.id)));
  }

  return (
    <div className="ecs-studio">
      <div className="cms-card ecs-toolbar">
        <div>
          <strong>Employee digital cards</strong>
          <p style={{margin: '4px 0 0', color: 'var(--cms-muted)'}}>
            Configure public profiles and QR codes for team members.
          </p>
        </div>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
          <select
            className="adm-input"
            style={{maxWidth: 160}}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="adm-input"
            style={{maxWidth: 140}}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="disabled">Disabled</option>
          </select>
          <input
            className="adm-input"
            style={{maxWidth: 220}}
            placeholder="Search name, role, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {canWrite ? (
            <Link className="adm-btn" href="/admin/corporate/employee-cards/new">
              <Plus size={14} /> Add card
            </Link>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {[
          ['Published', stats.published],
          ['Draft', stats.draft],
          ['Disabled', stats.disabled],
          ['Missing photo', stats.missingPhoto],
          ['Need publish', stats.missingQrReady],
        ].map(([label, value]) => (
          <div key={label} className="cms-stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {selectedIds.size > 0 && canWrite ? (
        <div
          className="cms-card"
          style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}
        >
          <span style={{fontSize: 13}}>{selectedIds.size} selected</span>
          <button type="button" className="adm-btn" disabled={saving} onClick={bulkCreateCards}>
            Create / configure cards
          </button>
          <button
            type="button"
            className="adm-btn-ghost"
            disabled={saving || (!canPublish && !canWrite)}
            onClick={() => bulkSetStatus('published')}
          >
            Publish cards
          </button>
          <button
            type="button"
            className="adm-btn-ghost"
            disabled={saving}
            onClick={() => bulkSetStatus('disabled')}
          >
            Disable cards
          </button>
          <button type="button" className="adm-btn-ghost" disabled={saving} onClick={() => bulkQrZip('png')}>
            Download QR ZIP (PNG)
          </button>
          <button type="button" className="adm-btn-ghost" disabled={saving} onClick={() => bulkQrZip('svg')}>
            Download QR ZIP (SVG)
          </button>
        </div>
      ) : null}

      {error ? <div className="adm-error">{error}</div> : null}
      {notice ? <div className="adm-success">{notice}</div> : null}

      <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
        {filtered.length === 0 ? (
          <div className="adm-empty" style={{padding: 32}}>
            <p>No team members found. Add profiles in Team first.</p>
            <div style={{marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center'}}>
              <Link className="adm-btn-ghost" href="/admin/team/new">
                Add team member
              </Link>
              {canWrite ? (
                <Link className="adm-btn" href="/admin/corporate/employee-cards/new">
                  Add card
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Photo</th>
                <th>Employee</th>
                <th>Template</th>
                <th>Card status</th>
                <th>QR</th>
                <th>Views</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const card = normalizeDigitalCard(member.digital_card);
                const tpl = CARD_TEMPLATES.find((t) => t.id === resolveTemplateId(card.templateId));
                const published = card.enabled && card.status === 'published';
                const publicPath = card.publicId ? buildPublicCardPath(card.publicId) : '';
                return (
                  <tr key={member.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(member.id)}
                        onChange={() => toggleSelect(member.id)}
                        aria-label={`Select ${member.name_en}`}
                      />
                    </td>
                    <td>
                      {member.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={member.profile_image} alt="" />
                      ) : (
                        <div className="adm-thumb adm-thumb--empty">
                          {(member.name_en || '?').slice(0, 1)}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{member.name_en}</strong>
                      <div style={{color: 'var(--cms-muted)', fontSize: 12}}>
                        {member.job_title_en}
                        {member.department_en ? ` · ${member.department_en}` : ''}
                      </div>
                    </td>
                    <td>{tpl?.name || card.templateId}</td>
                    <td>
                      <span className={`adm-badge ${statusClass(card)}`}>
                        {statusLabel(card)}
                      </span>
                    </td>
                    <td style={{fontSize: 12}}>
                      {published && publicPath ? (
                        <a href={publicPath} target="_blank" rel="noreferrer">
                          /c/{card.publicId}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{card.views || 0}</td>
                    <td>
                      <div style={{display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                        <Link
                          className="adm-btn-ghost"
                          href={`/admin/corporate/employee-cards/${member.id}`}
                        >
                          <IdCard size={14} /> Edit
                        </Link>
                        {publicPath ? (
                          <a className="adm-btn-ghost" href={publicPath} target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        ) : null}
                        {card.publicId ? (
                          <a
                            className="adm-btn-ghost"
                            href={`/api/public/card-qr?publicId=${encodeURIComponent(card.publicId)}&format=png`}
                          >
                            QR
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style jsx global>{`
        .ecs-studio {
          display: grid;
          gap: 16px;
        }
        .ecs-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .adm-success {
          padding: 10px 12px;
          border-radius: 8px;
          background: #ecfdf3;
          color: #15803d;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
