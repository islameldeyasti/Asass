'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {animate, useReducedMotion} from 'motion/react';

const STAGGER_SELECTORS = [
  '.hp-why-grid',
  '.hp-portfolio-grid',
  '.discipline-grid',
  '.reason-grid',
  '.svc-grid',
  '.svc-featured-grid',
  '.services-featured-pair',
  '.services-card-grid',
  '.services-group-grid',
  '.services-grid',
  '.proj-grid',
  '.projects-grid',
  '.proj-filter-pills',
  '.projects-filter',
  '.projects-filter-rail',
  '.atlas-projects',
  '.atlas-resource-grid',
  '.interface-grid',
  '.sector-stack',
  '.work-grid',
  '.service-grid',
  '.hp-faq-list',
  '.wf-process-list',
  '.wf-process-steps',
  '.route-map',
  '.projects-hero-collage',
  '.sectors-card-grid',
  '.downloads-contents-grid',
  '.downloads-related-grid',
  '.careers-discipline-grid',
  '.careers-grid',
  '.enquiry-steps',
];

const SECTION_SELECTORS = [
  'main section',
  'main .page-hero',
  'main .services-bridge',
  'footer',
];

const HEADING_SELECTORS = [
  'main h1',
  'main h2',
];

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function markStagger(root) {
  STAGGER_SELECTORS.forEach((sel) => {
    root.querySelectorAll(sel).forEach((group) => {
      group.classList.add('asas-stagger');
      [...group.children].forEach((child, i) => {
        child.style.setProperty('--stagger-index', String(Math.min(i, 10)));
      });
    });
  });
}

function markHeadings(root) {
  HEADING_SELECTORS.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => {
      if (el.closest('.asas-hero-slider, .asas-ph, .asas-chrome, .asas-sectors, .pd, .pl, .sv, .sd, .sc, .cp, .pf')) return;
      el.classList.add('asas-heading');
    });
  });
}

function markImages(root) {
  root.querySelectorAll('main img').forEach((img) => {
    if (img.closest('.asas-hero-slider, .asas-ph, .asas-chrome, .asas-sectors, .pd, .pl, .sv, .sd, .sc, .cp, .pf')) return;
    img.classList.add('asas-img');
  });
}

function markSections(root) {
  SECTION_SELECTORS.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => {
      if (
        el.classList?.contains('asas-sectors') ||
        el.classList?.contains('asas-ph') ||
        el.classList?.contains('pd') ||
        el.classList?.contains('pl') ||
        el.classList?.contains('sv') ||
        el.classList?.contains('sd') ||
        el.classList?.contains('sc') ||
        el.classList?.contains('cp') ||
        el.closest('.asas-sectors, .pd, .pl, .sv, .sd, .sc, .cp, .pf')
      ) {
        return;
      }
      el.classList.add('asas-reveal');
    });
  });
}

function inViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
}

export default function SiteMotion({locale}) {
  const pathname = usePathname();
  const reducedHook = useReducedMotion();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';

    const reduced = reducedHook || prefersReduced();
    if (reduced) {
      html.classList.add('asas-reduced-motion');
      html.classList.remove('asas-motion');
      return () => html.classList.remove('asas-reduced-motion');
    }

    html.classList.remove('asas-reduced-motion');

    const observed = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        });
      },
      {threshold: 0.08, rootMargin: '0px 0px -4% 0px'},
    );

    const watch = (el) => {
      if (!el || observed.has(el)) return;
      observed.add(el);
      if (inViewport(el)) {
        el.classList.add('is-inview');
        return;
      }
      observer.observe(el);
    };

    const scan = () => {
      markSections(document);
      markStagger(document);
      markHeadings(document);
      markImages(document);

      document.querySelectorAll('.asas-reveal, .asas-stagger, .asas-heading, .asas-img').forEach(watch);
    };

    scan();
    // Enable motion only after first pass marks above-fold elements.
    html.classList.add('asas-motion');
    // Second pass after layout/fonts settle (catches hero remounts & late layout).
    const raf = requestAnimationFrame(() => {
      scan();
      document.querySelectorAll('.asas-heading').forEach((el) => {
        if (inViewport(el)) el.classList.add('is-inview');
      });
    });

    const mutator = new MutationObserver(() => {
      markHeadings(document);
      document.querySelectorAll('.asas-heading:not(.is-inview)').forEach(watch);
      document.querySelectorAll('main img:not(.asas-img)').forEach((img) => {
        if (img.closest('.asas-hero-slider, .asas-ph, .asas-chrome, .asas-sectors')) return;
        img.classList.add('asas-img');
        watch(img);
      });
    });
    const main = document.querySelector('main');
    if (main) mutator.observe(main, {childList: true, subtree: true});

    const stats = [...document.querySelectorAll('.stat strong')];
    let statsObserver;
    if (stats.length) {
      statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const node = entry.target;
            const original = node.textContent.trim();
            if (/^\d+\+?$/.test(original)) {
              const value = Number(original.replace('+', ''));
              if (value && value !== 2009) {
                animate(0, value, {
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  onUpdate: (v) => {
                    node.textContent = `${Math.round(v).toLocaleString()}${original.endsWith('+') ? '+' : ''}`;
                  },
                });
              }
            }
            statsObserver.unobserve(node);
          });
        },
        {threshold: 0.55},
      );
      stats.forEach((s) => statsObserver.observe(s));
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      statsObserver?.disconnect();
      mutator.disconnect();
      html.classList.remove('asas-motion');
    };
  }, [locale, pathname, reducedHook]);

  return null;
}
