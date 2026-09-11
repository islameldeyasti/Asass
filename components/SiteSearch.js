'use client';

import Link from 'next/link';
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowUpRight, Building2, Briefcase, Layers, Newspaper, Search, Users, X} from 'lucide-react';
import {hrefForResult, searchSite, typeLabel} from '@/lib/search/site-index';
import {t} from '@/lib/i18n/ui';

const EASE = [0.16, 1, 0.3, 1];

const QUICK_LINKS = [
  {path: 'projects', en: 'Projects', ar: 'المشاريع', Icon: Building2},
  {path: 'services', en: 'Services', ar: 'الخدمات', Icon: Briefcase},
  {path: 'sectors', en: 'Sectors', ar: 'القطاعات', Icon: Layers},
  {path: 'blog', en: 'Blog', ar: 'المدونة', Icon: Newspaper},
  {path: 'careers', en: 'Careers', ar: 'الوظائف', Icon: Users},
  {path: 'contact', en: 'Contact', ar: 'تواصل', Icon: Search},
];

const POPULAR = [
  {en: 'Architecture', ar: 'عمارة'},
  {en: 'Villa', ar: 'فيلا'},
  {en: 'MEP', ar: 'كهروميكانيك'},
  {en: 'Towers', ar: 'أبراج'},
  {en: 'Interior', ar: 'تصميم داخلي'},
  {en: 'Careers', ar: 'وظائف'},
];

export default function SiteSearch({locale, open, onOpenChange}) {
  const ar = locale === 'ar';
  const inputRef = useRef(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? searchSite(trimmed, {limit: 12}) : []), [trimmed]);

  const close = useCallback(() => {
    onOpenChange?.(false);
    setQuery('');
    setActive(0);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;
    const tId = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    document.body.classList.add('asas-search-lock');
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(tId);
      document.body.classList.remove('asas-search-lock');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const applySuggestion = (value) => {
    setQuery(value);
    setActive(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKeyDown = (event) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      const hit = results[active];
      if (!hit) return;
      event.preventDefault();
      close();
      window.location.assign(hrefForResult(hit.item, locale));
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="asas-search"
          role="dialog"
          aria-modal="true"
          aria-label={t('searchSite', locale)}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.18}}
        >
          <button type="button" className="asas-search-backdrop" aria-label={t('close', locale)} onClick={close} />

          <motion.div
            className="asas-search-panel"
            initial={{opacity: 0, y: -16, scale: 0.985}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -10, scale: 0.985}}
            transition={{duration: 0.26, ease: EASE}}
          >
            <div className="asas-search-head">
              <div>
                <p className="asas-search-kicker">{t('searchSite', locale)}</p>
                <p className="asas-search-esc">{t('searchEsc', locale)}</p>
              </div>
              <button type="button" className="asas-search-close" onClick={close} aria-label={t('close', locale)}>
                <X size={18} />
              </button>
            </div>

            <div className="asas-search-bar">
              <span className="asas-search-icon" aria-hidden="true">
                <Search size={18} />
              </span>
              <input
                ref={inputRef}
                type="search"
                className="asas-search-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={t('searchPlaceholder', locale)}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {trimmed ? (
                <button
                  type="button"
                  className="asas-search-clear"
                  onClick={() => {
                    setQuery('');
                    setActive(0);
                    inputRef.current?.focus();
                  }}
                  aria-label={t('close', locale)}
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <div className="asas-search-body" id={listId} role="listbox">
              {!trimmed ? (
                <div className="asas-search-idle">
                  <p className="asas-search-hint">{t('searchHint', locale)}</p>

                  <div className="asas-search-block">
                    <p className="asas-search-label">{t('searchPopular', locale)}</p>
                    <div className="asas-search-chips">
                      {POPULAR.map((chip) => {
                        const label = ar ? chip.ar : chip.en;
                        return (
                          <button
                            key={chip.en}
                            type="button"
                            className="asas-search-chip"
                            onClick={() => applySuggestion(label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="asas-search-block">
                    <p className="asas-search-label">{t('searchQuick', locale)}</p>
                    <div className="asas-search-quick">
                      {QUICK_LINKS.map(({path, en, ar: arLabel, Icon}) => (
                        <Link
                          key={path}
                          href={`/${locale}/${path}`}
                          className="asas-search-quick-link"
                          onClick={close}
                        >
                          <Icon size={16} aria-hidden="true" />
                          <span>{ar ? arLabel : en}</span>
                          <ArrowUpRight size={14} className={ar ? 'reverse-arrow' : ''} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="asas-search-empty-wrap">
                  <p className="asas-search-empty">{t('searchEmpty', locale)}</p>
                  <div className="asas-search-chips">
                    {POPULAR.slice(0, 4).map((chip) => {
                      const label = ar ? chip.ar : chip.en;
                      return (
                        <button
                          key={chip.en}
                          type="button"
                          className="asas-search-chip"
                          onClick={() => applySuggestion(label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <p className="asas-search-count">
                    {results.length} {t('searchResults', locale)}
                  </p>
                  <ul className="asas-search-list">
                    {results.map(({item}, index) => {
                      const href = hrefForResult(item, locale);
                      const title = ar ? item.titleAr || item.title : item.title;
                      const excerpt = ar ? item.excerptAr || item.excerpt : item.excerpt;
                      return (
                        <li key={item.id}>
                          <Link
                            href={href}
                            className={`asas-search-hit${index === active ? ' is-active' : ''}`}
                            role="option"
                            aria-selected={index === active}
                            onMouseEnter={() => setActive(index)}
                            onClick={close}
                          >
                            <span className="asas-search-hit-type">{typeLabel(item.type, locale)}</span>
                            <span className="asas-search-hit-copy">
                              <strong>{title}</strong>
                              {excerpt ? <em>{excerpt}</em> : null}
                            </span>
                            <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} aria-hidden="true" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
