import {roleImages} from '@/data/image-manifest';

export const blogCategories = [
  {id: 'all', en: 'All', ar: 'الكل'},
  {id: 'engineering', en: 'Engineering', ar: 'الهندسة'},
  {id: 'design', en: 'Design', ar: 'التصميم'},
  {id: 'delivery', en: 'Delivery', ar: 'التنفيذ'},
  {id: 'insights', en: 'Insights', ar: 'رؤى'},
];

/**
 * ASAS Blog — 10 editorial posts (EN + AR).
 * Covers reuse exclusive role photography from the image manifest.
 */
export const posts = [
  {
    slug: 'coordinated-design-from-day-one',
    date: '2026-08-12',
    category: 'engineering',
    cover: roleImages.SERVICE_ARCHITECTURE,
    title: 'Why coordinated design from day one saves projects',
    titleAr: 'لماذا التصميم المنسق من اليوم الأول ينقذ المشاريع',
    excerpt:
      'Architecture, structure and MEP decisions made together early reduce clashes, cost and redesign later.',
    excerptAr:
      'قرارات العمارة والإنشاءات وMEP معاً منذ البداية تقلل التعارضات والتكلفة وإعادة التصميم لاحقاً.',
    body: [
      'On complex Abu Dhabi programmes, the most expensive problems rarely appear on site first — they appear in drawings that were never fully coordinated.',
      'ASAS treats architectural, structural and electromechanical design as one workflow. Early workshops align loads, shafts, plant rooms and façade constraints before documentation locks in.',
      'The result is fewer RFIs, cleaner authority packages and a clearer path from concept to construction.',
    ],
    bodyAr: [
      'في البرامج المعقدة بأبوظبي، أغلى المشكلات نادراً ما تظهر أولاً في الموقع — بل في رسومات لم تُنسّق بالكامل.',
      'تعامل أساس العمارة والإنشاءات والتصميم الكهروميكانيكي كمسار عمل واحد. ورش مبكرة توحّد الأحمال والمناور وغرف المعدات وقيود الواجهة قبل تثبيت الوثائق.',
      'النتيجة: استفسارات أقل، وحزم جهات أوضح، ومسار أوضح من الفكرة إلى الإنشاء.',
    ],
  },
  {
    slug: 'structural-clarity-for-towers',
    date: '2026-07-28',
    category: 'engineering',
    cover: roleImages.SECTOR_TOWERS,
    title: 'Structural clarity for high-rise and mixed-use towers',
    titleAr: 'وضوح إنشائي للأبراج والاستخدام المتعدد',
    excerpt:
      'Tower projects succeed when structure, architecture and MEP share one vertical logic from podium to crown.',
    excerptAr:
      'تنجح مشاريع الأبراج عندما تتشارك الإنشاءات والعمارة وMEP منطقاً رأسياً واحداً من المنصة إلى القمة.',
    body: [
      'High-rise work demands early agreement on core layout, transfer levels and plant strategy.',
      'ASAS structural teams coordinate with architecture so framing, slabs and lateral systems support the intended programme without forcing late compromises.',
      'That clarity protects both constructability and long-term building performance.',
    ],
    bodyAr: [
      'العمل في المباني العالية يتطلب اتفاقاً مبكراً على نواة المبنى ومناسيب النقل واستراتيجية المعدات.',
      'ينسّق فريق الإنشاءات في أساس مع العمارة بحيث تدعم الإطارات والبلاطات وأنظمة المقاومة الأفقية البرنامج المقصود دون تنازلات متأخرة.',
      'هذا الوضوح يحمي قابلية التنفيذ وأداء المبنى على المدى الطويل.',
    ],
  },
  {
    slug: 'mep-rooms-that-actually-work',
    date: '2026-07-10',
    category: 'engineering',
    cover: roleImages.SERVICE_MEP,
    title: 'MEP rooms that actually work on site',
    titleAr: 'غرف MEP تعمل فعلياً في الموقع',
    excerpt:
      'Plant space is not leftover area — it is a design decision that shapes serviceability for decades.',
    excerptAr:
      'فراغ المعدات ليس مساحة فائضة — بل قرار تصميمي يشكّل قابلية الصيانة لعقود.',
    body: [
      'Undersized plant rooms create lifelong access problems for facilities teams.',
      'ASAS MEP design sizes routes, clearances and maintenance access with architecture from the start.',
      'Clients benefit from buildings that can be operated, not only approved.',
    ],
    bodyAr: [
      'غرف المعدات غير الكافية تخلق مشكلات وصول دائمة لفرق التشغيل.',
      'يصمّم MEP في أساس المسارات والخلوصات ومسارات الصيانة مع العمارة منذ البداية.',
      'يستفيد العملاء من مبانٍ قابلة للتشغيل لا للاعتماد فقط.',
    ],
  },
  {
    slug: 'quantity-surveying-as-design-discipline',
    date: '2026-06-22',
    category: 'delivery',
    cover: roleImages.SERVICE_QS,
    title: 'Quantity surveying as a design discipline',
    titleAr: 'حصر الكميات كتخصص تصميمي',
    excerpt:
      'Cost certainty improves when QS sits inside the design conversation, not after drawings are finished.',
    excerptAr:
      'تتحسّن موثوقية التكلفة عندما يكون حصر الكميات داخل محادثة التصميم لا بعدها.',
    body: [
      'Late cost advice often arrives too late to change the design meaningfully.',
      'ASAS integrates quantities and cost review with design milestones so options can be compared while they are still open.',
      'This keeps scope, specification and budget aligned through documentation.',
    ],
    bodyAr: [
      'نصائح التكلفة المتأخرة تصل غالباً بعد فوات أوان تغيير التصميم بجدية.',
      'تدمج أساس حصر الكميات ومراجعة التكلفة مع محطات التصميم لمقارنة الخيارات وهي لا تزال مفتوحة.',
      'هذا يبقي النطاق والمواصفات والميزانية متوافقة عبر الوثائق.',
    ],
  },
  {
    slug: 'supervision-that-protects-intent',
    date: '2026-06-05',
    category: 'delivery',
    cover: roleImages.SERVICE_SUPERVISION,
    title: 'Construction supervision that protects design intent',
    titleAr: 'إشراف إنشائي يحمي نية التصميم',
    excerpt:
      'Supervision is where drawings meet reality — and where quality either holds or slips.',
    excerptAr:
      'الإشراف هو حيث تلتقي الرسومات بالواقع — وحيث تثبت الجودة أو تنزلق.',
    body: [
      'ASAS supervision teams stay close to the design package they helped produce.',
      'Site observations, material checks and coordination meetings keep contractors aligned with approved intent.',
      'That continuity reduces ambiguity during construction and handover.',
    ],
    bodyAr: [
      'تبقى فرق الإشراف في أساس قريبة من حزمة التصميم التي ساعدت في إنتاجها.',
      'ملاحظات الموقع وفحص المواد واجتماعات التنسيق تبقي المقاولين متوافقين مع النية المعتمدة.',
      'هذا الاستمرار يقلل الغموض أثناء الإنشاء والتسليم.',
    ],
  },
  {
    slug: 'interior-fitout-with-engineering-rigour',
    date: '2026-05-18',
    category: 'design',
    cover: roleImages.SERVICE_INTERIOR,
    title: 'Interior fit-out with engineering rigour',
    titleAr: 'تجهيز داخلي بصرامة هندسية',
    excerpt:
      'Hospitality and workplace interiors succeed when finishes, services and structure stay coordinated.',
    excerptAr:
      'تنجح الفراغات الداخلية للضيافة وأماكن العمل عندما تبقى التشطيبات والخدمات والإنشاءات منسّقة.',
    body: [
      'Interior projects often fail at junctions — ceiling voids, wet areas and service penetrations.',
      'ASAS interior design works with MEP and structure so atmosphere is not achieved at the expense of buildability.',
      'Clients get spaces that look refined and perform reliably.',
    ],
    bodyAr: [
      'كثيراً ما تفشل مشاريع التصميم الداخلي عند الوصلات — فراغات الأسقف والمناطق الرطبة واختراقات الخدمات.',
      'يعمل التصميم الداخلي في أساس مع MEP والإنشاءات حتى لا يتحقق الجو على حساب قابلية التنفيذ.',
      'يحصل العملاء على فراغات أنيقة وتعمل بموثوقية.',
    ],
  },
  {
    slug: 'schools-and-campus-planning',
    date: '2026-05-02',
    category: 'insights',
    cover: roleImages.SECTOR_EDUCATION,
    title: 'Planning schools that support learning and operations',
    titleAr: 'تخطيط مدارس تدعم التعلم والتشغيل',
    excerpt:
      'Education projects need clear circulation, flexible teaching space and maintainable services.',
    excerptAr:
      'تحتاج مشاريع التعليم حركة واضحة وفضاءات تعليم مرنة وخدمات قابلة للصيانة.',
    body: [
      'ASAS approaches school design as both pedagogy support and operational infrastructure.',
      'Master planning, classroom modules and plant strategy are coordinated so campuses can grow without chaos.',
      'Good schools are engineered environments — not only architectural images.',
    ],
    bodyAr: [
      'تقارب أساس تصميم المدارس كدعم للتربية وبنية تشغيلية في آن واحد.',
      'يُنسّق المخطط العام ووحدات الفصول واستراتيجية المعدات حتى تنمو الحرم دون فوضى.',
      'المدارس الجيدة بيئات هندسية — لا صوراً معمارية فقط.',
    ],
  },
  {
    slug: 'industrial-and-showroom-efficiency',
    date: '2026-04-14',
    category: 'insights',
    cover: roleImages.SECTOR_INDUSTRIAL,
    title: 'Industrial and showroom buildings built for efficiency',
    titleAr: 'مبانٍ صناعية وصالات عرض مبنية للكفاءة',
    excerpt:
      'Steel structures, clear spans and service access define whether industrial assets stay productive.',
    excerptAr:
      'الهياكل الفولاذية والبحور الواضحة ووصول الخدمات تحدد بقاء الأصول الصناعية منتجة.',
    body: [
      'Musaffah and similar districts reward practical engineering over decorative complexity.',
      'ASAS designs industrial and showroom facilities around workflow, vehicle movement and maintainable MEP.',
      'Efficiency on paper must survive real operations.',
    ],
    bodyAr: [
      'مناطق مثل مصفح تكافئ الهندسة العملية أكثر من التعقيد الزخرفي.',
      'تصمّم أساس المنشآت الصناعية وصالات العرض حول سير العمل وحركة المركبات وMEP القابل للصيانة.',
      'الكفاءة على الورق يجب أن تصمد أمام التشغيل الحقيقي.',
    ],
  },
  {
    slug: 'project-management-as-integration',
    date: '2026-03-26',
    category: 'delivery',
    cover: roleImages.SERVICE_PM,
    title: 'Project management as true integration',
    titleAr: 'إدارة المشاريع كتكامل حقيقي',
    excerpt:
      'Programme control works when design, cost and construction supervision share one information loop.',
    excerptAr:
      'يعمل ضبط البرنامج عندما يتشارك التصميم والتكلفة وإشراف الإنشاء حلقة معلومات واحدة.',
    body: [
      'ASAS project management is not a separate layer of reporting — it connects disciplines.',
      'Schedules, risk registers and decision logs stay tied to design and site reality.',
      'Clients see progress with context, not isolated status slides.',
    ],
    bodyAr: [
      'إدارة المشاريع في أساس ليست طبقة تقارير منفصلة — بل تربط التخصصات.',
      'الجداول وسجلات المخاطر وقرارات العمل تبقى مرتبطة بالتصميم وواقع الموقع.',
      'يرى العملاء التقدم مع السياق لا شرائح حالة معزولة.',
    ],
  },
  {
    slug: 'abu-dhabi-consultancy-perspective',
    date: '2026-03-08',
    category: 'insights',
    cover: roleImages.ABOUT_FEATURED,
    title: 'An Abu Dhabi consultancy perspective on lasting quality',
    titleAr: 'منظور استشارات أبوظبي حول الجودة المستدامة',
    excerpt:
      'Since 2009, ASAS has focused on coordinated engineering that holds up from design office to site.',
    excerptAr:
      'منذ 2009 تركّز أساس على هندسة منسّقة تصمد من مكتب التصميم إلى الموقع.',
    body: [
      'Local knowledge matters: authority expectations, climate loads and construction culture shape every package.',
      'ASAS builds that knowledge into design reviews, documentation and supervision practice.',
      'Quality is not a slogan — it is the habit of coordination across people and disciplines.',
    ],
    bodyAr: [
      'المعرفة المحلية مهمة: توقعات الجهات وأحمال المناخ وثقافة الإنشاء تشكّل كل حزمة.',
      'تدمج أساس هذه المعرفة في مراجعات التصميم والوثائق وممارسة الإشراف.',
      'الجودة ليست شعاراً — بل عادة التنسيق عبر الأشخاص والتخصصات.',
    ],
  },
];

export function getPosts() {
  return [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}

export function getRelatedPosts(slug, {limit = 3} = {}) {
  const current = getPostBySlug(slug);
  if (!current) return getPosts().slice(0, limit);
  return getPosts()
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const aScore = a.category === current.category ? 1 : 0;
      const bScore = b.category === current.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function formatPostDate(date, locale = 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

export function categoryLabel(categoryId, locale = 'en') {
  const hit = blogCategories.find((item) => item.id === categoryId);
  if (!hit) return categoryId;
  return locale === 'ar' ? hit.ar : hit.en;
}
