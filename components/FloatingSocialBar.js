'use client';

import SocialIconLinks from '@/components/social/SocialIconLinks';
import usePastFirstSection from '@/components/hooks/usePastFirstSection';
import {t} from '@/lib/i18n/ui';

/** Fixed left-side social stack — hidden on first section and over the footer. */
export default function FloatingSocialBar({locale = 'en'}) {
  const {visible} = usePastFirstSection({watchFooter: true});

  const className = ['asas-float-social', visible ? 'is-visible' : 'is-hidden']
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={className}
      aria-label={t('socialMedia', locale)}
      aria-hidden={visible ? undefined : true}
    >
      <SocialIconLinks variant="float" locale={locale} />
    </nav>
  );
}
