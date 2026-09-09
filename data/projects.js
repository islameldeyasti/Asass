import {projectImages, roleImages} from './image-manifest';

export const projectKinds = {
  built: {en: 'Built Project', ar: 'مشروع منفَّذ'},
  study: {en: 'Planning Study', ar: 'دراسة تخطيطية'},
  interior: {en: 'Interior Fit-out', ar: 'تجهيز داخلي'},
};

const kindByCategory = {
  infrastructure: 'study',
  'interior-design': 'interior',
};

const locationShorts = {
  'four-towers-al-nahda': ['Al Nahda, Sharjah', 'النهدة، الشارقة'],
  'building-mbz-musaffah-m26': ['Mohammed Bin Zayed City, Abu Dhabi', 'مدينة محمد بن زايد، أبوظبي'],
  'building-khalifa-city-msh36': ['Khalifa City, Abu Dhabi', 'مدينة خليفة، أبوظبي'],
  'residential-building-al-raha-rbw2': ['Al Raha Beach, Abu Dhabi', 'شاطئ الراحة، أبوظبي'],
  'mbz-city-towers': ['Mohammed Bin Zayed City, Abu Dhabi', 'مدينة محمد بن زايد، أبوظبي'],
  'showroom-musaffah-m42': ['Musaffah, Abu Dhabi', 'مصفح، أبوظبي'],
  'industrial-facility-musaffah-m42': ['Musaffah, Abu Dhabi', 'مصفح، أبوظبي'],
  'industrial-facility-musaffah-m15': ['Musaffah, Abu Dhabi', 'مصفح، أبوظبي'],
  'traffic-access-studies': ['Khalifa City, Abu Dhabi', 'مدينة خليفة، أبوظبي'],
  'compound-villas-portfolio': ['Khalifa City, Abu Dhabi', 'مدينة خليفة، أبوظبي'],
  'private-villa-shakhbout-w01': ['Shakhbout City, Abu Dhabi', 'مدينة شخبوط، أبوظبي'],
  'private-villa-khalifa-se24': ['Khalifa City, Abu Dhabi', 'مدينة خليفة، أبوظبي'],
  'private-villa-mbz-z14': ['Mohammed Bin Zayed City, Abu Dhabi', 'مدينة محمد بن زايد، أبوظبي'],
  'residential-villa-al-shamkha-sh3': ['Al Shamkha, Abu Dhabi', 'الشامخة، أبوظبي'],
  'residential-villa-riyadh-rd32': ['Madinat Al Riyadh, Abu Dhabi', 'مدينة الرياض، أبوظبي'],
  'residential-villa-bani-yas-eb11-01': ['Bani Yas, Abu Dhabi', 'بني ياس، أبوظبي'],
};

/** Projects listing heroes — exclusive role images, not shared with project cards. */
export const projectHeroVisuals = [
  {src: roleImages.PROJECTS_HERO, crop: '50% 40%', projectPhoto: false},
  {
    src: projectImages['traffic-access-studies'].portfolio || projectImages['traffic-access-studies'].card,
    crop: '50% 45%',
    projectPhoto: true,
  },
];

export const projectCategories = [
  {slug: 'all', title: 'All', titleAr: 'الكل'},
  {slug: 'towers', title: 'Towers & High-Rise', titleAr: 'الأبراج والمباني العالية'},
  {slug: 'buildings', title: 'Buildings', titleAr: 'المباني'},
  {slug: 'industrial', title: 'Industrial', titleAr: 'الصناعي'},
  {slug: 'infrastructure', title: 'Infrastructure', titleAr: 'البنية التحتية'},
  {slug: 'education', title: 'Schools', titleAr: 'المدارس'},
  {slug: 'compound-villas', title: 'Compound Villas', titleAr: 'مجمعات الفلل'},
  {slug: 'private-villas', title: 'Private Villas', titleAr: 'الفلل الخاصة'},
  {slug: 'residential-villas', title: 'Residential Villas', titleAr: 'الفلل السكنية'},
  {slug: 'interior-design', title: 'Interior Design', titleAr: 'التصميم الداخلي'},
];

