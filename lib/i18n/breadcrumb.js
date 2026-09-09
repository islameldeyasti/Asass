/**
 * Breadcrumb helpers — brand label localizes; path segments use Arabic labels.
 * Arabic never uses the short name alone — always the full legal name.
 */

import {company} from '@/data/company';

export function brandCrumb(locale) {
  return locale === 'ar' ? company.nameAr : company.shortName;
}

/** @param {'en'|'ar'} locale @param {string[]} parts already-localized segment labels */
export function breadcrumb(locale, parts = []) {
  return [brandCrumb(locale), ...parts].join(' / ');
}
