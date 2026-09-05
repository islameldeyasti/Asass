import {ExternalLink, MapPin, Navigation} from 'lucide-react';
import {company} from '@/data/company';

const MAP_QUERY = encodeURIComponent(
  'ADCP Building P1239, Plot C125, Musaffah East 9, behind Safeer Mall, Abu Dhabi, UAE',
);

const MAP_EMBED = `https://maps.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`;
const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

export default function OfficeMap({locale = 'en'}) {
  const ar = locale === 'ar';

  return (
    <section className="contact-map-section" aria-labelledby="contact-map-title">
      <div className="contact-map-head">
        <div>
          <p className="atlas-kicker">{ar ? 'الموقع' : 'Location'}</p>
          <h2 id="contact-map-title">{ar ? 'مكتب أساس في أبوظبي' : 'ASAS office in Abu Dhabi'}</h2>
          <p className="contact-map-address">
            <MapPin size={16} aria-hidden="true" />
            <span>{ar ? company.addressAr : company.address}</span>
          </p>
        </div>
        <a
          className="button contact-map-directions"
          href={MAP_DIRECTIONS}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation size={16} aria-hidden="true" />
          {ar ? 'احصل على الاتجاهات' : 'Get Directions'}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="contact-map-frame">
        <div className="contact-map-pin" aria-hidden="true">
          <span />
          <strong>ASAS</strong>
        </div>
        <iframe
          title={ar ? 'خريطة مكتب أساس' : 'ASAS office map'}
          src={MAP_EMBED}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