const records = [
  ['four-towers-al-nahda', 'Four Towers, Al Nahda', 'أربعة أبراج، النهدة', 'towers', 'Sharjah, Al Nahda', 'الشارقة، النهدة', 'A four-tower composition over a shared podium: 3 basement levels, 6 podium parking levels and 37 floors, with architectural, structural and electromechanical design by ASAS.', 'تكوين من أربعة أبراج فوق منصة مشتركة: 3 طوابق سفلية و6 طوابق منصة للمواقف و37 طابقاً، بتصميم معماري وإنشائي وكهروميكانيكي من أساس للاستشارات الهندسية وإدارة المشاريع.', true, ['Architectural design', 'Structural engineering', 'Electromechanical design'], 30],
  ['building-mbz-musaffah-m26', 'Commercial & Residential Building — M26', 'مبنى تجاري وسكني — M26', 'buildings', 'Mohammed Bin Zayed City / Musaffah M26', 'مدينة محمد بن زايد / مصفح M26', 'Ground, mezzanine and seven-floor commercial and residential building.', 'مبنى تجاري وسكني من طابق أرضي وميزانين وسبعة طوابق.', true, [], 31],
  ['building-khalifa-city-msh36', 'Commercial & Residential Building — MSH36', 'مبنى تجاري وسكني — MSH36', 'buildings', 'Khalifa City, Sector MSH36', 'مدينة خليفة، القطاع MSH36', 'A commercial and residential building comprising three basement levels, ground floor and seven upper floors.', 'مبنى تجاري وسكني يضم ثلاثة طوابق سفلية وطابقاً أرضياً وسبعة طوابق علوية.', true, [], 31],
  ['residential-building-al-raha-rbw2', 'Residential Building — RBW2', 'مبنى سكني — RBW2', 'buildings', 'Al Raha Beach, Abu Dhabi, RBW2', 'شاطئ الراحة، أبوظبي، RBW2', 'Residential building at Al Raha Beach.', 'مبنى سكني في شاطئ الراحة.', true, [], 31],
  ['mbz-city-towers', 'MBZ City Towers', 'أبراج مدينة محمد بن زايد', 'towers', 'Mohammed Bin Zayed City, Abu Dhabi', 'مدينة محمد بن زايد، أبوظبي', 'Tower project in Mohammed Bin Zayed City, Abu Dhabi.', 'مشروع أبراج في مدينة محمد بن زايد، أبوظبي.', true, [], 32],
  ['showroom-musaffah-m42', 'Showroom — M42', 'صالة عرض — M42', 'industrial', 'Musaffah Industrial, M42', 'مصفح الصناعية، M42', 'Showroom within the Musaffah industrial area.', 'صالة عرض ضمن منطقة مصفح الصناعية.', null, [], 33],
  ['industrial-facility-musaffah-m42', 'Industrial Facility — M42', 'منشأة صناعية — M42', 'industrial', 'Musaffah Industrial, M42', 'مصفح الصناعية، M42', 'Industrial facility within the Musaffah industrial area.', 'منشأة صناعية ضمن منطقة مصفح الصناعية.', null, [], 33],
  ['industrial-facility-musaffah-m15', 'Industrial Facility — M15', 'منشأة صناعية — M15', 'industrial', 'Musaffah Industrial, M15', 'مصفح الصناعية، M15', 'Industrial facility within the Musaffah industrial area.', 'منشأة صناعية ضمن منطقة مصفح الصناعية.', null, [], 33],
  ['traffic-access-studies', 'Traffic & Access Studies', 'دراسات المرور والمداخل', 'infrastructure', 'Abu Dhabi Island and Khalifa City — C61, C31, C32, C47', 'جزيرة أبوظبي ومدينة خليفة — C61 وC31 وC32 وC47', 'Parking layouts, kerb and sewer adjustments, one-way circulation, service bays, speed humps and road marking prepared for municipality review.', 'مخططات مواقف وتعديلات الأرصفة والصرف وحركة الاتجاه الواحد ومناطق الخدمة ومطبات السرعة وعلامات الطرق، أُعدت لمراجعة البلدية.', true, ['Traffic studies and analysis', 'Infrastructure', 'Urban planning'], 34],
  ['culture-private-school', 'Culture Private School', 'مدرسة الثقافة الخاصة', 'education', null, null, 'Full campus master plan and sports facilities.', 'مخطط عام متكامل للحرم والمرافق الرياضية.', true, [], 35],
  ['emirates-private-school', 'Emirates Private School', 'مدرسة الإمارات الخاصة', 'education', null, null, 'Private-school project included in the ASAS selected portfolio.', 'مشروع مدرسة خاصة ضمن أعمال أساس للاستشارات الهندسية وإدارة المشاريع المختارة.', true, [], 35],
  ['american-international-school', 'American International School', 'المدرسة الأمريكية الدولية', 'education', null, null, 'School project included in the ASAS selected portfolio.', 'مشروع مدرسة ضمن أعمال أساس للاستشارات الهندسية وإدارة المشاريع المختارة.', null, [], 35],
  ['compound-villas-portfolio', 'Compound Villas Portfolio', 'مجموعة مشاريع مجمعات الفلل', 'compound-villas', 'Khalifa City SE36; Mohammed Bin Zayed City Z19 and C176; Shakhbout City MSH6', 'مدينة خليفة SE36؛ مدينة محمد بن زايد Z19 وC176؛ مدينة شخبوط MSH6', 'Multi-unit villa compounds designed as a single architectural family, with shared access, parking and services planned across each plot.', 'مجمعات فلل متعددة الوحدات صُممت كعائلة معمارية واحدة، مع تخطيط المداخل والمواقف والخدمات المشتركة عبر كل قطعة.', true, [], 36],
  ['private-villa-shakhbout-w01', 'Private Villa — W01', 'فيلا خاصة — W01', 'private-villas', 'Shakhbout City, W01', 'مدينة شخبوط، W01', 'Ground and first-floor private villa.', 'فيلا خاصة من طابق أرضي وأول.', true, [], 37],
  ['private-villa-khalifa-se24', 'Private Villa — SE24', 'فيلا خاصة — SE24', 'private-villas', 'Khalifa City, SE24', 'مدينة خليفة، SE24', 'Ground and first-floor private villa.', 'فيلا خاصة من طابق أرضي وأول.', true, [], 37],
  ['private-villa-mbz-z14', 'Private Villa — Z14', 'فيلا خاصة — Z14', 'private-villas', 'Mohammed Bin Zayed City, Z14', 'مدينة محمد بن زايد، Z14', 'Ground, first-floor and roof private villa.', 'فيلا خاصة من طابق أرضي وأول وسطح.', null, [], 37],
  ['residential-villa-al-shamkha-sh3', 'Residential Villa — SH3', 'فيلا سكنية — SH3', 'residential-villas', 'Al Shamkha, SH3', 'الشامخة، SH3', 'Residential villa in Al Shamkha.', 'فيلا سكنية في الشامخة.', true, [], 38],
  ['residential-villa-riyadh-rd32', 'Residential Villa — RD32', 'فيلا سكنية — RD32', 'residential-villas', 'Madinat Al Riyadh, RD32', 'مدينة الرياض، RD32', 'Residential villa in Madinat Al Riyadh.', 'فيلا سكنية في مدينة الرياض.', true, [], 38],
  ['residential-villa-bani-yas-eb11-01', 'Residential Villa — EB11-01', 'فيلا سكنية — EB11-01', 'residential-villas', 'Bani Yas, EB11-01', 'بني ياس، EB11-01', 'Residential villa in Bani Yas.', 'فيلا سكنية في بني ياس.', true, [], 38],
  ['reception-hall-private-villa', 'Reception Hall — Private Villa', 'قاعة استقبال — فيلا خاصة', 'interior-design', null, null, 'Residential reception hall with classical detailing.', 'قاعة استقبال سكنية بتفاصيل كلاسيكية.', true, ['Interior design'], 41],
  ['majlis-and-dining', 'Majlis & Dining — Private Villa', 'مجلس وغرفة طعام — فيلا خاصة', 'interior-design', null, null, 'Majlis and dining interior featuring mashrabiya screens and marble.', 'تصميم داخلي لمجلس وغرفة طعام يتضمن شاشات مشربية ورخاماً.', true, ['Interior design'], 41],
  ['restaurant-interior', 'Restaurant Interior', 'تصميم داخلي لمطعم', 'interior-design', null, null, 'Restaurant interior included in the ASAS hospitality portfolio.', 'تصميم داخلي لمطعم ضمن أعمال أساس للاستشارات الهندسية وإدارة المشاريع لقطاع الضيافة.', true, ['Interior design'], 42],
  ['hotel-lobby-interior', 'Hotel Lobby Interior', 'تصميم داخلي لردهة فندق', 'interior-design', null, null, 'Hotel-lobby interior included in the ASAS hospitality portfolio.', 'تصميم داخلي لردهة فندق ضمن أعمال أساس للاستشارات الهندسية وإدارة المشاريع لقطاع الضيافة.', true, ['Interior design'], 42],
];

