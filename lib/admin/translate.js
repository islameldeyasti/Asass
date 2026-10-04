import messages from './ar.json';
import {normalizeAdminLang} from './locale';

const folded = new Map(Object.entries(messages).map(([key, value]) => [key.toLowerCase(), value]));
const reverse = new Map(
  Object.entries(messages).map(([key, value]) => [String(value).replace(/\s+/g, ' ').trim(), key]),
);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(messages)
  .filter(([key]) => /\{\d+\}/.test(key))
  .map(([key, value]) => {
    const slots = [];
    let cursor = 0;
    let expression = '^';
    for (const match of key.matchAll(/\{(\d+)\}/g)) {
      expression += escape(key.slice(cursor, match.index)) + '(.+?)';
      slots.push(match[1]);
      cursor = match.index + match[0].length;
    }
    return {
      regex: new RegExp(expression + escape(key.slice(cursor)) + '$', 'i'),
      value,
      slots,
    };
  });

let runtimeLang = 'en';

export function setAdminLangRuntime(lang) {
  runtimeLang = normalizeAdminLang(lang);
}

export function getAdminLang() {
  return runtimeLang;
}

function isStoredContent(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  if (/^[\d.+%\-–—:,/\s]+$/.test(text)) return true;
  if (/@/.test(text) && /\./.test(text)) return true;
  if (/^https?:\/\//i.test(text) || text.startsWith('/') || text.startsWith('#')) return true;
  if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(text)) return true;
  if (/\.(pdf|png|jpe?g|webp|gif|svg|xlsx?|docx?|csv|zip)$/i.test(text)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return true;
  if (/^[A-Z0-9._-]+@[A-Z0-9.-]+$/i.test(text)) return true;
  return false;
}

function toEnglish(value) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text || isStoredContent(text)) return value;
  if (reverse.has(text)) {
    return (value.match(/^\s*/)?.[0] || '') + reverse.get(text) + (value.match(/\s*$/)?.[0] || '');
  }
  return value;
}

function toArabic(value) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text || isStoredContent(text)) return value;
  let translated = messages[text] || folded.get(text.toLowerCase());
  if (!translated) {
    const suffix = /^(.*?) \((AR|EN|Arabic|English)\)$/.exec(text);
    if (suffix) {
      const base = messages[suffix[1]] || folded.get(suffix[1].toLowerCase());
      if (base) {
        translated = `${base} (${['AR', 'Arabic'].includes(suffix[2]) ? 'العربية' : 'الإنجليزية'})`;
      }
    }
  }
  if (!translated && text.length <= 80) {
    for (const pattern of patterns) {
      const match = pattern.regex.exec(text);
      if (match) {
        translated = pattern.value.replace(/\{(\d+)\}/g, (_, slot) => match[pattern.slots.indexOf(slot) + 1]);
        break;
      }
    }
  }
  if (!translated) return value;
  return (value.match(/^\s*/)?.[0] || '') + translated + (value.match(/\s*$/)?.[0] || '');
}

/** UI chrome only. Never use for names, slugs, emails, file paths, or record values. */
export function adminText(value) {
  if (typeof value !== 'string') return value;
  const lang = getAdminLang();
  if (lang === 'en') {
    if (/[\u0600-\u06FF]/.test(value) && !/[A-Za-z]/.test(value)) return toEnglish(value);
    return value;
  }
  if (!/[A-Za-z]/.test(value)) return value;
  return toArabic(value);
}
