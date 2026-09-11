'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import GalleryIntro from '@/components/gallery/GalleryIntro';
import GalleryStickyNav from '@/components/gallery/GalleryStickyNav';
import FeaturedShowcase from '@/components/gallery/FeaturedShowcase';
import JournalSection from '@/components/gallery/JournalSection';
import ProjectsInFocus from '@/components/gallery/ProjectsInFocus';
import GalleryViewer from '@/components/gallery/GalleryViewer';
import GalleryCTA from '@/components/gallery/GalleryCTA';
import {buildJournalCatalog, buildJournalNarrative} from '@/lib/gallery/journal';

export default function GalleryExperience({locale}) {
  const ar = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const [chrome, setChrome] = useState(100);

  const catalog = useMemo(() => buildJournalCatalog(locale), [locale]);
  const narrative = useMemo(() => buildJournalNarrative(catalog), [catalog]);

  useEffect(() => {
    const measure = () => {
      const root = getComputedStyle(document.documentElement);
      const h =
        Number.parseFloat(root.getPropertyValue('--asas-chrome-h')) ||
        Number.parseFloat(root.getPropertyValue('--ph-chrome')) ||
        100;
      setChrome(h);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const openAt = useCallback(
    (id) => {
      const index = catalog.findIndex((item) => item.id === id);
      if (index >= 0) setActive(index);
    },
    [catalog],
  );
  const close = useCallback(() => setActive(null), []);
  const shift = useCallback(
    (dir) => {
      setActive((cur) => {
        if (cur == null || !catalog.length) return cur;
        return (cur + dir + catalog.length) % catalog.length;
      });
    },
    [catalog.length],
  );

  return (
    <div className="gj">
      <GalleryIntro ar={ar} reduceMotion={reduceMotion} />
      <GalleryStickyNav sections={narrative.sections} ar={ar} chromeOffset={chrome} />

      <FeaturedShowcase
        items={narrative.featured}
        ar={ar}
        reduceMotion={reduceMotion}
        onOpen={openAt}
      />

      <JournalSection
        id="architecture"
        kicker={ar ? 'عمارة' : 'Architecture'}
        title={ar ? 'مباني وفراغات شكّلتها أساس' : 'Buildings and spaces shaped by ASAS'}
        description={
          ar
            ? 'أرشيف بصري للعمارة عبر مشاريع أساس — ليس بديلاً عن صفحة المشاريع.'
            : 'A visual archive of architecture across ASAS projects — not a substitute for the Projects page.'
        }
        items={narrative.architecture}
        ar={ar}
        reduceMotion={reduceMotion}
        onOpen={openAt}
      />

      <JournalSection
        id="interiors"
        kicker={ar ? 'تصميم داخلي' : 'Interiors'}
        title={ar ? 'تفاصيل الفراغات الداخلية' : 'Interior spaces and detail'}
        description={
          ar
            ? 'لحظات من التصميم الداخلي والضيافة والفراغات السكنية.'
            : 'Moments from interior design, hospitality and residential spaces.'
        }
        items={narrative.interiors}
        ar={ar}
        reduceMotion={reduceMotion}
        onOpen={openAt}
      />

      <ProjectsInFocus
        items={narrative.focus}
        locale={locale}
        ar={ar}
        reduceMotion={reduceMotion}
        onOpen={openAt}
      />

      <GalleryCTA locale={locale} ar={ar} />

      <GalleryViewer
        items={catalog}
        active={active}
        ar={ar}
        reduceMotion={reduceMotion}
        onClose={close}
        onShift={shift}
      />
    </div>
  );
}
