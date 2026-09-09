import Link from 'next/link';
import ThemeLogo from '@/components/theme/ThemeLogo';
import {t} from '@/lib/i18n/ui';

export default function Brand({locale = 'en', light = false, symbolOnly = false}) {
  return (
    <Link
      className={`brand ${light ? 'light' : ''} ${symbolOnly ? 'symbol-only' : ''}`}
      href={`/${locale}`}
      aria-label={t('homeAria', locale)}
    >
      <ThemeLogo width={68} height={68} priority />
      {!symbolOnly && (
        <span className="brand-type">
          <b>ASAS ENGINEERING &amp; PROJECT</b>
          <small>MANAGEMENT CONSULTANCY</small>
        </span>
      )}
    </Link>
  );
}
