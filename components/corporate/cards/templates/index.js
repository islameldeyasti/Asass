'use client';

import {
  CompanyBrand,
  ContactActions,
  CoverBand,
  EmployeeBio,
  EmployeeName,
  EmployeePortrait,
  EmployeeRole,
  MetaRow,
  QrBlock,
  TagList,
} from '@/components/corporate/cards/primitives';
import {cardShellCssVars} from '@/lib/cms/corporate/employee-cards';

/** Templates that already paint a header/cover surface from CSS vars or CoverBand */
const TEMPLATES_WITH_COVER_SURFACE = new Set([
  'asas-executive',
  'executive-dark',
  'cover-profile',
  'modern-split',
  'brand-cover',
  'uae-premium',
]);

function Shell({vm, className = '', children}) {
  const style = cardShellCssVars(vm.card || {});
  const hasCover = Boolean(vm.coverImage);
  const injectCover =
    hasCover && !TEMPLATES_WITH_COVER_SURFACE.has(vm.templateId);
  return (
    <article
      className={`dcard dcard--${vm.templateId} theme-${vm.themePreset}${hasCover ? ' has-cover-image' : ''} ${className}`.trim()}
      data-template={vm.templateId}
      dir={vm.ar ? 'rtl' : 'ltr'}
      style={style}
    >
      <div className="dcard-shell">
        {injectCover ? (
          <CoverBand
            src={vm.coverImage}
            focal={vm.coverFocal}
            className="dcard-cover--shell"
          />
        ) : null}
        {children}
      </div>
    </article>
  );
}

function CommonFooter({vm, handlers}) {
  return (
    <>
      <ContactActions
        vm={vm}
        onTrack={handlers.onTrack}
        onShare={handlers.onShare}
        onSaveContact={handlers.onSaveContact}
      />
      {vm.showQrOnCard ? (
        <QrBlock qrDataUrl={vm.qrDataUrl} label={vm.ar ? 'امسح للحفظ' : 'Scan to save'} />
      ) : null}
    </>
  );
}

