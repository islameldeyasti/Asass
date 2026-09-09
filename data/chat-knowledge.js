import {company} from '@/data/company';
import {services} from '@/data/services';

/**
 * Grounded ASAS chat knowledge — used for local replies and LLM system context.
 * Keep facts aligned with public website content only.
 */

const serviceListEn = services.map((s) => s.title).join('; ');
const serviceListAr = services.map((s) => s.titleAr).join('؛ ');

export const chatKnowledge = {
  company: {
    en: {
      name: company.name,
      founded: company.year,
      city: `${company.city}, ${company.country}`,
      address: company.address,
      phone: company.phone,
      mobile: company.mobile,
      email: company.email,
      website: company.website,
      about: company.description,
      parent: company.parentGroup,
    },
    ar: {
      name: company.nameAr,
      founded: company.year,
      city: `${company.cityAr}، ${company.countryAr}`,
      address: company.addressAr,
      phone: company.phone,
      mobile: company.mobile,
      email: company.email,
      website: company.website,
      about: company.descriptionAr,
      parent: company.parentGroupAr,
    },
  },
  faqs: [
    {
      id: 'services',
      keywords: {
        en: ['service', 'services', 'disciplines', 'architecture', 'mep', 'structural', 'offer'],
        ar: ['خدمات', 'خدمة', 'تخصص', 'عمارة', 'إنشاء', 'كهروميكانيك', 'ماذا تقدم'],
      },
      answer: {
        en: `ASAS provides coordinated engineering consultancy in Abu Dhabi, including: ${serviceListEn}.`,
        ar: `تقدم أساس للاستشارات الهندسية وإدارة المشاريع خدمات استشارية منسّقة في أبوظبي، وتشمل: ${serviceListAr}.`,
      },
    },
    {
      id: 'location',
      keywords: {
        en: ['where', 'location', 'office', 'address', 'abu dhabi', 'visit', 'map'],
        ar: ['أين', 'موقع', 'مكتب', 'عنوان', 'أبوظبي', 'زور', 'خريطة', 'مصفح'],
      },
      answer: {
        en: `Our office is in Abu Dhabi: ${company.address}. Phone: ${company.phone}.`,
        ar: `يقع مكتبنا في أبوظبي: ${company.addressAr}. الهاتف: ${company.phone}.`,
      },
    },
    {
      id: 'contact',
      keywords: {
        en: ['contact', 'email', 'phone', 'call', 'whatsapp', 'reach', 'enquiry'],
        ar: ['تواصل', 'اتصال', 'بريد', 'هاتف', 'واتساب', 'استفسار', 'رقم'],
      },
      answer: {
        en: `You can reach ASAS by email (${company.email}), phone (${company.phone}), mobile/WhatsApp (+${company.whatsapp}), or the Project Enquiry form on this website.`,
        ar: `يمكنك التواصل مع أساس للاستشارات الهندسية وإدارة المشاريع عبر البريد (${company.email}) أو الهاتف (${company.phone}) أو الجوال/واتساب (+${company.whatsapp}) أو نموذج استفسار المشروع في الموقع.`,
      },
    },
    {
      id: 'about',
      keywords: {
        en: ['about', 'who', 'founded', 'history', 'company', 'asas', 'mir'],
        ar: ['من', 'عن', 'تأسست', 'شركة', 'أساس', 'مير', 'تعريف'],
      },
      answer: {
        en: `${company.description} ${company.parentGroup}.`,
        ar: `${company.descriptionAr} ${company.parentGroupAr}.`,
      },
    },
    {
      id: 'sectors',
      keywords: {
        en: ['sector', 'sectors', 'tower', 'villa', 'school', 'industrial', 'interior'],
        ar: ['قطاع', 'قطاعات', 'أبراج', 'فلل', 'مدارس', 'صناع', 'داخلي'],
      },
      answer: {
        en: 'ASAS works across towers and high-rise, commercial and residential buildings, industrial facilities, infrastructure, schools, villas and compounds, and interior design — connected to in-house design and supervision disciplines.',
        ar: 'تعمل أساس للاستشارات الهندسية وإدارة المشاريع عبر الأبراج والمباني التجارية والسكنية والمنشآت الصناعية والبنية التحتية والمدارس والفلل والمجمعات والتصميم الداخلي — مرتبطة بتخصصات التصميم والإشراف داخل المكتب.',
      },
    },
    {
      id: 'project-start',
      keywords: {
        en: ['start', 'project', 'hire', 'brief', 'proposal', 'quote', 'begin'],
        ar: ['ابدأ', 'مشروع', 'تعاقد', 'موجز', 'عرض', 'سعر', 'بدء'],
      },
      answer: {
        en: 'To start a project, share your requirements via Project Enquiry on this site, or email/WhatsApp the Abu Dhabi office. The team will review capacity and guide the next step.',
        ar: 'لبدء مشروع، شارك متطلباتك عبر صفحة استفسار المشروع في الموقع، أو راسل/واتساب مكتب أبوظبي. يراجع الفريق السعة ويرشدك إلى الخطوة التالية.',
      },
    },
    {
      id: 'hours',
      keywords: {
        en: ['hours', 'open', 'timing', 'available', 'when'],
        ar: ['ساعات', 'دوام', 'مفتوح', 'متى', 'وقت'],
      },
      answer: {
        en: 'For office availability and appointments, please contact the Abu Dhabi team by phone or email and they will confirm a suitable time.',
        ar: 'لمعرفة أوقات الدوام أو حجز موعد، يرجى التواصل مع فريق أبوظبي هاتفياً أو بالبريد وسنؤكد الوقت المناسب.',
      },
    },
  ],
  suggestions: {
    en: ['What services do you offer?', 'Where is your office?', 'How do I start a project?', 'Contact details'],
    ar: ['ما الخدمات التي تقدمونها؟', 'أين يقع المكتب؟', 'كيف أبدأ مشروعاً؟', 'بيانات التواصل'],
  },
  greeting: {
    en: 'Hello — I am the ASAS website assistant. Ask about our services, office, or how to start a project. For project discussions, our team can also be reached by email or WhatsApp.',
    ar: 'مرحباً — أنا مساعد موقع أساس للاستشارات الهندسية وإدارة المشاريع. اسأل عن خدماتنا أو المكتب أو كيفية بدء مشروع. وللنقاش التفصيلي يمكن التواصل أيضاً بالبريد أو واتساب.',
  },
  fallback: {
    en: `I can help with ASAS services, office location, and how to enquire. For a specific project, email ${company.email} or use Project Enquiry. What would you like to know?`,
    ar: `يمكنني المساعدة حول خدمات أساس للاستشارات الهندسية وإدارة المشاريع وموقع المكتب وكيفية الاستفسار. لمشروع محدد راسل ${company.email} أو استخدم استفسار المشروع. بماذا تود المساعدة؟`,
  },
};

