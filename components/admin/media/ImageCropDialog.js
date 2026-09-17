'use client';

import {useCallback, useState} from 'react';
import Cropper from 'react-easy-crop';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';

async function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

async function getCroppedBlob(imageSrc, cropPixels, mime = 'image/jpeg') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not crop image');

  const {width, height, x, y} = cropPixels;
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Crop failed'));
        else resolve(blob);
      },
      mime,
      0.92,
    );
  });
}

const ASPECT_OPTIONS = [
  {id: 'free', label: 'Free', value: null},
  {id: '1', label: '1:1', value: 1},
  {id: '4-5', label: '4:5', value: 4 / 5},
  {id: '16-9', label: '16:9', value: 16 / 9},
  {id: '3-2', label: '3:2', value: 3 / 2},
];

/**
 * Modal cropper — saves a new cropped file to the Media Library.
 */
export default function ImageCropDialog({
  open,
  src,
  onClose,
  onCropped,
  aspect: initialAspect = null,
  title = 'Crop image',
}) {
  const [crop, setCrop] = useState({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [aspectId, setAspectId] = useState(
    ASPECT_OPTIONS.find((opt) => opt.value === initialAspect)?.id || 'free',
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const aspect = ASPECT_OPTIONS.find((opt) => opt.id === aspectId)?.value ?? null;

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function applyCrop() {
    if (!src || !croppedAreaPixels) return;
    setSaving(true);
    setError('');
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      const body = new FormData();
      body.append('file', blob, `crop-${Date.now()}.jpg`);
      body.append('folder', 'cropped');
      const res = await fetch('/api/admin/media', {method: 'POST', body});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onCropped?.(data.item?.url || '', data.item);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Could not crop image');
    } finally {
      setSaving(false);
    }
  }

  if (!open || !src) return null;

  return (
    <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && onClose?.()}>
      <div
        className="adm-modal adm-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <AdminCloseButton onClick={onClose} disabled={saving} />
        </div>
        <div className="adm-modal-body">
          {error ? <p className="adm-error">{error}</p> : null}
          <div className="adm-crop-stage">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect || undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
            />
          </div>
          <div className="adm-crop-controls">
            <div className="adm-field" style={{marginBottom: 0}}>
              <label htmlFor="crop-zoom">Zoom</label>
              <input
                id="crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="adm-field" style={{marginBottom: 0}}>
              <label>Shape</label>
              <div className="adm-actions">
                {ASPECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={aspectId === opt.id ? 'adm-btn' : 'adm-btn-ghost'}
                    onClick={() => setAspectId(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="adm-btn" onClick={applyCrop} disabled={saving}>
            {saving ? 'Saving…' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
