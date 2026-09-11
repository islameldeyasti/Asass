'use client';

import {useEffect, useRef, useState} from 'react';

export default function GalleryStickyNav({sections, ar, chromeOffset = 100}) {
  const [active, setActive] = useState(sections[0]?.id || '');
  const [stuck, setStuck] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      setStuck(nav.getBoundingClientRect().top <= chromeOffset + 2);

      const probe = chromeOffset + 120;
      let current = sections[0]?.id || '';
      for (const section of sections) {
        const el = document.getElementById(`gj-${section.id}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = section.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections, chromeOffset]);

  const go = (id) => {
    const el = document.getElementById(`gj-${id}`);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - chromeOffset - 56;
    window.scrollTo({top, behavior: 'smooth'});
  };

  if (!sections.length) return null;

  return (
    <nav
      ref={navRef}
      className={`gj-nav${stuck ? ' is-stuck' : ''}`}
      style={{top: chromeOffset}}
      aria-label={ar ? 'أقسام المعرض' : 'Gallery sections'}
    >
      <div className="gj-shell gj-nav-track">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`gj-nav-item${active === section.id ? ' is-on' : ''}`}
            onClick={() => go(section.id)}
          >
            {ar ? section.ar : section.en}
            <span>{section.count}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
