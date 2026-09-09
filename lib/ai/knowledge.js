/**
 * Website knowledge layer — structured, replaceable by CMS / DB / RAG later.
 * Facts are sourced from existing site data modules only.
 */

import {company, mission, vision, strengths, workLocations, standards, stats} from '@/data/company';
import {services} from '@/data/services';
import {chatKnowledge} from '@/data/chat-knowledge';
import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build a flat verified knowledge corpus for retrieval + LLM grounding. */
export function getWebsiteKnowledge() {
  const serviceDocs = services.map((service) => ({
    id: `service:${service.slug}`,
    type: 'service',
    title: {en: service.title, ar: service.titleAr},
    body: {
      en: `${service.description} Capabilities: ${(service.capabilities || []).join('; ')}.`,
      ar: `${service.descriptionAr} القدرات: ${(service.capabilitiesAr || []).join('؛ ')}.`,
    },
    keywords: {
      en: [service.title, service.slug, ...(service.capabilities || [])].map(normalize),
      ar: [service.titleAr, ...(service.capabilitiesAr || [])].map(normalize),
    },
  }));

  const docs = [
    {
      id: 'company:about',
      type: 'about',
      title: {en: 'About ASAS', ar: 'عن أساس'},
      body: {
        en: `${company.description} ${company.parentGroup}. Founded ${company.year} in ${company.city}, ${company.country}.`,
        ar: `${company.descriptionAr} ${company.parentGroupAr}. تأسست عام ${company.year} في ${company.cityAr}، ${company.countryAr}.`,
      },
      keywords: {
        en: ['about', 'company', 'asas', 'founded', 'mir', 'history', 'who'],
        ar: ['عن', 'شركة', 'أساس', 'تأسست', 'مير', 'من نحن'],
      },
    },
    {
      id: 'company:contact',
      type: 'contact',
      title: {en: 'Contact', ar: 'التواصل'},
      body: {
        en: `Email ${company.email}. Phone ${company.phone}. Mobile/WhatsApp +${company.whatsapp}. Fax ${company.fax}. Website ${company.website}. Address: ${company.address}.`,
        ar: `البريد ${company.email}. الهاتف ${company.phone}. الجوال/واتساب +${company.whatsapp}. الفاكس ${company.fax}. الموقع ${company.website}. العنوان: ${company.addressAr}.`,
      },
      keywords: {
        en: ['contact', 'email', 'phone', 'whatsapp', 'call', 'reach'],
        ar: ['تواصل', 'بريد', 'هاتف', 'واتساب', 'اتصال', 'رقم'],
      },
    },
    {
      id: 'company:location',
      type: 'location',
      title: {en: 'Office location', ar: 'موقع المكتب'},
      body: {
        en: `ASAS office is in Abu Dhabi: ${company.address}.`,
        ar: `يقع مكتب أساس في أبوظبي: ${company.addressAr}.`,
      },
      keywords: {
        en: ['where', 'office', 'address', 'location', 'map', 'visit', 'abu dhabi'],
        ar: ['أين', 'مكتب', 'عنوان', 'موقع', 'خريطة', 'أبوظبي', 'مصفح'],
      },
    },
    {
      id: 'company:vision-mission',
      type: 'about',
      title: {en: 'Vision & mission', ar: 'الرؤية والرسالة'},
      body: {
        en: `Vision: ${vision.en} Mission: ${mission.en}`,
        ar: `الرؤية: ${vision.ar} الرسالة: ${mission.ar}`,
      },
      keywords: {
        en: ['vision', 'mission', 'values'],
        ar: ['رؤية', 'رسالة', 'قيم'],
      },
    },
    {
      id: 'company:strengths',
      type: 'about',
      title: {en: 'Why ASAS', ar: 'لماذا أساس'},
      body: {
        en: strengths.map((item) => `${item.title}: ${item.copy}`).join(' '),
        ar: strengths.map((item) => `${item.titleAr}: ${item.copyAr}`).join(' '),
      },
      keywords: {
        en: ['why', 'strength', 'quality', 'choose'],
        ar: ['لماذا', 'جودة', 'قوة', 'ميزة'],
      },
    },
    {
      id: 'company:locations-served',
      type: 'sectors',
      title: {en: 'Locations served', ar: 'مناطق العمل'},
      body: {
        en: `ASAS works across: ${workLocations.map((l) => l.en).join(', ')}.`,
        ar: `تعمل أساس عبر: ${workLocations.map((l) => l.ar).join('، ')}.`,
      },
      keywords: {
        en: ['dubai', 'sharjah', 'al ain', 'musaffah', 'locations'],
        ar: ['دبي', 'الشارقة', 'العين', 'مصفح', 'مناطق'],
      },
    },
    {
      id: 'company:standards',
      type: 'standards',
      title: {en: 'Standards', ar: 'المعايير'},
      body: {
        en: standards.map((s) => `${s.name} (${s.use})`).join('; '),
        ar: standards.map((s) => `${s.nameAr} (${s.useAr})`).join('؛ '),
      },
      keywords: {
        en: ['standard', 'estidama', 'nfpa', 'code', 'compliance'],
        ar: ['معيار', 'استدامة', 'كود', 'امتثال'],
      },
    },
    {
      id: 'company:stats',
      type: 'about',
      title: {en: 'Key figures', ar: 'أرقام رئيسية'},
      body: {
        en: stats.map((s) => `${s.value} — ${s.label}`).join('; '),
        ar: stats.map((s) => `${s.value} — ${s.labelAr}`).join('؛ '),
      },
      keywords: {
        en: ['founded', '2009', 'stats', 'figures'],
        ar: ['تأسست', '2009', 'أرقام'],
      },
    },
    {
      id: 'howto:start-project',
      type: 'enquiry',
      title: {en: 'Start a project', ar: 'بدء مشروع'},
      body: {
        en: 'To start a project, use Project Enquiry on this website, or contact the Abu Dhabi office by email or WhatsApp. The team reviews capacity and guides the next step. Specific prices are not published on the website.',
        ar: 'لبدء مشروع استخدم صفحة استفسار المشروع في الموقع، أو تواصل مع مكتب أبوظبي بالبريد أو واتساب. يراجع الفريق السعة ويرشدك للخطوة التالية. الأسعار التفصيلية غير منشورة على الموقع.',
      },
      keywords: {
        en: ['start', 'project', 'price', 'pricing', 'quote', 'cost', 'hire', 'enquiry'],
        ar: ['ابدأ', 'مشروع', 'سعر', 'أسعار', 'عرض', 'تكلفة', 'استفسار'],
      },
    },
    ...serviceDocs,
    ...chatKnowledge.faqs.map((faq) => ({
      id: `faq:${faq.id}`,
      type: 'faq',
      title: {en: faq.id, ar: faq.id},
      body: faq.answer,
      keywords: faq.keywords,
    })),
  ];

  return docs;
}

