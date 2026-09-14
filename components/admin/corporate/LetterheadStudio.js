'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Focus,
  MoreHorizontal,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import MediaPicker from '@/components/admin/media/MediaPicker';
import LetterheadToolbar from '@/components/admin/corporate/LetterheadToolbar';
import LetterheadChromeControls from '@/components/admin/corporate/LetterheadChromeControls';
import LetterheadDesignTools from '@/components/admin/corporate/LetterheadDesignTools';
import {useToast} from '@/components/admin/ui/ToastProvider';
import LetterheadDocument from '@/components/corporate/letterhead/LetterheadDocument';
import {
  emptyLetterhead,
  LETTERHEAD_TEMPLATES,
  OFFICIAL_LETTERHEAD_PAGE_BG,
  resolveLetterLanguage,
} from '@/lib/cms/corporate/letterhead-model';

function blankTemplateDefaults() {
  return {
    templateId: 'blank-canvas',
    showGeoBars: false,
    showWatermark: false,
    showQr: false,
    showMark: false,
    showWordmark: false,
    showCompanyName: false,
    showTagline: false,
    showFooter: false,
    showFooterAddress: false,
    showFooterEmail: false,
    showFooterPhones: false,
    showFooterWebsite: false,
    backgroundImageUrl: '',
    headerMarkUrl: '',
    designLayers: [],
  };
}

const API = '/api/admin/corporate/letterheads';
const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.25];
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const AUTOSAVE_MS = 1800;
const RAIL_WIDTH = 260;

function statusLabel(status) {
  if (status === 'final') return 'Final';
  if (status === 'archived') return 'Archived';
  return 'Draft';
}

function formatListDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function tplName(id) {
  return LETTERHEAD_TEMPLATES.find((t) => t.id === id)?.name || id || '—';
}

function recipientSummary(doc) {
  const parts = [doc.recipientName, doc.recipientCompany].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  if (doc.recipientAddress) {
    const line = String(doc.recipientAddress).split('\n')[0].trim();
    return line || 'No recipient';
  }
  return 'No recipient';
}

function signatureSummary(doc) {
  const bits = [];
  if (doc.signatureImage) bits.push('Signature');
  if (doc.stampImage) bits.push('Stamp');
  if (doc.signatoryName) bits.push(doc.signatoryName);
  return bits.length ? bits.join(' · ') : 'No signature assets';
}

function pageSummary(doc) {
  const bits = [];
  bits.push(doc.showFooter ? 'Footer on' : 'Footer off');
  if (doc.showPageNumbers) bits.push('Page #');
  if (doc.confidential) bits.push('Confidential');
  bits.push(doc.footerDetail || 'full');
  return bits.join(' · ');
}

function designSummary(doc) {
  const bits = [tplName(doc.templateId)];
  if (doc.templateId === 'classic-executive') bits.push('PDF');
  if (doc.templateId === 'blank-canvas') {
    const n = Array.isArray(doc.designLayers) ? doc.designLayers.length : 0;
    bits.push(n ? `${n} layer${n === 1 ? '' : 's'}` : 'empty canvas');
  } else {
    bits.push(`logo ${doc.logoScale || 'md'}`);
  }
  return bits.join(' · ');
}

function documentSummary(doc) {
  const lang = String(doc.language || 'en').toUpperCase();
  return `${doc.title || 'Untitled'} · ${lang}`;
}

function Section({id, title, open, onToggle, summary, children}) {
  return (
    <section className="lhs-section">
      <button type="button" className="lhs-section-head" onClick={() => onToggle(id)}>
        <span>{title}</span>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
      </button>
      {open ? (
        <div className="lhs-section-body">{children}</div>
      ) : summary ? (
        <p className="lhs-section-summary">{summary}</p>
      ) : null}
    </section>
  );
}