export function buildSystemPrompt(locale = 'en') {
  const ar = locale === 'ar';
  const c = chatKnowledge.company[ar ? 'ar' : 'en'];
  if (ar) {
    return `أنت مساعد موقع رسمي لـ ${c.name} في أبوظبي.
أجب باختصار ومهنية باللهجة العربية الفصحى المناسبة للاستشارات الهندسية في الإمارات.
استخدم فقط معلومات الشركة التالية ولا تختلق مشاريع أو أسعار أو مواعيد غير موجودة:
- التأسيس: ${c.founded}
- الموقع: ${c.city}
- العنوان: ${c.address}
- الهاتف: ${c.phone}
- الجوال: ${c.mobile}
- البريد: ${c.email}
- الموقع الإلكتروني: ${c.website}
- عن الشركة: ${c.about}
- ${c.parent}
- الخدمات: ${serviceListAr}
إذا سُئلت عن أسعار أو جداول زمنية تفصيلية، وجّه المستخدم إلى نموذج استفسار المشروع أو البريد/واتساب.
لا تقدم استشارات هندسية ملزمة قانونياً؛ وضّح أن الردود تعريفية بالموقع.`;
  }
  return `You are the official website assistant for ${c.name} in Abu Dhabi.
Reply briefly and professionally.
Use ONLY this company information — do not invent projects, prices, or schedules:
- Founded: ${c.founded}
- Location: ${c.city}
- Address: ${c.address}
- Phone: ${c.phone}
- Mobile: ${c.mobile}
- Email: ${c.email}
- Website: ${c.website}
- About: ${c.about}
- ${c.parent}
- Services: ${serviceListEn}
If asked for pricing or detailed timelines, direct the user to the Project Enquiry form, email, or WhatsApp.
Do not give binding engineering advice; answers are informational about the firm.`;
}
