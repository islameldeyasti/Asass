'use client';

import {useState} from 'react';
import MediaLibraryDialog from './MediaLibraryDialog';
import ImageCropDialog from './ImageCropDialog';
import FocalPointPicker from './FocalPointPicker';

function isImageUrl(url) {
  return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(String(url || ''));
}

/**
 * Standard image field for admin:
 * - Choose / replace / remove via Media Library
 * - Crop (saves a new cropped asset)
 * - Focal point (click important area)
 */
export default function MediaPicker({
  label = 'Media',
  value = '',
  onChange,
  mode = 'IMAGE',
  canWrite = false,
  enableCrop = true,
  enableFocal = true,
  focalValue = '50% 50%',
  onFocalChange,
  cropAspect = null,
  hint = '',
}) {
  const [open, setOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const hasValue = Boolean(value);
  const isImage = mode === 'IMAGE' || isImageUrl(value);
  const showImage = hasValue && isImage;
  const canEditImage = Boolean(canWrite && showImage);
  const showFocal = Boolean(enableFocal && showImage && typeof onFocalChange === 'function');
  const showCrop = Boolean(enableCrop && canEditImage);

  return (
    <div className="adm-field adm-media-picker">
      {label ? <label>{label}</label> : null}
      {hint ? <p className="adm-section-help" style={{marginTop: 0}}>{hint}</p> : null}

      <div
        className="adm-media-picker-preview"
        style={
          showImage
            ? {backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: focalValue || '50% 50%'}
            : undefined
        }
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            style={{objectPosition: focalValue || '50% 50%', objectFit: 'cover'}}
          />
        ) : hasValue ? (
          <div className="adm-media-picker-file">
            <strong>Selected file</strong>
            <span>{String(value).split('/').pop()}</span>
          </div>
        ) : (
          <div className="adm-media-picker-empty">No media selected yet</div>
        )}
      </div>

      <div className="adm-actions" style={{marginTop: 10}}>
        <button type="button" className="adm-btn" disabled={!canWrite} onClick={() => setOpen(true)}>
          {hasValue ? 'Replace' : 'Upload / choose'}
        </button>
        {showCrop ? (
          <button type="button" className="adm-btn-ghost" onClick={() => setCropOpen(true)}>
            Crop
          </button>
        ) : null}
        {hasValue && canWrite ? (
          <button
            type="button"
            className="adm-btn-danger"
            onClick={() => {
              onChange?.('', null);
              onFocalChange?.('50% 50%');
            }}
          >
            Remove
          </button>
        ) : null}
      </div>

      {showFocal ? (
        <FocalPointPicker
          src={value}
          value={focalValue || '50% 50%'}
          disabled={!canWrite}
          label="Focus point"
          onChange={onFocalChange}
        />
      ) : null}

      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        canWrite={canWrite}
        onSelect={(item) => {
          onChange?.(item?.url || '', item);
          setOpen(false);
        }}
      />

      <ImageCropDialog
        open={cropOpen}
        src={value}
        aspect={cropAspect}
        onClose={() => setCropOpen(false)}
        onCropped={(url, item) => {
          onChange?.(url, item);
          onFocalChange?.('50% 50%');
        }}
      />
    </div>
  );
}
