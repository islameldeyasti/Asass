/** Careers data — open roles for the ASAS careers board.
 * Staff should manage listings via CMS/admin later; this file is the
 * interim content source until a headless CMS or admin panel is connected.
 */

export const careerDepartments = [
  {
    id: 'architecture',
    label: 'Architecture',
    labelAr: 'العمارة',
  },
  {
    id: 'structural',
    label: 'Structural Engineering',
    labelAr: 'الهندسة الإنشائية',
  },
  {
    id: 'mep',
    label: 'MEP / Electromechanical',
    labelAr: 'الهندسة الكهروميكانيكية',
  },
  {
    id: 'quantity-surveying',
    label: 'Quantity Surveying',
    labelAr: 'حصر الكميات',
  },
  {
    id: 'construction-management',
    label: 'Construction Management & Supervision',
    labelAr: 'إدارة الإنشاء والإشراف',
  },
  {
    id: 'admin-support',
    label: 'Admin & Project Support',
    labelAr: 'الإدارة ودعم المشاريع',
  },
];

export const employmentTypes = {
  'full-time': {en: 'Full-time', ar: 'دوام كامل'},
  'part-time': {en: 'Part-time', ar: 'دوام جزئي'},
  contract: {en: 'Contract', ar: 'عقد'},
};

/**
 * Set `status` to 'open' | 'closed'. Only open roles appear on the board.
 * To show the empty state for demos, set every role to 'closed'.
 */
