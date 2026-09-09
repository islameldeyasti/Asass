import SocialIconLinks from '@/components/social/SocialIconLinks';
import {t} from '@/lib/i18n/ui';

/** Fixed left-side social stack — desktop/tablet; hidden on mobile. */
export default function FloatingSocialBar({locale = 'en'}) {
  return (
    <nav className="asas-float-social" aria-label={t('socialMedia', locale)}>
      <SocialIconLinks variant="float" locale={locale} />
    </nav>
  );
}
