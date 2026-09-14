/**
 * QR helpers for digital employee cards.
 * Prefer error correction Q for print / small sizes.
 */

import QRCode from 'qrcode';

const DEFAULT_OPTS = {
  errorCorrectionLevel: 'Q',
  margin: 2,
  width: 512,
  color: {
    dark: '#070463',
    light: '#ffffff',
  },
};

function mergeOpts(options = {}) {
  return {
    ...DEFAULT_OPTS,
    ...options,
    color: {
      ...DEFAULT_OPTS.color,
      ...(options.color || {}),
      dark: options.dark || options.color?.dark || DEFAULT_OPTS.color.dark,
      light: options.light || options.color?.light || DEFAULT_OPTS.color.light,
    },
    width: options.width || DEFAULT_OPTS.width,
    errorCorrectionLevel: options.errorCorrectionLevel || DEFAULT_OPTS.errorCorrectionLevel,
    margin: options.margin ?? DEFAULT_OPTS.margin,
  };
}

export async function generateQrDataUrl(text, options = {}) {
  const value = String(text || '').trim();
  if (!value) return '';
  return QRCode.toDataURL(value, mergeOpts(options));
}

export async function generateQrPngBuffer(text, options = {}) {
  const value = String(text || '').trim();
  if (!value) return null;
  return QRCode.toBuffer(value, {
    type: 'png',
    ...mergeOpts(options),
  });
}

export async function generateQrSvgString(text, options = {}) {
  const value = String(text || '').trim();
  if (!value) return '';
  const opts = mergeOpts(options);
  return QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    width: opts.width,
    color: opts.color,
  });
}
