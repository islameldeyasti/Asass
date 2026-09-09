/**
 * Global sticky-offset + section anchor scrolling.
 * One strategy for every page: measure sticky stack, scroll once, no double offset.
 */

export const ANCHOR_GAP = 16;
export const SUBNAV_SELECTOR = '[data-sticky-subnav]';
export const CHROME_SELECTOR = '[data-sticky-chrome], .asas-chrome';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Current sticky header + optional sticky subnav heights. */
export function getStickyStack() {
  if (typeof document === 'undefined') {
    return {chrome: 0, chromeCompact: 0, subnav: 0, total: 0, anchorTotal: 0};
  }

  const chromeWrap = document.querySelector(CHROME_SELECTOR);
  const subnavEl = document.querySelector(SUBNAV_SELECTOR);

  // Header geometry is stable (no shrink-on-scroll) — measure once from live layout.
  const chrome = chromeWrap ? Math.round(chromeWrap.getBoundingClientRect().height) : 138;

  let subnav = 0;
  if (subnavEl) {
    subnav = Math.round(subnavEl.getBoundingClientRect().height);
  }

  return {
    chrome,
    chromeCompact: chrome,
    subnav,
    total: chrome + subnav,
    anchorTotal: chrome + subnav,
  };
}

/** Pixels to clear below the sticky stack for scroll destinations. */
export function getStickyOffset(gap = ANCHOR_GAP) {
  return getStickyStack().anchorTotal + gap;
}

/** Keep CSS vars in sync for native hash / sticky subnav top. */
export function syncAnchorOffsetVars(gap = ANCHOR_GAP) {
  if (typeof document === 'undefined') return getStickyOffset(gap);
  const {chrome, chromeCompact, subnav, anchorTotal} = getStickyStack();
  const offset = anchorTotal + gap;
  const root = document.documentElement;
  root.style.setProperty('--asas-chrome-h', `${chrome || chromeCompact}px`);
  root.style.setProperty('--asas-subnav-h', `${subnav}px`);
  root.style.setProperty('--asas-anchor-gap', `${gap}px`);
  root.style.setProperty('--asas-anchor-offset', `${offset}px`);
  root.style.setProperty('--asas-sticky-offset', `${offset}px`);
  return offset;
}

/**
 * Resolve the element to align under the sticky stack.
 * Prefer an explicit marker, then the section label/kicker near the top
 * so large section padding does not leave a previous-section "tail".
 */
export function resolveScrollElement(target) {
  if (!target) return null;
  if (target.matches?.('[data-scroll-align]')) return target;

  const marked = target.querySelector?.(':scope [data-scroll-align]');
  if (marked) return marked;

  const label = target.querySelector?.(
    ':scope .cp-kicker, :scope .sv-kicker, :scope .sd-kicker, :scope .sc-kicker, :scope .pd-kicker, :scope .tm-kicker, :scope .pf-kicker, :scope .cp-section-head .cp-kicker, :scope header .cp-kicker, :scope .cp-section-head h2, :scope h2',
  );

  if (label) {
    const sectionTop = target.getBoundingClientRect().top;
    const labelTop = label.getBoundingClientRect().top;
    // Use label only when it sits in the section's opening band
    if (labelTop - sectionTop >= 0 && labelTop - sectionTop <= 180) {
      return label;
    }
  }

  return target;
}

export function getElementByHash(hashOrId) {
  if (typeof document === 'undefined') return null;
  const raw = String(hashOrId || '').replace(/^#/, '');
  if (!raw) return null;
  try {
    return document.getElementById(raw) || document.querySelector(`[name="${CSS.escape(raw)}"]`);
  } catch {
    return document.getElementById(raw);
  }
}

/**
 * Scroll so the target starts just below the sticky stack.
 * Does not use scrollIntoView — avoids stacking with scroll-margin/padding.
 */
export function scrollToSection(hashOrId, options = {}) {
  if (typeof window === 'undefined') return false;

  const {
    gap = ANCHOR_GAP,
    updateHash = true,
    behavior,
  } = options;

  const node = typeof hashOrId === 'string' ? getElementByHash(hashOrId) : hashOrId;
  if (!node) return false;

  // Page-top heroes only — do not treat every #overview as "scroll to top"
  // (company profile Overview is a content section below the subnav).
  const isTopHero = node.matches?.(
    '.cp-hero, .sv-hero, .sd-hero, .sc-hero, .pl-hero, .pf-hero, .tm-page-hero, .pd-hero',
  );
  if (isTopHero) {
    const far = window.scrollY > 480;
    const motion =
      behavior ??
      (prefersReducedMotion() || far ? 'auto' : 'smooth');
    window.scrollTo({top: 0, behavior: motion});
    if (updateHash && node.id) {
      const next = `#${node.id}`;
      if (window.location.hash !== next) history.pushState(null, '', next);
    }
    return true;
  }

  const target = resolveScrollElement(node);
  const offset = syncAnchorOffsetVars(gap);
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
  const motion = behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth');

  window.scrollTo({top, behavior: motion});

  if (updateHash && node.id) {
    const next = `#${node.id}`;
    if (window.location.hash !== next) {
      history.pushState(null, '', next);
    }
  }

  return true;
}

/** Handle initial / changed URL hash after layout settles. */
export function scrollToHash(options = {}) {
  if (typeof window === 'undefined') return false;
  const hash = options.hash ?? window.location.hash;
  if (!hash || hash === '#') return false;

  const run = () => scrollToSection(hash, {...options, updateHash: false, behavior: options.behavior ?? 'auto'});

  // Double rAF + short delay covers sticky measurement + late layout.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      run();
      window.setTimeout(run, options.delay ?? 120);
    });
  });
  return true;
}

/**
 * Active-section observer using the same sticky offset line.
 * onChange(id) when the section crossing the anchor line changes.
 */
export function observeSectionNav(ids, onChange, options = {}) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const gap = options.gap ?? ANCHOR_GAP;
  const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!nodes.length) return () => {};

  const buildObserver = () => {
    const offset = Math.max(0, syncAnchorOffsetVars(gap));
    return new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aDist = Math.abs(a.boundingClientRect.top - offset);
            const bDist = Math.abs(b.boundingClientRect.top - offset);
            return aDist - bDist || b.intersectionRatio - a.intersectionRatio;
          })[0];
        if (visible?.target?.id) onChange(visible.target.id);
      },
      {
        root: null,
        rootMargin: `-${offset}px 0px -45% 0px`,
        threshold: options.threshold ?? [0.08, 0.2, 0.4, 0.6],
      },
    );
  };

  let observer = buildObserver();
  nodes.forEach((node) => observer.observe(node));

  const refresh = () => {
    observer.disconnect();
    observer = buildObserver();
    nodes.forEach((node) => observer.observe(node));
  };

  window.addEventListener('resize', refresh, {passive: true});

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', refresh);
  };
}
