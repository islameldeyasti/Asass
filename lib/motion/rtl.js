/**
 * Language-aware motion helpers for Framer Motion / motion/react.
 * Mirror only horizontal direction — not fade/scale/vertical.
 */

export function isRtlLocale(locale) {
  return locale === 'ar';
}

/** Enter from the reading-start edge (LTR: left, RTL: right). */
export function enterX(locale, distance = 24) {
  return isRtlLocale(locale) ? distance : -distance;
}

/** Exit toward the reading-end edge. */
export function exitX(locale, distance = 24) {
  return isRtlLocale(locale) ? -distance : distance;
}

/**
 * Opacity + horizontal reveal from the reading-start side.
 * @example initial={fadeInX(locale, 30)}
 */
export function fadeInX(locale, distance = 24) {
  return {opacity: 0, x: enterX(locale, distance)};
}

export function fadeInXVisible() {
  return {opacity: 1, x: 0};
}

/**
 * Stagger delay so visual sequence runs with reading direction.
 * For a row of `columns` items, RTL starts from the rightmost card.
 */
export function staggerDelayRtl(index, locale, {columns = 4, step = 0.08, max = 0.32} = {}) {
  if (!isRtlLocale(locale) || columns < 2) {
    return Math.min(index * step, max);
  }
  const col = index % columns;
  const row = Math.floor(index / columns);
  const rtlIndex = row * columns + (columns - 1 - col);
  return Math.min(rtlIndex * step, max);
}

/** Hover nudge for directional arrows (px). */
export function arrowHoverX(locale, distance = 4) {
  return isRtlLocale(locale) ? -distance : distance;
}
