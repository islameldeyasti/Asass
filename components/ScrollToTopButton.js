'use client';

import {useEffect, useState} from 'react';
import {ArrowUp} from 'lucide-react';
import {useReducedMotion} from 'motion/react';

import {t} from '@/lib/i18n/ui';

const SHOW_AFTER_PX = 600;

/** Fixed right-side scroll-to-top — stacks above WhatsApp. */
export default function ScrollToTopButton({locale = 'en'}) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`asas-scroll-top${visible ? ' is-visible' : ''}`}
      aria-label={t('scrollToTop', locale)}
      title={t('scrollToTop', locale)}
      onClick={scrollTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp size={20} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