/** 01 — ASAS Executive */
export function TemplateAsasExecutive({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <header className="dcard-head dcard-head--brand">
        <CompanyBrand src={vm.logoSrc} lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} invert />
        <div>
          <strong>{vm.companyShort}</strong>
          <span>{vm.companyCity}</span>
        </div>
      </header>
      <div className="dcard-body dcard-body--overlap">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="rounded"
          size="lg"
          className="dcard-portrait-overlap"
        />
        <EmployeeName name={vm.name} />
        <EmployeeRole title={vm.title} />
        <MetaRow vm={vm} />
        {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        <TagList items={vm.specialties} />
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

/** 02 — Executive Dark */
export function TemplateExecutiveDark({vm, handlers}) {
  return (
    <Shell vm={vm} className="is-dark">
      <div className="dcard-dark-band">
        <CompanyBrand lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} invert src={vm.darkLogo} />
      </div>
      <div className="dcard-body dcard-body--row">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="rounded"
          size="xl"
        />
        <div>
          <EmployeeName name={vm.name} />
          <EmployeeRole title={vm.title} />
          <MetaRow vm={vm} />
          {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        </div>
      </div>
      <div className="dcard-body">
        <TagList items={vm.specialties} />
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

/** 03 — Cover Profile */
export function TemplateCoverProfile({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <CoverBand
        src={vm.coverImage || vm.photo}
        focal={vm.coverImage ? vm.coverFocal : vm.photoFocal}
        className="dcard-cover--tall"
      />
      <div className="dcard-body dcard-body--centered dcard-body--overlap-circle">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="circle"
          size="xl"
          className="dcard-portrait-overlap"
        />
        <EmployeeName name={vm.name} />
        <EmployeeRole title={vm.title} />
        {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        <MetaRow vm={vm} />
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

/** 04 — Modern Split */
export function TemplateModernSplit({vm, handlers}) {
  const mediaSrc = vm.coverImage || vm.photo;
  const mediaFocal = vm.coverImage ? vm.coverFocal : vm.photoFocal;
  return (
    <Shell vm={vm}>
      <div className="dcard-split">
        <div
          className={`dcard-split-media${mediaSrc ? ' has-image' : ''}`}
          style={
            mediaSrc
              ? {
                  '--dcard-local-cover': `url("${String(mediaSrc).replace(/"/g, '')}")`,
                  '--dcard-local-focal': mediaFocal || '50% 40%',
                }
              : undefined
          }
        >
          <CompanyBrand lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} invert src={vm.darkLogo} />
          <EmployeePortrait
            photo={vm.photo}
            focal={vm.photoFocal}
            initials={vm.initials}
            shape="square"
            size="lg"
          />
        </div>
        <div className="dcard-split-copy">
          <EmployeeName name={vm.name} />
          <EmployeeRole title={vm.title} />
          <MetaRow vm={vm} />
          {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
          <TagList items={vm.specialties} />
          <CommonFooter vm={vm} handlers={handlers} />
        </div>
      </div>
    </Shell>
  );
}

/** 05 — Architectural Grid */
export function TemplateArchitecturalGrid({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <div className="dcard-grid-frame" aria-hidden />
      <header className="dcard-head dcard-head--ruled">
        <CompanyBrand src={vm.logoSrc} lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} />
        <span className="dcard-eyebrow">{vm.companyName}</span>
      </header>
      <div className="dcard-body dcard-body--grid">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="square"
          size="lg"
        />
        <div>
          <EmployeeName name={vm.name} />
          <EmployeeRole title={vm.title} />
          <MetaRow vm={vm} />
        </div>
        {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        <TagList items={[...vm.specialties, ...vm.qualifications].slice(0, 6)} />
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

/** 06 — Minimal Signature */
export function TemplateMinimalSignature({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <div className="dcard-body dcard-body--centered dcard-body--airy">
        <CompanyBrand src={vm.logoSrc} lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} />
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="circle"
          size="xl"
        />
        <EmployeeName name={vm.name} />
        <EmployeeRole title={vm.title} />
        <ContactActions
          vm={vm}
          onTrack={handlers.onTrack}
          onShare={handlers.onShare}
          onSaveContact={handlers.onSaveContact}
          compact
        />
      </div>
    </Shell>
  );
}

/** 07 — Brand Cover */
export function TemplateBrandCover({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <CoverBand
        src={vm.coverImage}
        focal={vm.coverFocal}
        className={`dcard-cover--brand${!vm.coverImage ? ' is-fallback' : ''}`}
      >
        <CompanyBrand lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} invert src={vm.darkLogo} />
      </CoverBand>
      <div className="dcard-body dcard-body--centered dcard-body--overlap-circle">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="circle"
          size="xl"
          className="dcard-portrait-overlap"
        />
        <EmployeeName name={vm.name} />
        <EmployeeRole title={vm.title} />
        <MetaRow vm={vm} />
        {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

/** 08 — Professional ID */
export function TemplateProfessionalId({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <div className="dcard-id">
        <div className="dcard-id-main">
          <EmployeePortrait
            photo={vm.photo}
            focal={vm.photoFocal}
            initials={vm.initials}
            shape="rounded"
            size="md"
          />
          <div>
            <CompanyBrand src={vm.logoSrc} lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} />
            <EmployeeName name={vm.name} />
            <EmployeeRole title={vm.title} />
            <p className="dcard-company-line">{vm.companyName}</p>
          </div>
        </div>
        <ul className="dcard-id-rows">
          {vm.email ? (
            <li>
              <span>Email</span>
              <strong dir="ltr">{vm.email}</strong>
            </li>
          ) : null}
          {vm.phone ? (
            <li>
              <span>Phone</span>
              <strong dir="ltr">{vm.phone}</strong>
            </li>
          ) : null}
          {vm.mobile ? (
            <li>
              <span>Mobile</span>
              <strong dir="ltr">{vm.mobile}</strong>
            </li>
          ) : null}
          {vm.website ? (
            <li>
              <span>Web</span>
              <strong dir="ltr">{vm.website.replace(/^https?:\/\//, '')}</strong>
            </li>
          ) : null}
        </ul>
        <div className="dcard-id-foot">
          {vm.showQrOnCard ? <QrBlock qrDataUrl={vm.qrDataUrl} /> : null}
          <ContactActions
            vm={vm}
            onTrack={handlers.onTrack}
            onShare={handlers.onShare}
            onSaveContact={handlers.onSaveContact}
            compact
          />
        </div>
      </div>
    </Shell>
  );
}

/** 09 — Editorial Profile */
export function TemplateEditorialProfile({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <div className="dcard-editorial">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="editorial"
          size="hero"
        />
        <div className="dcard-editorial-copy">
          <span className="dcard-eyebrow">{vm.companyShort}</span>
          <EmployeeName name={vm.name} />
          <EmployeeRole title={vm.title} />
          {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
          <TagList items={vm.specialties} />
          <CommonFooter vm={vm} handlers={handlers} />
        </div>
      </div>
    </Shell>
  );
}

/** 10 — UAE Premium */
export function TemplateUaePremium({vm, handlers}) {
  return (
    <Shell vm={vm}>
      <CoverBand
        src={vm.coverImage}
        focal={vm.coverFocal}
        className={`dcard-cover--stone${!vm.coverImage ? ' is-fallback' : ''}`}
      />
      <div className="dcard-body dcard-body--centered dcard-body--overlap-circle dcard-body--uae">
        <EmployeePortrait
          photo={vm.photo}
          focal={vm.photoFocal}
          initials={vm.initials}
          shape="circle"
          size="xl"
          className="dcard-portrait-overlap"
        />
        <CompanyBrand src={vm.logoSrc} lightLogo={vm.lightLogo} darkLogo={vm.darkLogo} />
        <EmployeeName name={vm.name} />
        <EmployeeRole title={vm.title} />
        <MetaRow vm={vm} />
        {vm.showBio ? <EmployeeBio bio={vm.bio} /> : null}
        <CommonFooter vm={vm} handlers={handlers} />
      </div>
    </Shell>
  );
}

export const TEMPLATE_RENDERERS = {
  'asas-executive': TemplateAsasExecutive,
  'executive-dark': TemplateExecutiveDark,
  'cover-profile': TemplateCoverProfile,
  'modern-split': TemplateModernSplit,
  'architectural-grid': TemplateArchitecturalGrid,
  'minimal-signature': TemplateMinimalSignature,
  'brand-cover': TemplateBrandCover,
  'professional-id': TemplateProfessionalId,
  'editorial-profile': TemplateEditorialProfile,
  'uae-premium': TemplateUaePremium,
};
