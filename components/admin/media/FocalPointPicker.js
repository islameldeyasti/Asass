'use client';

import {useRef} from 'react';

/**
 * Click-to-set focal point for cover/hero images.
 * Stores CSS object-position value like "42% 38%".
 */
export default function FocalPointPicker({
  src,
  value = '50% 50%',
  onChange,
  disabled = false,
  label = 'Focal point',
}) {
  const frameRef = useRef(null);

  function parse(pos) {
    const parts = String(pos || '50% 50%')
      .trim()
      .split(/\s+/);
    const x = Number.parseFloat(parts[0]);
    const y = Number.parseFloat(parts[1]);
    return {
      x: Number.isFinite(x) ? x : 50,
      y: Number.isFinite(y) ? y : 50,
    };
  }

  const {x, y} = parse(value);

  function setFromEvent(event) {
    if (disabled || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const nx = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const ny = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    onChange?.(`${Math.round(nx)}% ${Math.round(ny)}%`);
  }

  if (!src) {
    return (
      <div className="adm-field">
        <label>{label}</label>
        <p style={{margin: 0, color: 'var(--cms-muted)', fontSize: 13}}>
          Select an image first to set the focal point.
        </p>
      </div>
    );
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <p style={{margin: '0 0 8px', color: 'var(--cms-muted)', fontSize: 13}}>
        Click the most important part of the photo. The website will keep that area in view when cropped.
      </p>
      <button
        type="button"
        ref={frameRef}
        className="adm-focal-frame"
        disabled={disabled}
        onClick={setFromEvent}
        aria-label="Set image focal point"
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          maxWidth: 360,
          aspectRatio: '16 / 10',
          border: '1px solid rgba(7,4,99,0.12)',
          borderRadius: 10,
          overflow: 'hidden',
          padding: 0,
          cursor: disabled ? 'default' : 'crosshair',
          background: '#0b0b12',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: value || '50% 50%',
            pointerEvents: 'none',
            display: 'block',
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: '50%',
            border: '2px solid #fff',
            background: '#A02315',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        />
      </button>
    </div>
  );
}
