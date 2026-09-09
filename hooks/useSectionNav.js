'use client';

import {useCallback, useEffect, useState} from 'react';
import {
  ANCHOR_GAP,
  observeSectionNav,
  scrollToHash,
  scrollToSection,
  syncAnchorOffsetVars,
} from '@/lib/scroll/anchor';

/**
 * Shared section-tab navigation:
 * - measured sticky offset scrolling
 * - active tab sync
 * - hash load / back-forward support
 */
export function useSectionNav(ids, options = {}) {
  const {
    defaultId = ids[0] || '',
    gap = ANCHOR_GAP,
    syncHash = true,
  } = options;

  const [active, setActive] = useState(defaultId);

  useEffect(() => {
    syncAnchorOffsetVars(gap);

    const onResize = () => syncAnchorOffsetVars(gap);
    window.addEventListener('resize', onResize, {passive: true});
    window.addEventListener('scroll', onResize, {passive: true});

    const stopObserve = observeSectionNav(ids, setActive, {gap});

    const onHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id && ids.includes(id)) {
        setActive(id);
        scrollToSection(id, {gap, updateHash: false});
      }
    };

    // Initial hash after layout
    if (window.location.hash) {
      const id = window.location.hash.replace(/^#/, '');
      if (ids.includes(id)) setActive(id);
      scrollToHash({gap, delay: 160});
    }

    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);

    return () => {
      stopObserve();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, [ids, gap]);

  const goTo = useCallback(
    (id) => {
      if (!id) return;
      setActive(id);
      scrollToSection(id, {gap, updateHash: syncHash});
    },
    [gap, syncHash],
  );

  const onTabClick = useCallback(
    (event, id) => {
      event.preventDefault();
      goTo(id);
    },
    [goTo],
  );

  return {active, setActive, goTo, onTabClick};
}
