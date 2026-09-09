'use client';

import {useEffect} from 'react';
import {ANCHOR_GAP, scrollToHash, syncAnchorOffsetVars} from '@/lib/scroll/anchor';

/**
 * Site-wide: keeps --asas-anchor-offset fresh and corrects landing hashes
 * even on pages without a section subnav.
 */
export default function AnchorScrollRoot() {
  useEffect(() => {
    const sync = () => syncAnchorOffsetVars(ANCHOR_GAP);
    sync();

    const onResize = () => sync();
    window.addEventListener('resize', onResize, {passive: true});
    window.addEventListener('scroll', onResize, {passive: true});

    // Correct deep links after chrome/subnav paint
    scrollToHash({delay: 200});

    const onHash = () => scrollToHash({delay: 40});
    window.addEventListener('hashchange', onHash);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  return null;
}
