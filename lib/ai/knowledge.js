/**
 * Live website knowledge for Ask AI — rebuilt from CMS whenever content changes.
 */

import {chatKnowledge} from '@/data/chat-knowledge';
import {AI_ASSISTANT_CONFIG} from '@/lib/ai/config';
import {readKnowledgeCache, writeKnowledgeCache} from '@/lib/ai/knowledge-cache';

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function doc({id, type, title, body, keywords, always = false}) {
  return {id, type, title, body, keywords, always};
}

async function buildFromCms() {
  const [
    {getPublicCompanyBundle, getPublicServices, getPublicProjects, getPublicSectors, getPublicOpenJobs, getPublicHomepage, getPublicPageCopy},
    {getCompanyProfileDocument},
  ] = await Promise.all([
    import('@/lib/cms/public-data'),
    import('@/lib/cms/content-service'),
  ]);

  const [bundle, services, projects, sectors, jobs, homepage, aboutCopy, contactCopy, profile] = await Promise.all([
    getPublicCompanyBundle(),
    getPublicServices(),
    getPublicProjects(),
    getPublicSectors(),
    getPublicOpenJobs(),
    getPublicHomepage(),
    getPublicPageCopy('about'),
    getPublicPageCopy('contact'),
    getCompanyProfileDocument(),
  ]);

  const {company, vision, mission, strengths, workLocations, standards, stats} = bundle;
  const publishedServices = (services || []).filter((item) => item.status !== 'draft');
  const publishedProjects = (projects || []).filter((item) => item.status !== 'draft').slice(0, 12);
  const publishedSectors = (sectors || []).filter((item) => item.status !== 'draft');

  const serviceDocs = publishedServices.map((service) =>
    doc({
      id: `service:${service.slug}`,
      type: 'service',
      title: {en: service.title, ar: service.titleAr || service.title},
      body: {
        en: `${service.description || ''} Capabilities: ${(service.capabilities || []).join('; ')}.`,
        ar: `${service.descriptionAr || service.description || ''} القدرات: ${(service.capabilitiesAr || service.capabilities || []).join('؛ ')}.`,
      },
      keywords: {
        en: [service.title, service.slug, ...(service.capabilities || [])].map(normalize),
        ar: [service.titleAr, ...(service.capabilitiesAr || [])].map(normalize),
      },
    }),
  );

  const homepageFaqs = (homepage?.faqs || []).map((faq, index) =>
    doc({
      id: `cms-faq:${faq.id || index}`,
      type: 'faq',
      title: {en: faq.questionEn || faq.id, ar: faq.questionAr || faq.questionEn || faq.id},
      body: {en: faq.answerEn || '', ar: faq.answerAr || faq.answerEn || ''},
      keywords: {
        en: normalize(faq.questionEn || '').split(' '),
        ar: normalize(faq.questionAr || '').split(' '),
      },
    }),
  );

  const about = homepage?.about || {};

  return [
    doc({
      always: true,
      id: 'company:about',
      type: 'about',
      title: {en: 'About ASAS', ar: 'عن أساس'},
      body: {
        en: `${about.bodyEn || company.description} ${company.parentGroup}. Founded ${company.year} in ${company.city}, ${company.country}. ${aboutCopy?.ledeEn || ''}`,
        ar: `${about.bodyAr || company.descriptionAr} ${company.parentGroupAr}. تأسست عام ${company.year} في ${company.cityAr}، ${company.countryAr}. ${aboutCopy?.ledeAr || ''}`,
      },
      keywords: {
        en: ['about', 'company', 'asas', 'founded', 'mir', 'history', 'who'],
        ar: ['عن', 'شركة', 'أساس', 'تأسست', 'مير', 'من نحن'],
      },
    }),
    doc({
      always: true,
      id: 'company:contact',
      type: 'contact',
      title: {en: 'Contact', ar: 'التواصل'},
      body: {
        en: `Email ${company.email}. Phone ${company.phone}. Mobile/WhatsApp +${company.whatsapp}. Fax ${company.fax}. Website ${company.website}. Address: ${company.address}. ${contactCopy?.ledeEn || ''}`,
        ar: `البريد ${company.email}. الهاتف ${company.phone}. الجوال/واتساب +${company.whatsapp}. الفاكس ${company.fax}. الموقع ${company.website}. العنوان: ${company.addressAr}. ${contactCopy?.ledeAr || ''}`,
      },
      keywords: {
        en: ['contact', 'email', 'phone', 'whatsapp', 'call', 'reach'],
        ar: ['تواصل', 'بريد', 'هاتف', 'واتساب', 'اتصال', 'رقم'],
      },
    }),
    doc({
      always: true,
      id: 'company:services-index',
      type: 'service',
      title: {en: 'Services', ar: 'الخدمات'},
      body: {
        en: `ASAS services: ${publishedServices.map((s) => s.title).join('; ')}.`,
        ar: `خدمات أساس: ${publishedServices.map((s) => s.titleAr || s.title).join('؛ ')}.`,
      },
      keywords: {
        en: ['service', 'services', 'what do you do', 'disciplines'],
        ar: ['خدمة', 'خدمات', 'ماذا تفعلون', 'تخصصات'],
      },
    }),
    doc({
      id: 'company:location',
      type: 'location',
      title: {en: 'Office location', ar: 'موقع المكتب'},
      body: {
        en: `ASAS office is in ${company.city}: ${company.address}.`,
        ar: `يقع مكتب أساس في ${company.cityAr}: ${company.addressAr}.`,
      },
      keywords: {
        en: ['where', 'office', 'address', 'location', 'map', 'visit', 'abu dhabi'],
        ar: ['أين', 'مكتب', 'عنوان', 'موقع', 'خريطة', 'أبوظبي', 'مصفح'],
      },
    }),
    doc({
      id: 'company:vision-mission',
      type: 'about',
      title: {en: 'Vision & mission', ar: 'الرؤية والرسالة'},
      body: {
        en: `Vision: ${vision?.en || ''} Mission: ${mission?.en || ''}`,
        ar: `الرؤية: ${vision?.ar || ''} الرسالة: ${mission?.ar || ''}`,
      },
      keywords: {
        en: ['vision', 'mission', 'values'],
        ar: ['رؤية', 'رسالة', 'قيم'],
      },
    }),
    doc({
      id: 'company:strengths',
      type: 'about',
      title: {en: 'Why ASAS', ar: 'لماذا أساس'},
      body: {
        en: (strengths || []).map((item) => `${item.title}: ${item.copy}`).join(' '),
        ar: (strengths || []).map((item) => `${item.titleAr}: ${item.copyAr}`).join(' '),
      },
      keywords: {
        en: ['why', 'strength', 'quality', 'choose'],
        ar: ['لماذا', 'جودة', 'قوة', 'ميزة'],
      },
    }),
    doc({
      id: 'company:locations-served',
      type: 'sectors',
      title: {en: 'Locations served', ar: 'مناطق العمل'},
      body: {
        en: `ASAS works across: ${(workLocations || []).map((l) => l.en).join(', ')}.`,
        ar: `تعمل أساس عبر: ${(workLocations || []).map((l) => l.ar).join('، ')}.`,
      },
      keywords: {
        en: ['dubai', 'sharjah', 'al ain', 'musaffah', 'locations'],
        ar: ['دبي', 'الشارقة', 'العين', 'مصفح', 'مناطق'],
      },
    }),
    doc({
      id: 'company:standards',
      type: 'standards',
      title: {en: 'Standards', ar: 'المعايير'},
      body: {
        en: (standards || []).map((s) => `${s.name} (${s.use})`).join('; '),
        ar: (standards || []).map((s) => `${s.nameAr} (${s.useAr})`).join('؛ '),
      },
      keywords: {
        en: ['standard', 'estidama', 'nfpa', 'code', 'compliance'],
        ar: ['معيار', 'استدامة', 'كود', 'امتثال'],
      },
    }),
    doc({
      id: 'company:stats',
      type: 'about',
      title: {en: 'Key figures', ar: 'أرقام رئيسية'},
      body: {
        en: (stats || []).map((s) => `${s.value} — ${s.label}`).join('; '),
        ar: (stats || []).map((s) => `${s.value} — ${s.labelAr}`).join('؛ '),
      },
      keywords: {
        en: ['founded', '2009', 'stats', 'figures'],
        ar: ['تأسست', '2009', 'أرقام'],
      },
    }),
    doc({
      id: 'company:sectors',
      type: 'sectors',
      title: {en: 'Sectors', ar: 'القطاعات'},
      body: {
        en: publishedSectors.map((s) => s.title || s.name).join('; '),
        ar: publishedSectors.map((s) => s.titleAr || s.title || s.name).join('؛ '),
      },
      keywords: {
        en: ['sector', 'sectors', 'towers', 'villas', 'industrial'],
        ar: ['قطاع', 'قطاعات', 'أبراج', 'فلل', 'صناعي'],
      },
    }),
    doc({
      id: 'company:projects',
      type: 'projects',
      title: {en: 'Selected projects', ar: 'مشاريع مختارة'},
      body: {
        en: publishedProjects.map((p) => p.title || p.name).join('; '),
        ar: publishedProjects.map((p) => p.titleAr || p.title || p.name).join('؛ '),
      },
      keywords: {
        en: ['project', 'projects', 'portfolio', 'work'],
        ar: ['مشروع', 'مشاريع', 'أعمال', 'محفظة'],
      },
    }),
    doc({
      id: 'company:jobs',
      type: 'careers',
      title: {en: 'Open roles', ar: 'الوظائف المتاحة'},
      body: {
        en: jobs?.length
          ? `Open roles: ${jobs.map((j) => j.title).join('; ')}.`
          : 'No open roles are currently listed. Career questions can go to the official email.',
        ar: jobs?.length
          ? `الوظائف المتاحة: ${jobs.map((j) => j.titleAr || j.title).join('؛ ')}.`
          : 'لا توجد وظائف معلنة حاليًا. يمكن إرسال أسئلة التوظيف إلى البريد الرسمي.',
      },
      keywords: {
        en: ['job', 'jobs', 'career', 'careers', 'hiring', 'vacancy'],
        ar: ['وظيفة', 'وظائف', 'توظيف', 'شواغر'],
      },
    }),
    doc({
      id: 'company:profile-file',
      type: 'download',
      title: {en: 'Company profile file', ar: 'ملف الشركة'},
      body: {
        en: `The current company profile download is ${profile?.titleEn || 'ASAS Company Profile'}.`,
        ar: `ملف الشركة الحالي للتحميل هو ${profile?.titleAr || profile?.titleEn || 'الملف التعريفي'}.`,
      },
      keywords: {
        en: ['company profile', 'pdf', 'download', 'brochure'],
        ar: ['ملف', 'تعريفي', 'تحميل', 'pdf'],
      },
    }),
    doc({
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
    }),
    ...serviceDocs,
    ...homepageFaqs,
    ...chatKnowledge.faqs.map((faq) =>
      doc({
        id: `faq:${faq.id}`,
        type: 'faq',
        title: {en: faq.id, ar: faq.id},
        body: faq.answer,
        keywords: faq.keywords,
      }),
    ),
  ];
}

