'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {ExternalLink, MapPin, Navigation, Phone} from 'lucide-react';
import {offices} from '@/data/company';
import 'leaflet/dist/leaflet.css';

function directionsUrl(office) {
  const q = encodeURIComponent(office.mapQuery || office.address || '');
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

function pinIconHtml(active) {
  const fill = active ? '#A02315' : '#070463';
  return `
    <div class="asas-map-marker${active ? ' is-active' : ''}" style="--pin:${fill}">
      <span class="asas-map-marker-dot"></span>
      <strong>ASAS</strong>
    </div>
  `;
}

export default function OfficeMap({locale = 'en'}) {
  const ar = locale === 'ar';
  const list = useMemo(() => (Array.isArray(offices) ? offices : []), []);
  const [activeId, setActiveId] = useState(list[0]?.id || 'abu-dhabi');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const leafletRef = useRef(null);

  const active = list.find((item) => item.id === activeId) || list[0];

  useEffect(() => {
    if (!mapRef.current || !list.length || mapInstanceRef.current) return undefined;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const bounds = [];
      list.forEach((office) => {
        if (!Number.isFinite(office.lat) || !Number.isFinite(office.lng)) return;
        const latLng = [office.lat, office.lng];
        bounds.push(latLng);
        const icon = L.divIcon({
          className: 'asas-map-pin-wrap',
          html: pinIconHtml(office.id === activeId),
          iconSize: [72, 36],
          iconAnchor: [36, 36],
        });
        const marker = L.marker(latLng, {icon, title: office.city}).addTo(map);
        marker.on('click', () => setActiveId(office.id));
        markersRef.current[office.id] = marker;
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, {padding: [48, 48], maxZoom: 6});
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      }

      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
    // Mount once — selection updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L || !active) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setIcon(
        L.divIcon({
          className: 'asas-map-pin-wrap',
          html: pinIconHtml(id === active.id),
          iconSize: [72, 36],
          iconAnchor: [36, 36],
        }),
      );
    });

    if (Number.isFinite(active.lat) && Number.isFinite(active.lng)) {
      const zoom = active.id === 'syria' ? 12 : 13;
      map.flyTo([active.lat, active.lng], zoom, {duration: 0.75});
    }
  }, [active]);

  if (!active) return null;

  const title = ar ? active.titleAr : active.title;
  const address = ar ? active.addressAr : active.address;
  const badge = ar ? active.badgeAr : active.badge;
  const legalName = ar ? active.legalNameAr || active.legalName : active.legalName;

  return (
    <section className="contact-map-section" aria-labelledby="contact-map-title">
      <div className="contact-map-intro">
        <p className="atlas-kicker">{ar ? 'المواقع' : 'Locations'}</p>
        <h2 id="contact-map-title">
          {ar ? 'مكاتب وفروع أساس' : 'ASAS offices & branches'}
        </h2>
        <p className="contact-map-lede">
          {ar
            ? 'اختر الفرع من التبويبات — تظهر كل المواقع على خريطة واحدةحدة.'
            : 'Choose a branch from the tabs — every location is pinned on one map.'}
        </p>
      </div>

      <div className="contact-office-tabs" role="tablist" aria-label={ar ? 'الفروع' : 'Branches'}>
        {list.map((office) => {
          const selected = office.id === active.id;
          const label = ar ? office.cityAr : office.city;
          return (
            <button
              key={office.id}
              type="button"
              role="tab"
              id={`office-tab-${office.id}`}
              aria-selected={selected}
              aria-controls="contact-office-panel"
              className={`contact-office-tab${selected ? ' is-active' : ''}`}
              onClick={() => setActiveId(office.id)}
            >
              <span className="contact-office-tab-city">{label}</span>
              <em>{ar ? office.badgeAr : office.badge}</em>
            </button>
          );
        })}
      </div>

      <div className="contact-office-panel" id="contact-office-panel" role="tabpanel">
        <div className="contact-map-head">
          <div>
            {badge ? <span className="contact-office-badge">{badge}</span> : null}
            <h3 className="contact-office-title">{title}</h3>
            {legalName ? <p className="contact-office-legal">{legalName}</p> : null}
            <p className="contact-map-address">
              <MapPin size={16} aria-hidden="true" />
              <span>{address}</span>
            </p>
            {active.phone ? (
              <p className="contact-office-meta">
                <Phone size={15} aria-hidden="true" />
                <a href={`tel:${String(active.phone).replace(/\s+/g, '')}`} dir="ltr">
                  {active.phone}
                </a>
              </p>
            ) : null}
          </div>
          <a
            className="button contact-map-directions"
            href={directionsUrl(active)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={16} aria-hidden="true" />
            {ar ? 'احصل على الاتجاهات' : 'Get Directions'}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="contact-map-frame contact-map-frame--live">
          <div ref={mapRef} className="contact-map-leaflet" role="presentation" />
        </div>
      </div>
    </section>
  );
}
