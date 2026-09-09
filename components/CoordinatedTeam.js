'use client';

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {Building2, ClipboardCheck, HardHat, Layers3} from 'lucide-react';
import {generatedEditorialImages} from '@/data/image-manifest';
import {ActionButton} from '@/components/ActionButton';

const capabilityIcons = [Building2, Layers3, ClipboardCheck, HardHat];

export default function CoordinatedTeam({locale, eyebrow, title, copy}) {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const ar = locale === 'ar';
  const capabilities = ar
    ? [['العمارة', 'خدمات معمارية لمشاريع القطاعين العام والخاص.'], ['الإنشاءات', 'تصميم يراعي التربة والأحمال والتخصصات والتكلفة.'], ['MEP', 'تصميم كهربائي وميكانيكي وصحي وإشراف موقعي.'], ['حصر الكميات', 'مواصفات وجداول كميات وشروط عقود ومراجعة تكلفة.']]
    : [['Architecture', 'Architectural services for public- and private-sector projects.'], ['Structural', 'Design coordinated with soil, loads, disciplines and cost.'], ['MEP', 'Electrical, mechanical and plumbing design and site supervision.'], ['Quantity surveying', 'Specifications, bills of quantities, contract terms and cost review.']];

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, {threshold: 0.18});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={sectionRef} className={`team-overview ${revealed ? 'is-revealed' : ''}`}>
    <div className="home-shell team-overview-grid">
      <div className="team-visual reveal-item">
        <Image src={generatedEditorialImages.corporateTeam} alt="" width={1280} height={960}/>
        <span className="team-visual-tag">ASAS · UAE</span>
      </div>
      <div className="team-overview-copy">
        <p className="atlas-kicker reveal-item">{eyebrow}</p>
        <h2 className="reveal-item">{title}</h2>
        <p className="team-intro reveal-item">{copy}</p>
        <div className="team-capabilities">{capabilities.map(([name, description], index) => {
          const Icon = capabilityIcons[index];
          return <article className="reveal-item" key={name}><Icon/><div><h3>{name}</h3><p>{description}</p></div></article>;
        })}</div>
        <ActionButton variant="outline" className="team-overview-link reveal-item" href={`/${locale}/services`}>
          {ar ? 'استكشف خدماتنا' : 'Explore services'}
        </ActionButton>
      </div>
    </div>
  </section>;
}