export const jobs = [
  {
    slug: 'architectural-designer',
    status: 'open',
    department: 'architecture',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    type: 'full-time',
    title: 'Architectural Designer',
    titleAr: 'مصمم معماري',
    summary:
      'Support concept-to-detailed architectural design across residential, commercial and institutional projects in the ASAS portfolio.',
    summaryAr:
      'دعم التصميم المعماري من الفكرة إلى التفاصيل عبر مشاريع سكنية وتجارية ومؤسسية ضمن أعمال أساس للاستشارات الهندسية وإدارة المشاريع.',
    description:
      'ASAS is seeking an Architectural Designer to join the in-house architecture team in Abu Dhabi. You will work alongside structural, MEP and quantity-surveying colleagues on coordinated deliverables from concept through construction documentation.',
    descriptionAr:
      'تبحث أساس للاستشارات الهندسية وإدارة المشاريع عن مصمم معماري للانضمام إلى فريق العمارة في أبوظبي. ستعمل مع زملاء الإنشاءات وMEP وحصر الكميات على مخرجات منسّقة من الفكرة حتى وثائق الإنشاء.',
    responsibilities: [
      'Prepare architectural drawings, details and presentation material',
      'Coordinate design packages with structural, MEP and QS disciplines',
      'Support municipality and authority submissions as required',
      'Participate in design reviews and client meetings',
    ],
    responsibilitiesAr: [
      'إعداد الرسومات والتفاصيل والمواد التقديمية المعمارية',
      'تنسيق حزم التصميم مع تخصصات الإنشاءات وMEP وحصر الكميات',
      'دعم تقديمات البلدية والجهات المعنية عند الحاجة',
      'المشاركة في مراجعات التصميم واجتماعات العملاء',
    ],
    requirements: [
      'Degree in Architecture or equivalent',
      'Proficiency in AutoCAD and Revit (or similar BIM tools)',
      'Strong portfolio of building design work',
      'Arabic and English communication skills preferred',
    ],
    requirementsAr: [
      'شهادة في العمارة أو ما يعادلها',
      'إجادة AutoCAD وRevite أو أدوات BIM مماثلة',
      'ملف أعمال قوي في تصميم المباني',
      'مهارات تواصل بالعربية والإنجليزية مفضلة',
    ],
  },
  {
    slug: 'structural-engineer',
    status: 'open',
    department: 'structural',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    type: 'full-time',
    title: 'Structural Engineer',
    titleAr: 'مهندس إنشائي',
    summary:
      'Design and review structural systems for buildings and towers, coordinated with architecture, MEP and project cost.',
    summaryAr:
      'تصميم ومراجعة الأنظمة الإنشائية للمباني والأبراج بالتنسيق مع العمارة وMEP وتكلفة المشروع.',
    description:
      'Join the civil and structural engineering team to deliver analysis, design and documentation for mid- and high-rise buildings, foundations and related structural works.',
    descriptionAr:
      'انضم إلى فريق الهندسة المدنية والإنشائية لتقديم التحليل والتصميم والتوثيق للمباني المتوسطة والعالية والأساسات والأعمال الإنشائية ذات الصلة.',
    responsibilities: [
      'Perform structural analysis and design for concrete and steel structures',
      'Produce calculation packages and structural drawings',
      'Coordinate with architecture and MEP for integrated solutions',
      'Support site queries during construction supervision phases',
    ],
    responsibilitiesAr: [
      'إجراء التحليل والتصميم الإنشائي للمنشآت الخرسانية والفولاذية',
      'إعداد حزم الحسابات والرسومات الإنشائية',
      'التنسيق مع العمارة وMEP للحلول المتكاملة',
      'دعم استفسارات الموقع خلال مراحل الإشراف',
    ],
    requirements: [
      'Degree in Civil or Structural Engineering',
      'Experience with structural design software and codes used in the UAE',
      'Familiarity with municipality and authority submission processes',
      'Ability to work in a multi-discipline consultancy environment',
    ],
    requirementsAr: [
      'شهادة في الهندسة المدنية أو الإنشائية',
      'خبرة في برامج التصميم الإنشائي والكودات المستخدمة في الإمارات',
      'إلمام بإجراءات تقديم البلدية والجهات المختصة',
      'القدرة على العمل في بيئة استشارية متعددة التخصصات',
    ],
  },
  {
    slug: 'mep-design-engineer',
    status: 'open',
    department: 'mep',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    type: 'full-time',
    title: 'MEP Design Engineer',
    titleAr: 'مهندس تصميم كهروميكانيكي',
    summary:
      'Contribute to electrical, mechanical and plumbing design packages focused on building efficiency and coordinated delivery.',
    summaryAr:
      'المساهمة في حزم التصميم الكهربائي والميكانيكي والصحي مع التركيز على كفاءة المبنى والتنسيق.',
    description:
      'ASAS needs an MEP Design Engineer to develop electromechanical design for buildings, working closely with architecture and structural teams and supporting Estidama-related requirements where applicable.',
    descriptionAr:
      'تحتاج أساس للاستشارات الهندسية وإدارة المشاريع إلى مهندس تصميم كهروميكانيكي لتطوير التصميم الكهروميكانيكي للمباني بالتنسيق مع فرق العمارة والإنشاءات ودعم متطلبات استدامة عند الاقتضاء.',
    responsibilities: [
      'Design MEP systems for buildings in line with project briefs',
      'Prepare drawings, schedules and coordination documentation',
      'Support energy-efficient and green-building design considerations',
      'Assist with site supervision queries for MEP works',
    ],
    responsibilitiesAr: [
      'تصميم أنظمة MEP للمباني وفق موجز المشروع',
      'إعداد الرسومات والجداول ووثائق التنسيق',
      'دعم اعتبارات التصميم الموفرة للطاقة والمباني الخضراء',
      'المساعدة في استفسارات الإشراف الموقعي لأعمال MEP',
    ],
    requirements: [
      'Degree in Mechanical, Electrical or related Engineering',
      'Experience in building MEP design within the UAE preferred',
      'Working knowledge of relevant UAE authority requirements',
      'Team-oriented approach across disciplines',
    ],
    requirementsAr: [
      'شهادة في الهندسة الميكانيكية أو الكهربائية أو ذات الصلة',
      'خبرة في تصميم MEP للمباني داخل الإمارات مفضلة',
      'معرفة بمتطلبات الجهات المختصة في الإمارات',
      'نهج تعاوني عبر التخصصات',
    ],
  },
  {
    slug: 'quantity-surveyor',
    status: 'open',
    department: 'quantity-surveying',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    type: 'contract',
    title: 'Quantity Surveyor',
    titleAr: 'مساح كميات',
    summary:
      'Prepare bills of quantities, cost studies and tender support across design stages for ASAS projects.',
    summaryAr:
      'إعداد جداول الكميات ودراسات التكلفة ودعم العطاءات عبر مراحل التصميم لمشاريع أساس للاستشارات الهندسية وإدارة المشاريع.',
    description:
      'A Quantity Surveyor is needed to support cost planning, BOQ production, tender analysis and value-engineering review as part of the ASAS design and delivery process.',
    descriptionAr:
      'مطلوب مساح كميات لدعم تخطيط التكلفة وإعداد جداول الكميات وتحليل العطاءات ومراجعة هندسة القيمة ضمن مسار التصميم والتنفيذ في أساس للاستشارات الهندسية وإدارة المشاريع.',
    responsibilities: [
      'Produce bills of quantities and cost estimates',
      'Review designs and specifications against budget',
      'Support tender documentation and analysis',
      'Contribute to value-engineering reviews',
    ],
    responsibilitiesAr: [
      'إعداد جداول الكميات وتقديرات التكلفة',
      'مراجعة التصاميم والمواصفات مقابل الميزانية',
      'دعم وثائق العطاءات وتحليلها',
      'المساهمة في مراجعات هندسة القيمة',
    ],
    requirements: [
      'Qualification in Quantity Surveying or related field',
      'Experience preparing BOQs for building projects',
      'Strong numerical accuracy and documentation habits',
      'Comfortable coordinating with design disciplines',
    ],
    requirementsAr: [
      'مؤهل في حصر الكميات أو مجال ذي صلة',
      'خبرة في إعداد جداول كميات لمشاريع المباني',
      'دقة رقمية عالية وعادات توثيق قوية',
      'القدرة على التنسيق مع تخصصات التصميم',
    ],
  },
  {
    slug: 'site-supervision-engineer',
    status: 'closed',
    department: 'construction-management',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    type: 'full-time',
    title: 'Site Supervision Engineer',
    titleAr: 'مهندس إشراف موقعي',
    summary:
      'Resident engineering support for construction supervision aligned with design intent and specifications.',
    summaryAr:
      'دعم هندسي مقيم للإشراف على التنفيذ وفق نية التصميم والمواصفات.',
    description:
      'This role supports construction supervision and site coordination. It is currently closed and retained for reference.',
    descriptionAr:
      'يدعم هذا الدور الإشراف على التنفيذ والتنسيق الموقعي. وهو مغلق حالياً ويُحتفظ به للمرجع.',
    responsibilities: [
      'Monitor works against specifications and drawings',
      'Coordinate with contractor and project stakeholders',
      'Support snagging and handover activities',
    ],
    responsibilitiesAr: [
      'متابعة الأعمال وفق المواصفات والرسومات',
      'التنسيق مع المقاول وأصحاب المصلحة',
      'دعم حصر الملاحظات والتسليم',
    ],
    requirements: [
      'Engineering degree with site experience',
      'Familiarity with UAE construction practices',
    ],
    requirementsAr: [
      'شهادة هندسية مع خبرة موقعية',
      'إلمام بممارسات الإنشاء في الإمارات',
    ],
  },
];

export const GENERAL_APPLICATION = {
  slug: 'general',
  title: 'General / Speculative Application',
  titleAr: 'طلب عام / استباقي',
};

export function getOpenJobs() {
  return jobs.filter((job) => job.status === 'open');
}

export function getJobBySlug(slug) {
  return jobs.find((job) => job.slug === slug) || null;
}

export function getDepartment(id) {
  return careerDepartments.find((dept) => dept.id === id) || null;
}