export async function getWebsiteKnowledge() {
  const cached = readKnowledgeCache();
  if (cached) return cached;
  const docs = await buildFromCms();
  return writeKnowledgeCache(docs);
}

function searchDocs(docs, query, language = 'en', limit = 5) {
  const q = normalize(query);
  if (!q) return {hits: [], confidence: 0};

  const lang = language === 'ar' ? 'ar' : 'en';
  const scored = [];

  for (const item of docs) {
    const keys = item.keywords?.[lang] || [];
    let score = item.always ? 1 : 0;
    for (const key of keys) {
      const k = normalize(key);
      if (!k) continue;
      if (q.includes(k)) score += Math.max(2, Math.min(8, k.length));
      else if (k.length > 5 && k.includes(q)) score += 1;
    }
    const body = normalize(item.body?.[lang] || '');
    const title = normalize(item.title?.[lang] || '');
    for (const token of q.split(' ')) {
      if (token.length < 3) continue;
      if (body.includes(token)) score += 1;
      if (title.includes(token)) score += 2;
    }
    if (
      item.id === 'howto:start-project' &&
      /(price|pricing|cost|quote|budget|سعر|أسعار|تكلفة|عرض)/.test(q)
    ) {
      score += 12;
    }
    if (score > 0) scored.push({doc: item, score});
  }

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.slice(0, limit).map((item) => ({
    id: item.doc.id,
    type: item.doc.type,
    title: item.doc.title[lang],
    excerpt: item.doc.body[lang],
    score: item.score,
  }));

  const always = docs
    .filter((item) => item.always)
    .map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title[lang],
      excerpt: item.body[lang],
      score: 99,
    }));

  const merged = [...always];
  for (const hit of hits) {
    if (!merged.some((item) => item.id === hit.id)) merged.push(hit);
  }

  const top = hits[0]?.score || 0;
  const confidence = top >= 6 ? 0.9 : top >= 3 ? 0.65 : top > 0 ? 0.4 : 0.35;

  return {hits: merged, confidence};
}

export async function searchInternalKnowledge(query, language = 'en', limit = 5) {
  if (!AI_ASSISTANT_CONFIG.internalKnowledgeEnabled) {
    return {hits: [], confidence: 0};
  }
  const docs = await getWebsiteKnowledge();
  return searchDocs(docs, query, language, limit);
}

export function buildKnowledgeContext(hits, language = 'en') {
  if (!hits?.length) return '';
  const label = language === 'ar' ? 'معرفة حية من بيانات الموقع' : 'Live website knowledge from the CMS';
  return [
    `${label}:`,
    ...hits.map((hit, index) => `${index + 1}. [${hit.id}] ${hit.title}\n${hit.excerpt}`),
  ].join('\n\n');
}

export {getQuickActions} from '@/lib/ai/config';
export {invalidateAiKnowledge} from '@/lib/ai/knowledge-cache';

export function unavailableReply(language = 'en') {
  if (language === 'ar') {
    return 'المعلومة دي مش موجودة عندي ضمن بيانات الموقع حاليًا. لو تحب أقدر أساعدك تتواصل مع الفريق.';
  }
  return "I don't currently have verified website information for that. I can help you contact the team.";
}
