'use client';

import {CARD_TEMPLATES, normalizeDigitalCard} from '@/lib/cms/corporate/employee-cards';
import DigitalCardProfile from '@/components/corporate/cards/DigitalCardProfile';

/**
 * Visual template gallery — real mini previews, not color swatches.
 */
export default function TemplateGallery({
  member,
  card,
  company,
  branding,
  locale = 'en',
  selectedId,
  onSelect,
  qrDataUrl = '',
}) {
  return (
    <div className="ecs-template-gallery">
      {CARD_TEMPLATES.map((template) => {
        const previewCard = normalizeDigitalCard({
          ...card,
          templateId: template.id,
          showQrOnCard: false,
          showContactActions: false,
          showSocialButtons: false,
        });
        const active = selectedId === template.id;
        return (
          <div
            key={template.id}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            className={`ecs-template-tile${active ? ' is-active' : ''}`}
            onClick={() => onSelect?.(template.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(template.id);
              }
            }}
          >
            <div className="ecs-template-preview" aria-hidden>
              <DigitalCardProfile
                member={member}
                card={previewCard}
                company={company}
                branding={branding}
                locale={locale}
                qrDataUrl={qrDataUrl}
                compact
              />
            </div>
            <div className="ecs-template-meta">
              <strong>{template.name}</strong>
              <span>{template.description}</span>
              {active ? <em>Selected</em> : <em>Use template</em>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
