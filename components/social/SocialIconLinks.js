import {Facebook, Instagram, Linkedin, Youtube} from 'lucide-react';
import {socialNetworks} from '@/data/socialLinks';
import {t} from '@/lib/i18n/ui';

const ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

/**
 * Shared social icon list — used by footer and floating bar.
 * @param {'footer' | 'float'} variant
 */
export default function SocialIconLinks({variant = 'footer', className = '', locale = 'en'}) {
  const listClass =
    variant === 'float' ? 'asas-social-list asas-social-list--float' : 'asas-social-list asas-social-list--footer';

  return (
    <ul className={`${listClass}${className ? ` ${className}` : ''}`} role="list">
      {socialNetworks.map((network) => {
        const Icon = ICONS[network.id];
        if (!Icon || !network.href) return null;
        const label = t(network.labelKey, locale);
        const ariaLabel = t(network.ariaKey, locale);
        return (
          <li key={network.id}>
            <a
              className={`asas-social-btn asas-social-btn--${variant}`}
              href={network.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              title={label}
              data-network={network.id}
            >
              <Icon size={variant === 'float' ? 18 : 20} strokeWidth={1.75} aria-hidden="true" />
              {variant === 'float' ? (
                <span className="asas-social-tooltip" aria-hidden="true">
                  {label}
                </span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
