/**
 * Per-project Design Approach copy.
 * Uses project.approach / approachAr when set; otherwise builds unique copy
 * from category, location, title and services.
 */

const CATEGORY_APPROACH = {
  towers: {
    en: (ctx) =>
      `For ${ctx.title} in ${ctx.location}, the approach prioritises coordinated tower packages — structure, cores, façades and MEP risers resolved early so vertical delivery stays clear from podium to crown.`,
    ar: (ctx) =>
      `في مشروع ${ctx.title} بـ${ctx.location}، نعتمد حزماً منسّقة للأبراج — الهيكل والنواة والواجهات ومسارات MEP — تُحسم مبكراً ليبقى التسليم الرأسي واضحاً من المنصة إلى القمة.`,
  },
  buildings: {
    en: (ctx) =>
      `The design approach for ${ctx.title} (${ctx.location}) focuses on efficient floor plates, clear vertical circulation and electromechanical rooms that stay buildable through tender and construction.`,
    ar: (ctx) =>
      `منهجية تصميم ${ctx.title} (${ctx.location}) تركز على بلاطات فعّالة، ودوران رأسي واضح، وغرف كهروميكانيكية قابلة للتنفيذ عبر العطاء والتنفيذ.`,
  },
  industrial: {
    en: (ctx) =>
      `At ${ctx.title} in ${ctx.location}, we treat span, loading, access and services as one industrial system — so production flow and maintenance routes remain practical on site.`,
    ar: (ctx) =>
      `في ${ctx.title} بـ${ctx.location}، نتعامل مع البحور والأحمال والمداخل والخدمات كنظام صناعي واحد — لتبقى مسارات الإنتاج والصيانة عملية في الموقع.`,
  },
  infrastructure: {
    en: (ctx) =>
      `For ${ctx.title} around ${ctx.location}, the approach is evidence-led planning: movement, access and capacity studied together so recommendations stay grounded in how the place actually works.`,
    ar: (ctx) =>
      `في ${ctx.title} حول ${ctx.location}، المنهجية تخطيطية مبنية على الأدلة: الحركة والمداخل والطاقة الاستيعابية تُدرس معاً لتبقى التوصيات متصلة بواقع المكان.`,
  },
  education: {
    en: (ctx) =>
      `The approach on ${ctx.title} (${ctx.location}) balances learning environments with durable structure and MEP — circulation, daylight and operational backing spaces designed as one campus package.`,
    ar: (ctx) =>
      `في ${ctx.title} (${ctx.location}) نوازن بيئات التعلم مع هيكل ومتانة MEP — الحركة والإضاءة الطبيعية وفضاءات التشغيل كحزمة حرم واحدةحدة.`,
  },
  'compound-villas': {
    en: (ctx) =>
      `For the ${ctx.title} compound work in ${ctx.location}, we coordinate villa typologies, shared infrastructure and site services so each unit stays consistent without losing buildability.`,
    ar: (ctx) =>
      `في أعمال مجمع ${ctx.title} بـ${ctx.location}، ننسّق أنماط الفلل والبنية المشتركة وخدمات الموقع لتبقى الوحدات متسقة وقابلة للتنفيذ.`,
  },
  'private-villas': {
    en: (ctx) =>
      `The design approach for ${ctx.title} in ${ctx.location} is villa-specific: massing, privacy, structure and services resolved as a single residential brief from concept through detailed packages.`,
    ar: (ctx) =>
      `منهجية تصميم ${ctx.title} في ${ctx.location} خاصة بالفيلا: الكتلة والخصوصية والهيكل والخدمات كملخص سكني واحد من الفكرة إلى الحزم التفصيلية.`,
  },
  'residential-villas': {
    en: (ctx) =>
      `On ${ctx.title} at ${ctx.location}, we align architecture, structure and MEP around daily living — clear zoning, durable detailing and services that stay discrete yet accessible.`,
    ar: (ctx) =>
      `في ${ctx.title} بـ${ctx.location}، نواءم العمارة والهيكل وMEP مع نمط المعيشة اليومي — تقسيم واضح وتفاصيل متينة وخدمات خفية وسهلة الوصول.`,
  },
  'interior-design': {
    en: (ctx) =>
      `For ${ctx.title}, the interior approach ties finishes, lighting and furniture to the engineering envelope — so atmosphere and buildability move together through fit-out.`,
    ar: (ctx) =>
      `في ${ctx.title}، تربط منهجية التصميم الداخلي التشطيبات والإضاءة والأثاث بالغلاف الهندسي — لتتحرك الأجواء وقابلية التنفيذ معاً عبر التجهيز.`,
  },
};

