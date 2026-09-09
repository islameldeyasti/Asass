'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

export default function CapabilitiesExplorer({locale, groups}) {
  const ar = locale === 'ar';
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || 'design');
  const [activeService, setActiveService] = useState(groups[0]?.services?.[0]?.slug || '');

  const currentGroup = groups.find((group) => group.id === activeGroup) || groups[0];
  const currentService =
    currentGroup?.services?.find((service) => service.slug === activeService) ||
    currentGroup?.services?.[0];

  if (!groups.length) return null;

  return (
    <div className="cp-cap-explorer">
      <div className="cp-cap-groups" role="tablist" aria-label={ar ? 'مجموعات الخدمات' : 'Service groups'}>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={activeGroup === group.id}
            className={activeGroup === group.id ? 'is-active' : ''}
            onClick={() => {
              setActiveGroup(group.id);
              setActiveService(group.services[0]?.slug || '');
            }}
          >
            {ar ? group.labelAr : group.label}
          </button>
        ))}
      </div>

      <div className="cp-cap-layout">
        <div className="cp-cap-nav">
          {currentGroup.services.map((service) => (
            <button
              key={service.slug}
              type="button"
              className={currentService?.slug === service.slug ? 'is-active' : ''}
              onClick={() => setActiveService(service.slug)}
              onMouseEnter={() => setActiveService(service.slug)}
            >
              {ar ? service.titleAr : service.title}
            </button>
          ))}
        </div>

        {currentService && (
          <div className="cp-cap-detail">
            <div
              className={`cp-cap-media${currentService.image ? '' : ' cp-cap-media--panel'}`}
              aria-hidden="true"
            >
              {currentService.image ? (
                <Image
                  src={currentService.image}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{
                    objectFit: 'cover',
                    objectPosition: currentService.imagePosition || 'center center',
                  }}
                />
              ) : (
                <div className="cp-cap-fallback">
                  <span>{ar ? 'خدمة' : 'Service'}</span>
                  <strong>{ar ? currentService.titleAr : currentService.title}</strong>
                </div>
              )}
            </div>
            <div className="cp-cap-copy">
              <p className="cp-kicker">
                <i />
                {ar ? currentGroup.labelAr : currentGroup.label}
              </p>
              <h3>{ar ? currentService.titleAr : currentService.title}</h3>
              <p>{ar ? currentService.descriptionAr : currentService.description}</p>
              <Link className="cp-text-cta" href={`/${locale}/services/${currentService.slug}`}>
                {ar ? 'عرض الخدمة' : 'View service'}
                <ArrowRight size={15} className={ar ? 'cp-flip' : ''} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
