'use client';

import {
  Building2,
  Download,
  FileText,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2,
} from 'lucide-react';

function WhatsAppIcon({size = 18}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function CompanyBrand({src, invert = false, lightLogo, darkLogo, className = ''}) {
  const logo = src || (invert ? darkLogo : lightLogo);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`dcard-logo ${className}`.trim()} src={logo} alt="ASAS" />
  );
}

export function EmployeePortrait({
  photo,
  focal,
  initials,
  shape = 'rounded',
  size = 'md',
  className = '',
}) {
  const shapeClass =
    shape === 'circle'
      ? 'is-circle'
      : shape === 'square'
        ? 'is-square'
        : shape === 'editorial'
          ? 'is-editorial'
          : 'is-rounded';
  if (!photo) {
    return (
      <div
        className={`dcard-photo dcard-photo--empty ${shapeClass} is-${size} ${className}`.trim()}
        aria-hidden
      >
        {initials}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`dcard-photo ${shapeClass} is-${size} ${className}`.trim()}
      src={photo}
      alt=""
      style={{objectPosition: focal || '50% 30%'}}
    />
  );
}

export function EmployeeName({name, className = ''}) {
  return <h1 className={`dcard-name ${className}`.trim()}>{name}</h1>;
}

export function EmployeeRole({title, className = ''}) {
  if (!title) return null;
  return <p className={`dcard-title ${className}`.trim()}>{title}</p>;
}

export function EmployeeBio({bio, className = ''}) {
  if (!bio) return null;
  return <p className={`dcard-bio ${className}`.trim()}>{bio}</p>;
}

export function ActionButton({href, onClick, label, children, variant = 'solid', download = false}) {
  const className = `dcard-action dcard-action--${variant}`;
  if (href) {
    const isExternalHttp = /^https?:\/\//i.test(href);
    return (
      <a
        className={className}
        href={href}
        download={download === true ? true : download || undefined}
        target={isExternalHttp ? '_blank' : undefined}
        rel={isExternalHttp ? 'noopener noreferrer' : undefined}
        onClick={onClick}
      >
        {children}
        <span>{label}</span>
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
      <span>{label}</span>
    </button>
  );
}

export function ContactActions({
  vm,
  onTrack,
  onShare,
  onSaveContact,
  compact = false,
}) {
  if (!vm.showContactActions) return null;
  const items = [];
  if (vm.phone) {
    items.push(
      <ActionButton
        key="call"
        href={`tel:${digits(vm.phone)}`}
        label={vm.ar ? 'اتصال' : 'Call'}
        onClick={() => onTrack?.('call')}
      >
        <Phone size={16} />
      </ActionButton>,
    );
  }
  if (vm.email) {
    items.push(
      <ActionButton
        key="email"
        href={`mailto:${vm.email}`}
        label={vm.ar ? 'بريد' : 'Email'}
        variant="ghost"
        onClick={() => onTrack?.('email')}
      >
        <Mail size={16} />
      </ActionButton>,
    );
  }
  if (vm.whatsapp) {
    items.push(
      <ActionButton
        key="wa"
        href={`https://wa.me/${vm.whatsapp}`}
        label="WhatsApp"
        variant="ghost"
        onClick={() => onTrack?.('whatsapp')}
      >
        <WhatsAppIcon size={16} />
      </ActionButton>,
    );
  }
  items.push(
    <ActionButton
      key="vcard"
      onClick={() => {
        onTrack?.('vcard');
        onSaveContact?.();
      }}
      label={vm.ar ? 'حفظ جهة الاتصال' : 'Save Contact'}
      variant={compact ? 'ghost' : 'solid'}
    >
      <Download size={16} />
    </ActionButton>,
  );
  if (vm.linkedin && vm.showSocialButtons) {
    items.push(
      <ActionButton
        key="li"
        href={vm.linkedin}
        label="LinkedIn"
        variant="ghost"
        onClick={() => onTrack?.('linkedin')}
      >
        <Linkedin size={16} />
      </ActionButton>,
    );
  }
  items.push(
    <ActionButton
      key="share"
      onClick={() => {
        onTrack?.('share');
        onShare?.();
      }}
      label={vm.ar ? 'مشاركة' : 'Share'}
      variant="ghost"
    >
      <Share2 size={16} />
    </ActionButton>,
  );
  if (vm.profileUrl) {
    items.push(
      <ActionButton key="copy" href={vm.profileUrl} label={vm.ar ? 'الرابط' : 'Link'} variant="ghost">
        <Link2 size={16} />
      </ActionButton>,
    );
  }
  return <div className={`dcard-actions${compact ? ' is-compact' : ''}`}>{items}</div>;
}

const COMPANY_PROFILE_PDF = '/downloads/asas-company-profile.pdf';

/** Company PDF download + portfolio + full company profile links for employee cards. */
export function CompanyResources({vm, onTrack, compact = false}) {
  if (vm.showCompanyResources === false) return null;
  const locale = vm.locale || (vm.ar ? 'ar' : 'en');
  return (
    <div className={`dcard-resources${compact ? ' is-compact' : ''}`}>
      <ActionButton
        href={COMPANY_PROFILE_PDF}
        label={vm.ar ? 'تحميل الملف' : 'Download Profile'}
        variant="solid"
        download
        onClick={() => onTrack?.('download')}
      >
        <Download size={16} />
      </ActionButton>
      <ActionButton
        href={`/${locale}/projects`}
        label={vm.ar ? 'محفظة المشاريع' : 'Project Portfolio'}
        variant="ghost"
        onClick={() => onTrack?.('portfolio')}
      >
        <FileText size={16} />
      </ActionButton>
      <ActionButton
        href={`/${locale}/company-profile`}
        label={vm.ar ? 'معلومات الشركة' : 'Company Information'}
        variant="ghost"
        onClick={() => onTrack?.('company')}
      >
        <Building2 size={16} />
      </ActionButton>
    </div>
  );
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function MetaRow({vm}) {
  if (!(vm.showDepartment && vm.department) && !vm.location) return null;
  return (
    <div className="dcard-meta">
      {vm.showDepartment && vm.department ? <span>{vm.department}</span> : null}
      {vm.location ? (
        <span className="dcard-meta-item">
          <MapPin size={12} aria-hidden /> {vm.location}
        </span>
      ) : null}
    </div>
  );
}

export function TagList({items = []}) {
  if (!items?.length) return null;
  return (
    <ul className="dcard-tags">
      {items.slice(0, 6).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function QrBlock({qrDataUrl, label}) {
  if (!qrDataUrl) return null;
  return (
    <div className="dcard-qr">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="" width={88} height={88} />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function CoverBand({src, focal, children, className = ''}) {
  const style = src
    ? {
        '--dcard-local-cover': `url("${String(src).replace(/"/g, '')}")`,
        '--dcard-local-focal': focal || '50% 40%',
      }
    : undefined;
  return (
    <div
      className={`dcard-cover${src ? ' has-image' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