const DEFAULT_APPROACH = {
  en: (ctx) =>
    `The design approach for ${ctx.title}${ctx.location ? ` in ${ctx.location}` : ''} keeps architecture, structure and electromechanical work coordinated from concept through construction support.`,
  ar: (ctx) =>
    `منهجية تصميم ${ctx.title}${ctx.location ? ` في ${ctx.location}` : ''} تحافظ على تنسيق العمارة والهيكل والأعمال الكهروميكانيكية من الفكرة حتى دعم التنفيذ.`,
};

const SUPPORT_BY_KIND = {
  built: {
    en: 'Built delivery is protected by cross-discipline checking before issue, and site-ready packages that retain design intent.',
    ar: 'يُحمى التسليم المنفَّذ بمراجعة بين التخصصات قبل الإصدار، وحزم جاهزة للموقع تحافظ على قصد التصميم.',
  },
  study: {
    en: 'Planning recommendations stay tied to measurable site conditions, capacity and access — not abstract diagrams alone.',
    ar: 'تبقى توصيات التخطيط مرتبطة بظروف الموقع والطاقة والمداخل القابلة للقياس — لا بالمخططات المجردة وحدها.',
  },
  interior: {
    en: 'Fit-out decisions are tested against structure, services and construction sequencing so interiors remain deliverable.',
    ar: 'تُختبر قرارات التجهيز مقابل الهيكل والخدمات وتسلسل التنفيذ لتبقى الفراغات الداخلية قابلة للتسليم.',
  },
};

function pick(obj, key, fallback) {
  return obj?.[key] || fallback;
}

/**
 * @param {object} project
 * @param {'en'|'ar'} locale
 * @returns {{lead: string, support: string}}
 */
export function resolveProjectApproach(project, locale = 'en') {
  const ar = locale === 'ar';
  const customLead = String(ar ? project?.approachAr || project?.approach : project?.approach || '').trim();
  const customSupport = String(
    ar ? project?.approachSupportAr || project?.approachSupport : project?.approachSupport || '',
  ).trim();

  if (customLead) {
    return {lead: customLead, support: customSupport};
  }

  const title = ar
    ? project?.titleAr || project?.title || 'هذا المشروع'
    : project?.title || project?.titleAr || 'this project';
  const location = ar
    ? project?.locationAr || project?.locationShortAr || project?.location || project?.locationShort || ''
    : project?.location || project?.locationShort || project?.locationAr || '';
  const category = project?.category || '';
  const kind = project?.kind || 'built';
  const services = Array.isArray(project?.services) ? project.services.filter(Boolean) : [];
  const ctx = {title, location: location || (ar ? 'موقع المشروع' : 'the project location')};

  const writer = pick(CATEGORY_APPROACH, category, DEFAULT_APPROACH);
  const lead = (ar ? writer.ar : writer.en)(ctx);

  let support = customSupport;
  if (!support) {
    const kindCopy = SUPPORT_BY_KIND[kind] || SUPPORT_BY_KIND.built;
    support = ar ? kindCopy.ar : kindCopy.en;
    support += ar
      ? ` يُصاغ هذا المسار خصيصاً لـ${title}.`
      : ` That path is shaped specifically around ${title}.`;
    if (services.length) {
      const listed = services.slice(0, 3).join(ar ? '، ' : ', ');
      support += ar
        ? ` يشمل النطاق لهذا المشروع: ${listed}.`
        : ` Scope on this project includes ${listed}.`;
    }
  }

  return {lead, support};
}
