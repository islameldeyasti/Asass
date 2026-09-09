'use client';

import {useEffect, useState} from 'react';
import {clients, clientsCopy} from '@/data/clients';

function LogoChip({client, ar, inert}) {
  const label = ar ? client.nameAr : client.name;

  return (
    <div className="asas-clients-logo has-logo" title={label} aria-hidden={inert || undefined}>
      <span className="asas-clients-logo-frame">
        {/* Native img: preserves SVG geometry and avoids optimizer edge-cases on small viewports */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={client.logo}
          alt={inert ? '' : `${label} ${ar ? 'شعار' : 'logo'}`}
          className="asas-clients-logo-img"
          width={180}
          height={72}
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </span>
      {!inert ? <span className="asas-clients-sr-only">{label}</span> : null}
    </div>
  );
}

function LogoGroup({ar, inert}) {
  return (
    <div className="asas-clients-group" aria-hidden={inert || undefined}>
      {clients.map((client) => (
        <LogoChip key={`${inert ? 'dup' : 'main'}-${client.id}`} client={client} ar={ar} inert={inert} />
      ))}
    </div>
  );
}

export default function ClientsMarquee({locale}) {
  const ar = locale === 'ar';
  const copy = clientsCopy[ar ? 'ar' : 'en'];
  const [reduced, setReduced] = useState(false);
  const canMarquee = clients.length >= 4;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  const staticMode = reduced || !canMarquee;

  return (
    <section className="asas-clients" aria-labelledby="asas-clients-title" data-asas-marquee>
      <div className="home-shell asas-clients-head">
        <p className="atlas-kicker">{copy.eyebrow}</p>
        <h2 id="asas-clients-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <div
        className={`asas-clients-marquee${staticMode ? ' is-static' : ''}`}
        dir="ltr"
        aria-label={ar ? 'جهات مختارة' : 'Selected organisations'}
      >
        <div className="asas-clients-fade asas-clients-fade--start" aria-hidden="true" />
        <div className="asas-clients-fade asas-clients-fade--end" aria-hidden="true" />
        <div className="asas-clients-track">
          {staticMode ? (
            <LogoGroup ar={ar} />
          ) : (
            <>
              <LogoGroup ar={ar} />
              <LogoGroup ar={ar} inert />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