function ZoomMenu({zoom, fitZoom, onSelect, onFit}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lhs-zoom-menu">
      <button
        type="button"
        className="lhs-zoom-label"
        onClick={() => setOpen((v) => !v)}
        title="Zoom"
        aria-expanded={open}
      >
        {Math.round(zoom * 100)}%
      </button>
      {open ? (
        <div className="lhs-zoom-dropdown" role="menu">
          {ZOOM_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              role="menuitem"
              className={Math.abs(zoom - step) < 0.01 ? 'is-active' : ''}
              onClick={() => {
                onSelect(step);
                setOpen(false);
              }}
            >
              {Math.round(step * 100)}%
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onFit(fitZoom);
              setOpen(false);
            }}
          >
            Fit Width ({Math.round(fitZoom * 100)}%)
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function LetterheadStudio({
  company,
  logoUrl = '/assets/asas/corporate/asas-letterhead-mark.png',
  canWrite = false,
  initialId = null,
  initialMode = null,
}) {
  const router = useRouter();
  const {toast} = useToast();
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const autosaveTimer = useRef(null);
  const titleInputRef = useRef(null);
  const moreRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | unsaved | saving | saved | error
  const [mode, setMode] = useState(() => {
    if (initialId || initialMode === 'edit') return 'edit';
    if (initialMode === 'create') return 'wizard';
    return 'list';
  });
  const [viewMode, setViewMode] = useState('edit'); // edit | preview
  const [doc, setDoc] = useState(() => emptyLetterhead());
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [leftOpen, setLeftOpen] = useState({
    design: true,
    document: true,
    recipient: false,
    signature: false,
    page: false,
  });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [wizard, setWizard] = useState({
    title: '',
    templateId: 'classic-executive',
    language: 'en',
  });
  const [pageCount, setPageCount] = useState(1);
  const [mobilePanel, setMobilePanel] = useState(null); // tools | inspector | null
  const [, setSelectionTick] = useState(0);

  const {dir} = useMemo(() => resolveLetterLanguage(doc), [doc]);
  // selectionTick forces re-read of editorRef for toolbar / table active states
  const editor = editorRef.current;

  // TipTap mounts async into editorRef — poll once until ready
  useEffect(() => {
    if (mode !== 'edit' || viewMode !== 'edit') return undefined;
    if (editorRef.current) return undefined;
    const id = window.setInterval(() => {
      if (editorRef.current) {
        setSelectionTick((n) => n + 1);
        window.clearInterval(id);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [mode, viewMode, doc.id]);

  const setField = useCallback((key, value) => {
    setDoc((prev) => ({...prev, [key]: value}));
    setSaveState('unsaved');
  }, []);

  const onChangeField = useCallback(
    (key, value) => {
      setField(key, value);
    },
    [setField],
  );

  const onBodyChange = useCallback((html) => {
    setDoc((prev) => {
      if (prev.bodyHtml === html) return prev;
      return {...prev, bodyHtml: html};
    });
    setSaveState('unsaved');
  }, []);

  const onSelectionUpdate = useCallback(() => {
    setSelectionTick((n) => n + 1);
  }, []);

  const toggleLeftSection = useCallback((id) => {
    setLeftOpen((s) => ({...s, [id]: !s[id]}));
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {cache: 'no-store'});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load letterheads');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      toast({
        title: 'Could not load letterheads',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadOne = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not found');
        setDoc(emptyLetterhead(data.item || {}));
        setMode('edit');
        setViewMode('edit');
        setSaveState('saved');
        setSelectedBlock(null);
        setFocusMode(false);
      } catch (error) {
        toast({
          title: 'Could not open letterhead',
          description: error.message,
          variant: 'error',
        });
        setMode('list');
        router.replace('/admin/corporate/letterheads');
      } finally {
        setLoading(false);
      }
    },
    [router, toast],
  );

  useEffect(() => {
    if (initialId) {
      loadOne(initialId);
    } else if (initialMode === 'create') {
      setMode('wizard');
      setLoading(false);
    } else {
      loadList();
    }
  }, [initialId, initialMode, loadList, loadOne]);

  // Fit width — default zoom; resize only updates fit baseline
  useEffect(() => {
    if (mode !== 'edit' && viewMode !== 'preview') return;
    let first = true;
    function measure() {
      const el = canvasRef.current;
      if (!el) return;
      const pad = focusMode ? 48 : 64;
      const available = Math.max(280, el.clientWidth - pad);
      const next = Math.min(1.25, Math.max(0.5, available / A4_WIDTH_PX));
      setFitZoom(next);
      if (first) {
        setZoom(next);
        first = false;
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mode, viewMode, focusMode, leftCollapsed]);

  const save = useCallback(
    async (statusOverride, {silent = false} = {}) => {
      if (!canWrite) return null;
      setSaving(true);
      setSaveState('saving');
      try {
        const liveHtml = editorRef.current?.getHTML?.();
        const payload = {
          ...doc,
          status: statusOverride || doc.status || 'draft',
          bodyHtml: liveHtml || doc.bodyHtml || '<p></p>',
        };
        const isNew = !payload.id;
        const res = await fetch(
          isNew ? API : `${API}/${encodeURIComponent(payload.id)}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Save failed');
        const saved = emptyLetterhead(data.item);
        setDoc(saved);
        setSaveState('saved');
        if (!silent) {
          toast({
            title: statusOverride === 'final' ? 'Marked final' : 'Saved',
            description: saved.title,
            variant: 'success',
          });
        }
        if (isNew && saved.id) {
          router.replace(
            `/admin/corporate/letterheads/${encodeURIComponent(saved.id)}`,
          );
        }
        return saved;
      } catch (error) {
        setSaveState('error');
        toast({
          title: 'Save failed',
          description: error.message,
          variant: 'error',
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [canWrite, doc, router, toast],
  );

  // Autosave drafts after 1.8s when unsaved
  useEffect(() => {
    if (mode !== 'edit' || viewMode !== 'edit' || !canWrite || saveState !== 'unsaved') {
      return undefined;
    }
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      save(undefined, {silent: true});
    }, AUTOSAVE_MS);
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [saveState, mode, viewMode, canWrite, save, doc]);

  // Cmd/Ctrl+S save, Cmd/Ctrl+P print
  useEffect(() => {
    if (mode !== 'edit' && viewMode !== 'preview') return undefined;
    function onKey(e) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canWrite) save();
      }
      if (meta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        prepareAndPrint();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, viewMode, save, canWrite]);

  function prepareAndPrint() {
    const prevZoom = zoom;
    setZoom(1);
    document.body.classList.add('lh-printing');
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove('lh-printing');
        setZoom(prevZoom);
      }, 400);
    }, 250);
  }

  // Close more menu on outside click
  useEffect(() => {
    if (!moreOpen) return undefined;
    function onDocClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [moreOpen]);

  function goList() {
    setMode('list');
    setViewMode('edit');
    setSaveState('idle');
    setFocusMode(false);
    setMobilePanel(null);
    router.push('/admin/corporate/letterheads');
    loadList();
  }

  function openWizard() {
    setWizard({
      title: '',
      templateId: 'classic-executive',
      language: 'en',
    });
    setMode('wizard');
    router.push('/admin/corporate/letterheads?new=1');
  }

  async function createFromWizard() {
    if (!canWrite) return;
    const title = wizard.title.trim() || 'Untitled letter';
    const created = emptyLetterhead({
      title,
      templateId: wizard.templateId,
      language: wizard.language,
      status: 'draft',
      bodyHtml: '<p></p>',
      ...(wizard.templateId === 'blank-canvas' ? blankTemplateDefaults() : {}),
    });
    setDoc(created);
    setMode('edit');
    setViewMode('edit');
    setSaving(true);
    setSaveState('saving');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(created),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      const item = emptyLetterhead(data.item);
      setDoc(item);
      setSaveState('saved');
      router.replace(
        `/admin/corporate/letterheads/${encodeURIComponent(item.id)}`,
      );
    } catch (error) {
      setSaveState('error');
      toast({
        title: 'Could not create letter',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDuplicate() {
    if (!canWrite || !doc.id) return;
    setMoreOpen(false);
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({duplicateFrom: doc.id}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Duplicate failed');
      toast({title: 'Duplicated', variant: 'success'});
      router.push(
        `/admin/corporate/letterheads/${encodeURIComponent(data.item.id)}`,
      );
    } catch (error) {
      toast({
        title: 'Duplicate failed',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function onArchive() {
    if (!canWrite || !doc.id) return;
    setMoreOpen(false);
    if (!window.confirm('Archive this letterhead?')) return;
    try {
      const res = await fetch(`${API}/${encodeURIComponent(doc.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Archive failed');
      toast({title: 'Archived', variant: 'success'});
      goList();
    } catch (error) {
      toast({
        title: 'Archive failed',
        description: error.message,
        variant: 'error',
      });
    }
  }

  async function downloadPdfFile() {
    setMoreOpen(false);
    try {
      toast({
        title: 'Downloading PDF…',
        description: 'Rendering letter pages',
        variant: 'info',
      });
      const prevZoom = zoom;
      setZoom(1);
      await new Promise((r) => window.setTimeout(r, 350));
      const {downloadLetterheadPdf} = await import(
        '@/lib/cms/corporate/download-letter-pdf'
      );
      await downloadLetterheadPdf({
        fileName: doc.title || 'ASAS-Letter',
      });
      setZoom(prevZoom);
      toast({title: 'PDF downloaded', variant: 'success'});
    } catch (error) {
      toast({
        title: 'PDF download failed',
        description: error.message || 'Try Print → Save as PDF',
        variant: 'error',
      });
    }
  }

  function exportPdfPrint() {
    prepareAndPrint();
  }

  function zoomIn() {
    const i = ZOOM_STEPS.findIndex((z) => z >= zoom - 0.005);
    const idx = i === -1 ? ZOOM_STEPS.length - 1 : i;
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, idx + (Math.abs(ZOOM_STEPS[idx] - zoom) < 0.01 ? 1 : 0))];
    setZoom(next || Math.min(1.25, zoom + 0.1));
  }

  function zoomOut() {
    const i = ZOOM_STEPS.findIndex((z) => z >= zoom - 0.005);
    const idx = i === -1 ? ZOOM_STEPS.length - 1 : i;
    const atStep = Math.abs(ZOOM_STEPS[idx] - zoom) < 0.01;
    const next = ZOOM_STEPS[Math.max(0, atStep ? idx - 1 : idx)];
    setZoom(next || Math.max(0.5, zoom - 0.1));
  }

  function fitWidth() {
    setZoom(fitZoom);
  }

  const draftCount = items.filter((i) => i.status === 'draft').length;
  const finalCount = items.filter((i) => i.status === 'final').length;

  const showLeftRail = !focusMode && !leftCollapsed;
  const showRightRail = !focusMode;
  const inTable = Boolean(editor?.isActive?.('table'));

  const saveLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'error'
          ? 'Save failed'
          : saveState === 'unsaved'
            ? 'Unsaved changes'
            : statusLabel(doc.status);

  /* ─── LIST ─────────────────────────────────────────────────────────── */
  if (mode === 'list') {
    return (
      <div className="lhs-shell lhs-list no-print">
        <div className="lhs-list-head">
          <div>
            <h2>Letterhead Studio</h2>
            <p>Create and manage branded ASAS correspondence.</p>
          </div>
          {canWrite ? (
            <button type="button" className="lhs-btn lhs-btn-primary" onClick={openWizard}>
              + New Letter
            </button>
          ) : null}
        </div>

        <div className="lhs-stats">
          <div className="lhs-stat">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="lhs-stat">
            <span>Final</span>
            <strong>{finalCount}</strong>
          </div>
          <div className="lhs-stat">
            <span>Total</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="lhs-list-card">
          {loading ? (
            <p className="lhs-muted">Loading…</p>
          ) : items.length === 0 ? (
            <div className="lhs-empty">
              <FileText size={28} />
              <p>No letters yet.</p>
              {canWrite ? (
                <button type="button" className="lhs-btn lhs-btn-primary" onClick={openWizard}>
                  Create first letter
                </button>
              ) : null}
            </div>
          ) : (
            <table className="lhs-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Template</th>
                  <th>Language</th>
                  <th>Recipient</th>
                  <th>Updated</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button
                        type="button"
                        className="lhs-link"
                        onClick={() =>
                          router.push(
                            `/admin/corporate/letterheads/${encodeURIComponent(item.id)}`,
                          )
                        }
                      >
                        {item.title || 'Untitled'}
                      </button>
                    </td>
                    <td>{tplName(item.templateId)}</td>
                    <td>{String(item.language || 'en').toUpperCase()}</td>
                    <td>{item.recipientName || '—'}</td>
                    <td>{formatListDate(item.updatedAt)}</td>
                    <td>
                      <span className={`lhs-badge lhs-badge-${item.status || 'draft'}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lhs-btn lhs-btn-ghost"
                        onClick={() =>
                          router.push(
                            `/admin/corporate/letterheads/${encodeURIComponent(item.id)}`,
                          )
                        }
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  /* ─── WIZARD ───────────────────────────────────────────────────────── */
  if (mode === 'wizard') {
    return (
      <div className="lhs-wizard-backdrop no-print">
        <div className="lhs-wizard" role="dialog" aria-label="New letter">
          <div className="lhs-wizard-head">
            <h2>New Letter</h2>
            <button type="button" className="lhs-icon-btn" onClick={goList} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <label className="lhs-field">
            <span>Document name</span>
            <input
              className="lhs-input"
              value={wizard.title}
              onChange={(e) => setWizard((w) => ({...w, title: e.target.value}))}
              placeholder="Proposal Letter — Client ABC"
              autoFocus
            />
          </label>

          <div className="lhs-field">
            <span>Template</span>
            <div className="lhs-wizard-templates">
              {LETTERHEAD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className={`lhs-wizard-tpl${wizard.templateId === tpl.id ? ' is-active' : ''}`}
                  onClick={() => setWizard((w) => ({...w, templateId: tpl.id}))}
                >
                  <span className={`lhs-tpl-thumb is-${tpl.id}`} />
                  <strong>{tpl.name}</strong>
                  <em>{tpl.description}</em>
                </button>
              ))}
            </div>
          </div>

          <label className="lhs-field">
            <span>Language</span>
            <select
              className="lhs-input"
              value={wizard.language}
              onChange={(e) => setWizard((w) => ({...w, language: e.target.value}))}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="bilingual">Bilingual</option>
            </select>
          </label>

          <div className="lhs-wizard-foot">
            <button type="button" className="lhs-btn lhs-btn-ghost" onClick={goList}>
              Cancel
            </button>
            <button
              type="button"
              className="lhs-btn lhs-btn-primary"
              disabled={!canWrite || saving}
              onClick={createFromWizard}
            >
              {saving ? 'Creating…' : 'Create Letter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── PREVIEW MODE ─────────────────────────────────────────────────── */
  if (viewMode === 'preview') {
    return (
      <div className="lhs-preview-mode">
        <div className="lhs-topbar no-print">
          <button
            type="button"
            className="lhs-btn lhs-btn-ghost"
            onClick={() => setViewMode('edit')}
          >
            <ArrowLeft size={16} /> Back to Edit
          </button>
          <div className="lhs-topbar-right">
            <button type="button" className="lhs-btn lhs-btn-ghost" onClick={prepareAndPrint}>
              <Printer size={16} /> Print
            </button>
            <button type="button" className="lhs-btn lhs-btn-secondary" onClick={downloadPdfFile}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
        <div className="lhs-canvas lhs-canvas-preview" ref={canvasRef}>
          <div
            className="lhs-page-scale"
            style={{
              transform: `scale(${Math.max(fitZoom, 0.7)})`,
              width: A4_WIDTH_PX,
              transformOrigin: 'top center',
            }}
          >
            <LetterheadDocument
              doc={doc}
              company={company}
              logoUrl={logoUrl}
              mode="preview"
              onPageCountChange={setPageCount}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Left rail content ────────────────────────────────────────────── */
  const leftRail = (
    <>
      <Section
        id="design"
        title="Design"
        open={leftOpen.design}
        onToggle={toggleLeftSection}
        summary={designSummary(doc)}
      >
        <p className="lhs-label">Template</p>
        <button
          type="button"
          className="lhs-template-trigger"
          disabled={!canWrite}
          onClick={() => setGalleryOpen(true)}
        >
          <span className={`lhs-tpl-thumb is-${doc.templateId}`} />
          <span>
            <strong>{tplName(doc.templateId)}</strong>
            <em>
              {doc.templateId === 'classic-executive'
                ? 'Attached PDF letterhead'
                : doc.templateId === 'blank-canvas'
                  ? 'Design your own layout'
                  : 'Change template'}
            </em>
          </span>
        </button>
        {doc.templateId !== 'classic-executive' ? (
          <button
            type="button"
            className="lhs-btn lhs-btn-ghost lhs-btn-block"
            style={{marginTop: 8}}
            disabled={!canWrite}
            onClick={() =>
              setDoc((prev) => ({
                ...prev,
                templateId: 'classic-executive',
                showGeoBars: true,
                showWatermark: true,
                showQr: true,
                showMark: true,
                showWordmark: true,
                showCompanyName: true,
                showTagline: true,
                showFooter: true,
                showFooterAddress: true,
                showFooterEmail: true,
                showFooterPhones: true,
                showFooterWebsite: true,
                backgroundImageUrl: prev.backgroundImageUrl || OFFICIAL_LETTERHEAD_PAGE_BG,
              }))
            }
          >
            Use ASAS Official (PDF)
          </button>
        ) : null}

        {doc.templateId === 'blank-canvas' ? (
          <LetterheadDesignTools
            layers={doc.designLayers || []}
            canWrite={canWrite}
            onChange={(designLayers) => setField('designLayers', designLayers)}
          />
        ) : null}

        {doc.templateId !== 'blank-canvas' ? (
          <>
        <p className="lhs-label" style={{marginTop: 14}}>
          {doc.templateId === 'classic-executive'
            ? 'Header (PDF design)'
            : 'Header'}
        </p>
        {doc.templateId === 'classic-executive' ? (
          <label className="lhs-check">
            <input
              type="checkbox"
              checked={doc.showGeoBars !== false}
              disabled={!canWrite}
              onChange={(e) => setField('showGeoBars', e.target.checked)}
            />
            Geometric bars (navy / rust)
          </label>
        ) : null}
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showWordmark !== false && doc.showCompanyName !== false}
            disabled={!canWrite}
            onChange={(e) => {
              setField('showWordmark', e.target.checked);
              setField('showCompanyName', e.target.checked);
            }}
          />
          {doc.templateId === 'classic-executive' ? 'ASAS wordmark' : 'Company name'}
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showTagline !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showTagline', e.target.checked)}
          />
          {doc.templateId === 'classic-executive'
            ? 'Tagline under ASAS'
            : 'Subtitle / place'}
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showMark !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showMark', e.target.checked)}
          />
          Brand mark (A logo)
        </label>
        {doc.templateId === 'classic-executive' ? (
          <label className="lhs-check">
            <input
              type="checkbox"
              checked={doc.showWatermark !== false}
              disabled={!canWrite}
              onChange={(e) => setField('showWatermark', e.target.checked)}
            />
            Page watermark
          </label>
        ) : null}

        <div style={{marginTop: 12}}>
          <MediaPicker
            label="A4 page background"
            hint="Full-page artwork (header + footer bars). Geometric CSS bars are hidden while a background is set."
            value={doc.backgroundImageUrl || ''}
            canWrite={canWrite}
            cropAspect={210 / 297}
            onChange={(url) => setField('backgroundImageUrl', url || '')}
          />
          <div className="lhs-segment" style={{marginTop: 8}}>
            <button
              type="button"
              className="lhs-segment-btn"
              disabled={!canWrite}
              onClick={() => {
                setField('backgroundImageUrl', OFFICIAL_LETTERHEAD_PAGE_BG);
                setField('showGeoBars', false);
              }}
            >
              Use official ASAS page
            </button>
            <button
              type="button"
              className="lhs-segment-btn"
              disabled={!canWrite || !doc.backgroundImageUrl}
              onClick={() => {
                setField('backgroundImageUrl', '');
                setField('showGeoBars', true);
              }}
            >
              Clear background
            </button>
          </div>
        </div>

        <div style={{marginTop: 10}}>
          <MediaPicker
            label="Header mark / logo"
            value={doc.headerMarkUrl || ''}
            canWrite={canWrite}
            onChange={(url) => setField('headerMarkUrl', url)}
          />
        </div>

        <p className="lhs-label" style={{marginTop: 10}}>
          Logo scale
        </p>
        <div className="lhs-segment">
          {['sm', 'md', 'lg'].map((size) => (
            <button
              key={size}
              type="button"
              className={`lhs-segment-btn${(doc.logoScale || 'md') === size ? ' is-active' : ''}`}
              disabled={!canWrite}
              onClick={() => setField('logoScale', size)}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>

        <LetterheadChromeControls
          layout={doc.chromeLayout}
          canWrite={canWrite}
          onChange={(chromeLayout) => setField('chromeLayout', chromeLayout)}
          onPreviewFocus={(zone) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            if (zone === 'footer') {
              canvas.scrollTo({top: canvas.scrollHeight, behavior: 'smooth'});
            } else {
              canvas.scrollTo({top: 0, behavior: 'smooth'});
            }
          }}
        />

        <p className="lhs-label" style={{marginTop: 14}}>
          {doc.templateId === 'classic-executive'
            ? 'Footer (PDF design)'
            : 'Footer'}
        </p>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showFooter !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showFooter', e.target.checked)}
          />
          {doc.templateId === 'classic-executive'
            ? 'Show footer bars'
            : 'Show footer'}
        </label>
          </>
        ) : (
          <>
            <p className="lhs-label" style={{marginTop: 14}}>
              Page
            </p>
            <label className="lhs-check">
              <input
                type="checkbox"
                checked={doc.showPageNumbers !== false}
                disabled={!canWrite}
                onChange={(e) => setField('showPageNumbers', e.target.checked)}
              />
              Page numbers
            </label>
            <label className="lhs-check">
              <input
                type="checkbox"
                checked={Boolean(doc.confidential)}
                disabled={!canWrite}
                onChange={(e) => setField('confidential', e.target.checked)}
              />
              Confidential mark
            </label>
          </>
        )}

        {doc.templateId !== 'blank-canvas' ? (
          <>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showFooterAddress !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showFooterAddress', e.target.checked)}
          />
          Address
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showFooterEmail !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showFooterEmail', e.target.checked)}
          />
          Email / PO Box
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showFooterPhones !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showFooterPhones', e.target.checked)}
          />
          Phone numbers
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={doc.showFooterWebsite !== false}
            disabled={!canWrite}
            onChange={(e) => setField('showFooterWebsite', e.target.checked)}
          />
          {doc.templateId === 'classic-executive'
            ? 'Website line'
            : 'Website'}
        </label>
        {doc.templateId === 'classic-executive' ? (
          <>
            <label className="lhs-check">
              <input
                type="checkbox"
                checked={doc.showQr !== false}
                disabled={!canWrite}
                onChange={(e) => setField('showQr', e.target.checked)}
              />
              QR code
            </label>
            {doc.showQr !== false ? (
              <div style={{marginTop: 8}}>
                <MediaPicker
                  label="QR code image"
                  value={doc.qrImageUrl || ''}
                  canWrite={canWrite}
                  onChange={(url) => setField('qrImageUrl', url)}
                />
                <p className="lhs-hint" style={{marginTop: 6}}>
                  Upload your QR, or leave empty to use the generated / default QR.
                </p>
              </div>
            ) : null}
          </>
        ) : null}
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={Boolean(doc.showPageNumbers)}
            disabled={!canWrite}
            onChange={(e) => setField('showPageNumbers', e.target.checked)}
          />
          Page numbers
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={Boolean(doc.confidential)}
            disabled={!canWrite}
            onChange={(e) => setField('confidential', e.target.checked)}
          />
          Confidential mark
        </label>

        <p className="lhs-label" style={{marginTop: 14}}>
          Footer details (editable)
        </p>
        <p className="lhs-help" style={{margin: '0 0 8px', fontSize: 12, color: '#5b6472'}}>
          These lines print on the letter footer — address, email, phones, website. Leave blank to use company defaults.
        </p>
        <label className="lhs-field">
          <span>Find out more label</span>
          <input
            className="lhs-input"
            value={doc.footerCtaLabel || ''}
            disabled={!canWrite}
            placeholder="Find out more at"
            onChange={(e) => setField('footerCtaLabel', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Address line 1</span>
          <input
            className="lhs-input"
            value={doc.footerAddressLine1 || ''}
            disabled={!canWrite}
            placeholder="East 9 - Behind Safeer Mall"
            onChange={(e) => setField('footerAddressLine1', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Address line 2</span>
          <input
            className="lhs-input"
            value={doc.footerAddressLine2 || ''}
            disabled={!canWrite}
            placeholder="Mussafah Residential, Abu Dhabi"
            onChange={(e) => setField('footerAddressLine2', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Email</span>
          <input
            className="lhs-input"
            value={doc.footerEmail || ''}
            disabled={!canWrite}
            placeholder="asas@asasengg.ae"
            onChange={(e) => setField('footerEmail', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>PO Box</span>
          <input
            className="lhs-input"
            value={doc.footerPoBox || ''}
            disabled={!canWrite}
            placeholder="P.O. Box 114789"
            onChange={(e) => setField('footerPoBox', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Phone</span>
          <input
            className="lhs-input"
            value={doc.footerPhone || ''}
            disabled={!canWrite}
            placeholder="+971 2 63 11 320"
            onChange={(e) => setField('footerPhone', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Mobile</span>
          <input
            className="lhs-input"
            value={doc.footerMobile || ''}
            disabled={!canWrite}
            placeholder="+971 55 410 5649"
            onChange={(e) => setField('footerMobile', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Website</span>
          <input
            className="lhs-input"
            value={doc.footerWebsite || ''}
            disabled={!canWrite}
            placeholder="www.asasengg.ae"
            onChange={(e) => setField('footerWebsite', e.target.value)}
          />
        </label>
          </>
        ) : null}
      </Section>

      <Section
        id="document"
        title="Document"
        open={leftOpen.document}
        onToggle={toggleLeftSection}
        summary={documentSummary(doc)}
      >
        <label className="lhs-field">
          <span>Title</span>
          <input
            className="lhs-input"
            value={doc.title || ''}
            disabled={!canWrite}
            onChange={(e) => setField('title', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Language</span>
          <select
            className="lhs-input"
            value={doc.language || 'en'}
            disabled={!canWrite}
            onChange={(e) => setField('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="bilingual">Bilingual</option>
          </select>
        </label>
        <label className="lhs-field">
          <span>Date</span>
          <input
            className="lhs-input"
            type="date"
            value={doc.date || ''}
            disabled={!canWrite}
            onChange={(e) => setField('date', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Reference</span>
          <input
            className="lhs-input"
            value={doc.reference || ''}
            disabled={!canWrite}
            onChange={(e) => setField('reference', e.target.value)}
            placeholder="REF-…"
          />
        </label>
        <label className="lhs-field">
          <span>Subject</span>
          <input
            className="lhs-input"
            value={doc.subject || ''}
            disabled={!canWrite}
            onChange={(e) => setField('subject', e.target.value)}
          />
        </label>
      </Section>

      <Section
        id="recipient"
        title="Recipient"
        open={leftOpen.recipient}
        onToggle={toggleLeftSection}
        summary={recipientSummary(doc)}
      >
        <label className="lhs-field">
          <span>Name</span>
          <input
            className="lhs-input"
            value={doc.recipientName || ''}
            disabled={!canWrite}
            onChange={(e) => setField('recipientName', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Company</span>
          <input
            className="lhs-input"
            value={doc.recipientCompany || ''}
            disabled={!canWrite}
            onChange={(e) => setField('recipientCompany', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Address</span>
          <textarea
            className="lhs-input"
            rows={3}
            value={doc.recipientAddress || ''}
            disabled={!canWrite}
            onChange={(e) => setField('recipientAddress', e.target.value)}
          />
        </label>
        <button
          type="button"
          className="lhs-btn lhs-btn-ghost lhs-btn-block"
          onClick={() => setSelectedBlock('recipient')}
        >
          Focus on page
        </button>
      </Section>

      <Section
        id="signature"
        title="Signature"
        open={leftOpen.signature}
        onToggle={toggleLeftSection}
        summary={signatureSummary(doc)}
      >
        <MediaPicker
          label="Signature image"
          value={doc.signatureImage || ''}
          canWrite={canWrite}
          onChange={(url) => setField('signatureImage', url)}
        />
        <MediaPicker
          label="Stamp image"
          value={doc.stampImage || ''}
          canWrite={canWrite}
          onChange={(url) => setField('stampImage', url)}
        />
        <label className="lhs-field">
          <span>Signatory name</span>
          <input
            className="lhs-input"
            value={doc.signatoryName || ''}
            disabled={!canWrite}
            onChange={(e) => setField('signatoryName', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Signatory title</span>
          <input
            className="lhs-input"
            value={doc.signatoryTitle || ''}
            disabled={!canWrite}
            onChange={(e) => setField('signatoryTitle', e.target.value)}
          />
        </label>
        <label className="lhs-field">
          <span>Closing</span>
          <input
            className="lhs-input"
            value={doc.closing || ''}
            disabled={!canWrite}
            onChange={(e) => setField('closing', e.target.value)}
          />
        </label>
      </Section>

      <Section
        id="page"
        title="Page"
        open={leftOpen.page}
        onToggle={toggleLeftSection}
        summary={pageSummary(doc)}
      >
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={Boolean(doc.showFooter)}
            disabled={!canWrite}
            onChange={(e) => setField('showFooter', e.target.checked)}
          />
          Show footer
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={Boolean(doc.showPageNumbers)}
            disabled={!canWrite}
            onChange={(e) => setField('showPageNumbers', e.target.checked)}
          />
          Page numbers
        </label>
        <label className="lhs-check">
          <input
            type="checkbox"
            checked={Boolean(doc.confidential)}
            disabled={!canWrite}
            onChange={(e) => setField('confidential', e.target.checked)}
          />
          Confidential
        </label>
        <label className="lhs-field">
          <span>Footer detail</span>
          <select
            className="lhs-input"
            value={doc.footerDetail || 'full'}
            disabled={!canWrite}
            onChange={(e) => setField('footerDetail', e.target.value)}
          >
            <option value="full">Full</option>
            <option value="compact">Compact</option>
            <option value="minimal">Minimal</option>
          </select>
        </label>
      </Section>

      {pageCount > 1 ? (
        <div className="lhs-pages-nav">
          <p className="lhs-label">Pages</p>
          <div className="lhs-page-thumbs">
            {Array.from({length: pageCount}, (_, i) => (
              <span key={i} className="lhs-page-thumb">
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  /* ─── Right inspector ──────────────────────────────────────────────── */
  const rightInspector = (
    <div className="lhs-inspector">
      {!selectedBlock ? (
        <>
          <h3>Document</h3>
          <dl className="lhs-overview">
            <div>
              <dt>Pages</dt>
              <dd>{pageCount}</dd>
            </div>
            <div>
              <dt>Template</dt>
              <dd>{tplName(doc.templateId)}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{String(doc.language || 'en').toUpperCase()}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel(doc.status)}</dd>
            </div>
            <div>
              <dt>Zoom</dt>
              <dd>{Math.round(zoom * 100)}%</dd>
            </div>
          </dl>
          <p className="lhs-hint">
            Click any block on the letter to inspect it. The page is your primary editor.
          </p>
        </>
      ) : null}

      {selectedBlock === 'body' ? (
        <>
          <h3>Text</h3>
          <p className="lhs-hint">
            Use the Word toolbar above for formatting, lists, links, and tables.
          </p>
          {editor && inTable ? (
            <div className="lhs-table-controls">
              <p className="lhs-label">Table</p>
              <div className="lhs-table-actions">
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  Row before
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  Row after
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  Delete row
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  Col before
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  Col after
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  Delete col
                </button>
                <button
                  type="button"
                  className="lhs-btn lhs-btn-ghost"
                  disabled={!canWrite}
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  Delete table
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {selectedBlock === 'signature' ? (
        <>
          <h3>Signature</h3>
          <MediaPicker
            label="Signature"
            value={doc.signatureImage || ''}
            canWrite={canWrite}
            onChange={(url) => setField('signatureImage', url)}
          />
          <MediaPicker
            label="Stamp"
            value={doc.stampImage || ''}
            canWrite={canWrite}
            onChange={(url) => setField('stampImage', url)}
          />
          {doc.signatureImage ? (
            <button
              type="button"
              className="lhs-btn lhs-btn-ghost lhs-btn-block"
              disabled={!canWrite}
              onClick={() => setField('signatureImage', '')}
            >
              Remove signature
            </button>
          ) : null}
        </>
      ) : null}

      {selectedBlock === 'recipient' ||
      selectedBlock === 'meta' ||
      selectedBlock === 'subject' ? (
        <>
          <h3>
            {selectedBlock === 'recipient'
              ? 'Recipient'
              : selectedBlock === 'meta'
                ? 'Reference'
                : 'Subject'}
          </h3>
          <p className="lhs-hint">Edit on the page</p>
        </>
      ) : null}
    </div>
  );

  /* ─── EDITOR ───────────────────────────────────────────────────────── */
  return (
    <div
      className={`lhs-shell lhs-editor-shell${focusMode ? ' is-focus' : ''}${
        leftCollapsed ? ' is-left-collapsed' : ''
      }`}
    >
      <header className="lhs-topbar no-print">
        <div className="lhs-topbar-left">
          <button type="button" className="lhs-btn lhs-btn-ghost" onClick={goList}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="lhs-title-wrap">
            <input
              ref={titleInputRef}
              className="lhs-doc-title"
              value={doc.title || ''}
              disabled={!canWrite}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Document name"
              aria-label="Document name"
            />
            <span className={`lhs-save-pill lhs-save-${saveState}`}>
              {saveState === 'saved' ? <Check size={12} /> : null}
              {saveLabel}
            </span>
          </div>
        </div>

        <div className="lhs-topbar-center">
          <button type="button" className="lhs-icon-btn" onClick={zoomOut} aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <ZoomMenu
            zoom={zoom}
            fitZoom={fitZoom}
            onSelect={setZoom}
            onFit={(z) => setZoom(z)}
          />
          <button type="button" className="lhs-icon-btn" onClick={zoomIn} aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="lhs-btn lhs-btn-ghost lhs-hide-sm"
            onClick={fitWidth}
            title="Fit width"
          >
            Fit Width
          </button>
        </div>

        <div className="lhs-topbar-right">
          <button
            type="button"
            className={`lhs-btn lhs-btn-ghost lhs-hide-sm${focusMode ? ' is-active' : ''}`}
            onClick={() => {
              setFocusMode((v) => {
                const next = !v;
                if (next) {
                  requestAnimationFrame(() => {
                    if (canvasRef.current) canvasRef.current.scrollTop = 0;
                  });
                }
                return next;
              });
              setMobilePanel(null);
            }}
            title="Focus Mode"
          >
            <Focus size={16} /> Focus Mode
          </button>
          <button
            type="button"
            className="lhs-btn lhs-btn-ghost lhs-hide-sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            type="button"
            className="lhs-btn lhs-btn-ghost lhs-hide-sm"
            onClick={prepareAndPrint}
          >
            <Printer size={16} /> Print
          </button>
          <button
            type="button"
            className="lhs-btn lhs-btn-secondary lhs-hide-sm"
            onClick={downloadPdfFile}
          >
            <Download size={16} /> Download PDF
          </button>
          {canWrite ? (
            <button
              type="button"
              className="lhs-btn lhs-btn-ghost"
              disabled={saving}
              onClick={() => save('draft')}
            >
              Save Draft
            </button>
          ) : null}
          {canWrite ? (
            <button
              type="button"
              className="lhs-btn lhs-btn-primary"
              disabled={saving}
              onClick={() => save('final')}
            >
              Mark Final
            </button>
          ) : null}
          <div className="lhs-more" ref={moreRef}>
            <button
              type="button"
              className="lhs-icon-btn"
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="More"
              aria-expanded={moreOpen}
            >
              <MoreHorizontal size={18} />
            </button>
            {moreOpen ? (
              <div className="lhs-more-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setViewMode('preview');
                  }}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    prepareAndPrint();
                  }}
                >
                  Print
                </button>
                <button type="button" onClick={downloadPdfFile}>
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    exportPdfPrint();
                  }}
                >
                  Print → Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setFocusMode((v) => !v);
                  }}
                >
                  {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setLeftCollapsed((v) => !v);
                  }}
                >
                  {leftCollapsed ? 'Show tools' : 'Hide tools'}
                </button>
                <button type="button" disabled={!canWrite || !doc.id} onClick={onDuplicate}>
                  Duplicate
                </button>
                <button type="button" disabled={!canWrite || !doc.id} onClick={onArchive}>
                  Archive
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Word toolbar — always visible in edit when editor ready */}
      {editor ? (
        <LetterheadToolbar editor={editor} canWrite={canWrite} dir={dir} />
      ) : (
        <div className="lhs-word-toolbar lhs-word-toolbar-placeholder no-print" aria-hidden>
          <span className="lhs-muted">Preparing editor…</span>
        </div>
      )}

      <div
        className={`lhs-workspace${showLeftRail ? '' : ' no-left'}${
          showRightRail ? '' : ' no-right'
        }`}
      >
        {showLeftRail ? (
          <aside
            className={`lhs-rail lhs-rail-left no-print${
              mobilePanel === 'tools' ? ' is-open' : ''
            }`}
            style={{width: RAIL_WIDTH, minWidth: RAIL_WIDTH}}
          >
            <div className="lhs-rail-head">
              <strong>Tools</strong>
              <button
                type="button"
                className="lhs-icon-btn"
                aria-label="Collapse tools"
                onClick={() => setLeftCollapsed(true)}
              >
                <ChevronDown size={14} style={{transform: 'rotate(90deg)'}} />
              </button>
            </div>
            {leftRail}
          </aside>
        ) : null}

        <main className="lhs-canvas" ref={canvasRef}>
          <div className="lhs-mobile-bar no-print">
            <button
              type="button"
              onClick={() => {
                setFocusMode(false);
                setLeftCollapsed(false);
                setMobilePanel('tools');
              }}
            >
              Tools
            </button>
            {!focusMode ? (
              <button type="button" onClick={() => setMobilePanel('inspector')}>
                Inspector
              </button>
            ) : null}
            <button type="button" onClick={() => setFocusMode((v) => !v)}>
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>
          </div>

          {!showLeftRail && !focusMode ? (
            <button
              type="button"
              className="lhs-rail-peek no-print lhs-hide-sm"
              onClick={() => setLeftCollapsed(false)}
            >
              Tools
            </button>
          ) : null}

          <div className="lhs-page-sticky">
            <div
              className="lhs-page-scale"
              style={{
                width: A4_WIDTH_PX,
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                marginBottom: Math.max(48, A4_HEIGHT_PX * pageCount * (zoom - 1) + 64),
              }}
            >
              <LetterheadDocument
                doc={doc}
                company={company}
                logoUrl={logoUrl}
                mode="edit"
                selectedBlock={selectedBlock}
                onSelectBlock={(block) => {
                  setSelectedBlock(block);
                  if (block === 'signature') {
                    setLeftOpen((s) => ({...s, signature: true}));
                  }
                  if (block === 'recipient') {
                    setLeftOpen((s) => ({...s, recipient: true}));
                  }
                }}
                onChangeField={onChangeField}
                onBodyChange={onBodyChange}
                onBodyFocus={() => setSelectedBlock('body')}
                onBodyBlur={() => {}}
                onSelectionUpdate={onSelectionUpdate}
                editorRef={editorRef}
                onPageCountChange={setPageCount}
              />
            </div>
          </div>
        </main>

        {showRightRail ? (
          <aside
            className={`lhs-rail lhs-rail-right no-print${
              mobilePanel === 'inspector' ? ' is-open' : ''
            }`}
            style={{width: RAIL_WIDTH, minWidth: RAIL_WIDTH}}
          >
            {rightInspector}
          </aside>
        ) : null}
      </div>

      {mobilePanel ? (
        <button
          type="button"
          className="lhs-drawer-backdrop no-print"
          aria-label="Close panel"
          onClick={() => setMobilePanel(null)}
        />
      ) : null}

      {galleryOpen ? (
        <div className="lhs-gallery-backdrop no-print" role="presentation">
          <div className="lhs-gallery" role="dialog" aria-label="Template gallery">
            <div className="lhs-gallery-head">
              <h2>Choose template</h2>
              <button
                type="button"
                className="lhs-icon-btn"
                onClick={() => setGalleryOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lhs-gallery-grid">
              {LETTERHEAD_TEMPLATES.map((tpl) => (
                <article
                  key={tpl.id}
                  className={`lhs-gallery-card${doc.templateId === tpl.id ? ' is-active' : ''}${tpl.id === 'classic-executive' ? ' is-official' : ''}${tpl.id === 'blank-canvas' ? ' is-blank' : ''}`}
                >
                  <div className={`lhs-gallery-preview is-${tpl.id}`}>
                    {tpl.id === 'classic-executive' ? (
                      <div className="lhs-gallery-official">
                        <span className="lhs-go-bars" />
                        <span className="lhs-go-asas">ASAS</span>
                        <span className="lhs-go-foot" />
                      </div>
                    ) : tpl.id === 'blank-canvas' ? (
                      <div className="lhs-gallery-blank">
                        <span className="lhs-gb-guide" />
                        <span className="lhs-gb-label">Blank A4</span>
                      </div>
                    ) : (
                      <div className="lhs-gallery-mini">
                        <span className="lhs-gallery-logo" />
                        <span className="lhs-gallery-lines" />
                      </div>
                    )}
                  </div>
                  <div className="lhs-gallery-meta">
                    <strong>
                      {tpl.name}
                      {tpl.id === 'classic-executive' ? (
                        <em className="lhs-official-badge"> Your PDF</em>
                      ) : null}
                      {tpl.id === 'blank-canvas' ? (
                        <em className="lhs-official-badge"> Custom</em>
                      ) : null}
                    </strong>
                    <p>{tpl.description}</p>
                    <button
                      type="button"
                      className="lhs-btn lhs-btn-primary"
                      disabled={!canWrite}
                      onClick={() => {
                        if (tpl.id === 'classic-executive') {
                          setDoc((prev) => ({
                            ...prev,
                            templateId: 'classic-executive',
                            showGeoBars: true,
                            showWatermark: true,
                            showQr: true,
                            showMark: true,
                            showWordmark: true,
                            showCompanyName: true,
                            showTagline: true,
                            showFooter: true,
                            showFooterAddress: true,
                            showFooterEmail: true,
                            showFooterPhones: true,
                            showFooterWebsite: true,
                            backgroundImageUrl:
                              prev.backgroundImageUrl || OFFICIAL_LETTERHEAD_PAGE_BG,
                          }));
                        } else if (tpl.id === 'blank-canvas') {
                          setDoc((prev) => ({
                            ...prev,
                            ...blankTemplateDefaults(),
                            designLayers: prev.designLayers || [],
                          }));
                        } else {
                          setDoc((prev) => ({
                            ...prev,
                            templateId: tpl.id,
                            showGeoBars: false,
                            showWatermark: false,
                            showQr: false,
                          }));
                        }
                        setSaveState('unsaved');
                        setGalleryOpen(false);
                      }}
                    >
                      {doc.templateId === tpl.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
