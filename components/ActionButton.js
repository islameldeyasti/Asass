import Link from 'next/link';
import {ArrowRight, ArrowUpRight, Download, FileText} from 'lucide-react';

const ICONS = {
  arrow: ArrowRight,
  'arrow-up': ArrowUpRight,
  download: Download,
  file: FileText,
};

function isExternalHref(href = '') {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('wa.me') ||
    href.includes('://')
  );
}

/**
 * Global ASAS action CTA.
 * Variants: primary | outline | light | ghost
 * Icons: arrow | arrow-up | download | file | false | ReactNode
 */
export function ActionButton({
  href,
  variant = 'primary',
  icon = 'arrow',
  download = false,
  external = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['asas-action', `asas-action--${variant}`, className].filter(Boolean).join(' ');

  let iconNode = null;
  if (icon && typeof icon !== 'boolean') {
    if (typeof icon === 'string' && ICONS[icon]) {
      const Icon = ICONS[icon];
      iconNode = (
        <Icon
          size={16}
          aria-hidden="true"
          className={icon === 'arrow' || icon === 'arrow-up' ? 'asas-action-arrow' : undefined}
        />
      );
    } else {
      iconNode = icon;
    }
  }

  const content = (
    <>
      <span className="asas-action-label">{children}</span>
      {iconNode}
    </>
  );

  const openExternal = external || isExternalHref(href);
  const isHash = typeof href === 'string' && href.startsWith('#');

  if (openExternal || download || isHash) {
    return (
      <a
        className={classes}
        href={href}
        download={download === true ? true : download || undefined}
        target={openExternal && !href?.startsWith('mailto:') && !href?.startsWith('tel:') ? '_blank' : undefined}
        rel={openExternal ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...rest}>
      {content}
    </Link>
  );
}

export function ActionGroup({children, className = '', stack = true}) {
  return (
    <div
      className={['asas-action-group', stack ? 'asas-action-group--stack' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export default ActionButton;
