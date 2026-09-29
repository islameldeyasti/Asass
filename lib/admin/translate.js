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

let runtimeLang = 'ar';

export function setAdminLangRuntime(lang) {
  runtimeLang = normalizeAdminLang(lang);
}

export function getAdminLang() {
  return runtimeLang;
}

function toEnglish(value) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return value;
  if (reverse.has(text)) {
    return (value.match(/^\s*/)?.[0] || '') + reverse.get(text) + (value.match(/\s*$/)?.[0] || '');
  }
  return value;
}

function toArabic(value) {
  const text = value.replace(/\s+/g, ' ').trim();
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
  if (!translated) {
    for (const pattern of patterns) {
      const match = pattern.regex.exec(text);
      if (match) {
        translated = pattern.value.replace(/\{(\d+)\}/g, (_, slot) =>
          adminText(match[pattern.slots.indexOf(slot) + 1]),
        );
        break;
      }
    }
  }
  if (!translated) return value;
  return (value.match(/^\s*/)?.[0] || '') + translated + (value.match(/\s*$/)?.[0] || '');
}

/** Presentation only. Never use translated labels as storage keys or form values. */
export function adminText(value) {
  if (typeof value !== 'string') return value;
  const lang = getAdminLang();
  if (lang === 'en') {
    if (!/[A-Za-z]/.test(value) && /[\u0600-\u06FF]/.test(value)) return toEnglish(value);
    return value;
  }
  if (!/[A-Za-z]/.test(value)) return value;
  return toArabic(value);
}