export const projects = records.map(([slug, title, titleAr, category, location, locationAr, description, descriptionAr, hasImage, services, sourceProfilePage], index) => {
  const asset = hasImage ? projectImages[slug] : null;
  const place = locationShorts[slug] || [];
  const kind = kindByCategory[category] || 'built';
  const approved =
    asset &&
    asset.status === 'APPROVED_FOR_CARDS' &&
    (asset.card || asset.portfolio || asset.mobile);

  const images = approved
    ? [
        ...new Set(
          [...(asset.gallery || []), asset.portfolio, asset.card, asset.mobile].filter(Boolean),
        ),
      ]
    : [];

  const visual = approved
    ? {
        src: asset.card || asset.portfolio || asset.mobile,
        crop: '50% 50%',
        classification: asset.classification === 'TECHNICAL_DRAWING' ? 'TECHNICAL_DRAWING' : 'PROJECT_PHOTO',
      }
    : null;

  return {
    id: index + 1,
    slug,
    title,
    titleAr,
    category,
    sector: category,
    location,
    locationAr,
    locationShort: place[0] || null,
    locationShortAr: place[1] || null,
    description,
    descriptionAr,
    services,
    kind,
    image: visual?.src || null,
    imageAsset: approved ? asset : null,
    visual,
    images,
    gallery: images,
    needsOriginalImage: !approved,
    featured: [
      'traffic-access-studies',
      'four-towers-al-nahda',
      'culture-private-school',
      'compound-villas-portfolio',
      'residential-villa-al-shamkha-sh3',
      'reception-hall-private-villa',
    ].includes(slug),
    sourceProfilePage,
  };
});

export const featuredProjects = projects.filter((project) => project.featured);