export function searchInternalKnowledge(query, language = 'en', limit = 5) {
  if (!AI_ASSISTANT_CONFIG.internalKnowledgeEnabled) {
    return {hits: [], confidence: 0};
  }

  const q = normalize(query);
  if (!q) return {hits: [], confidence: 0};

  const lang = language === 'ar' ? 'ar' : 'en';
  const scored = [];

  for (const doc of getWebsiteKnowledge()) {
    const keys = doc.keywords?.[lang] || [];
    let score = 0;
    for (const key of keys) {
      const k = normalize(key);
      if (!k) continue;
      if (q.includes(k)) score += Math.max(2, Math.min(8, k.length));
      else if (k.length > 5 && k.includes(q)) score += 1;
    }
    const body = normalize(doc.body?.[lang] || '');
    const title = normalize(doc.title?.[lang] || '');
    for (const token of q.split(' ')) {
      if (token.length < 3) continue;
      if (body.includes(token)) score += 1;
      if (title.includes(token)) score += 2;
    }
    // Prefer enquiry/pricing doc when cost language is present
    if (
      doc.id === 'howto:start-project' &&
      /(price|pricing|cost|quote|budget|سعر|أسعار|تكلفة|عرض)/.test(q)
    ) {
      score += 12;
    }
    if (score > 0) scored.push({doc, score});
  }

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.slice(0, limit).map((item) => ({
    id: item.doc.id,
    type: item.doc.type,
    title: item.doc.title[lang],
    excerpt: item.doc.body[lang],
    score: item.score,
  }));

  const top = hits[0]?.score || 0;
  const confidence = top >= 6 ? 0.9 : top >= 3 ? 0.65 : top > 0 ? 0.4 : 0;

  return {hits, confidence};
}

export function buildKnowledgeContext(hits, language = 'en') {
  if (!hits?.length) return '';
  const label = language === 'ar' ? 'معرفة موثقة من الموقع' : 'Verified website knowledge';
  return [
    `${label}:`,
    ...hits.map(
      (hit, index) =>
        `${index + 1}. [${hit.id}] ${hit.title}\n${hit.excerpt}`,
    ),
  ].join('\n\n');
}

export {getQuickActions} from '@/lib/ai/config';

export function unavailableReply(language = 'en') {
  if (language === 'ar') {
    return 'المعلومة دي مش موجودة عندي ضمن بيانات الموقع حاليًا. لو تحب أقدر أساعدك تتواصل مع الفريق.';
  }
  return "I don't currently have verified website information for that. I can help you contact the team.";
}
