/**
 * Seed linked demo data across Ops Phases 1–6 for local checking.
 * Usage: npm run seed:ops
 *
 * Overwrites ops collections (keeps existing departments / stage-templates if present).
 * Writes to both .data/ops and content/ops.
 */

import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeDir = path.join(root, '.data', 'ops');
const seedDir = path.join(root, 'content', 'ops');
const usersFile = path.join(root, 'content', 'cms', 'users.json');

const NOW = new Date().toISOString();
const TODAY = NOW.slice(0, 10);

function daysFrom(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeBoth(name, data) {
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.mkdir(runtimeDir, {recursive: true});
  await fs.mkdir(seedDir, {recursive: true});
  await fs.writeFile(path.join(runtimeDir, `${name}.json`), payload, 'utf8');
  await fs.writeFile(path.join(seedDir, `${name}.json`), payload, 'utf8');
}

async function main() {
  const users = await readJson(usersFile, []);
  const admin = users.find((u) => u.role === 'super_admin') || users[0] || null;
  const adminUserId = admin?.id || null;

  let departments = await readJson(path.join(runtimeDir, 'departments.json'), []);
  if (!departments.length) {
    departments = await readJson(path.join(seedDir, 'departments.json'), []);
  }

  const bySlug = Object.fromEntries(departments.map((d) => [d.slug, d]));
  const dept = (slug) => bySlug[slug]?.id || null;

  // Fallback: if departments somehow empty, create minimal set
  if (!departments.length) {
    departments = [
      {id: 'dept_gm', slug: 'general-management', nameEn: 'General Management', nameAr: 'الإدارة العامة', order: 1},
      {id: 'dept_arch', slug: 'architectural-design', nameEn: 'Architectural Design', nameAr: 'التصميم المعماري', order: 3},
      {id: 'dept_str', slug: 'structural-design', nameEn: 'Structural Design', nameAr: 'التصميم الإنشائي', order: 4},
      {id: 'dept_mep', slug: 'electromechanical', nameEn: 'Electromechanical', nameAr: 'الكهروميكانيك', order: 5},
      {id: 'dept_qs', slug: 'quantity-surveying', nameEn: 'Quantity Surveying', nameAr: 'مسح الكميات', order: 6},
      {id: 'dept_pm', slug: 'project-management', nameEn: 'Project Management', nameAr: 'إدارة المشاريع', order: 8},
      {id: 'dept_site', slug: 'site-supervision', nameEn: 'Site Supervision', nameAr: 'الإشراف الموقع', order: 9},
      {id: 'dept_admin', slug: 'administration', nameEn: 'Administration', nameAr: 'الإدارة', order: 10},
    ].map((d) => ({
      ...d,
      descriptionEn: '',
      descriptionAr: '',
      headEmployeeId: null,
      active: true,
      createdAt: NOW,
      updatedAt: NOW,
    }));
    for (const d of departments) bySlug[d.slug] = d;
  }

  const employees = [
    {
      id: 'emp_demo_gm',
      employeeCode: 'ASAS-001',
      fullNameEn: 'Omar Al Mansoori',
      fullNameAr: 'عمر المنصوري',
      jobTitleEn: 'General Manager',
      jobTitleAr: 'المدير العام',
      positionEn: 'GM',
      departmentId: dept('general-management'),
      email: 'omar.gm@asasengg.ae',
      phone: '+971501000001',
      joiningDate: '2018-01-15',
      status: 'active',
      managerId: null,
      skills: ['leadership', 'client relations'],
      cmsUserId: adminUserId,
      accountActive: true,
    },
    {
      id: 'emp_demo_pm',
      employeeCode: 'ASAS-014',
      fullNameEn: 'Sara Haddad',
      fullNameAr: 'سارة حداد',
      jobTitleEn: 'Project Manager',
      jobTitleAr: 'مديرة مشاريع',
      positionEn: 'PM',
      departmentId: dept('project-management'),
      email: 'sara.pm@asasengg.ae',
      phone: '+971501000014',
      joiningDate: '2020-03-01',
      status: 'active',
      managerId: 'emp_demo_gm',
      skills: ['planning', 'coordination'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_arch',
      employeeCode: 'ASAS-021',
      fullNameEn: 'Layla Farouk',
      fullNameAr: 'ليلى فاروق',
      jobTitleEn: 'Lead Architect',
      jobTitleAr: 'معمارية رئيسية',
      positionEn: 'Architect',
      departmentId: dept('architectural-design'),
      email: 'layla.arch@asasengg.ae',
      phone: '+971501000021',
      joiningDate: '2019-06-10',
      status: 'active',
      managerId: 'emp_demo_pm',
      skills: ['concept design', 'BIM'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_str',
      employeeCode: 'ASAS-033',
      fullNameEn: 'Karim Nasser',
      fullNameAr: 'كريم ناصر',
      jobTitleEn: 'Structural Engineer',
      jobTitleAr: 'مهندس إنشائي',
      positionEn: 'Structural',
      departmentId: dept('structural-design'),
      email: 'karim.str@asasengg.ae',
      phone: '+971501000033',
      joiningDate: '2021-02-20',
      status: 'active',
      managerId: 'emp_demo_pm',
      skills: ['concrete', 'steel'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_mep',
      employeeCode: 'ASAS-041',
      fullNameEn: 'Hassan Quora',
      fullNameAr: 'حسن قورة',
      jobTitleEn: 'MEP Engineer',
      jobTitleAr: 'مهندس كهروميكانيك',
      positionEn: 'MEP',
      departmentId: dept('electromechanical'),
      email: 'hassan.mep@asasengg.ae',
      phone: '+971501000041',
      joiningDate: '2021-09-01',
      status: 'active',
      managerId: 'emp_demo_pm',
      skills: ['HVAC', 'electrical'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_qs',
      employeeCode: 'ASAS-052',
      fullNameEn: 'Nour El Din',
      fullNameAr: 'نور الدين',
      jobTitleEn: 'Quantity Surveyor',
      jobTitleAr: 'مساح كميات',
      positionEn: 'QS',
      departmentId: dept('quantity-surveying'),
      email: 'nour.qs@asasengg.ae',
      phone: '+971501000052',
      joiningDate: '2022-01-12',
      status: 'active',
      managerId: 'emp_demo_pm',
      skills: ['BOQ', 'cost control'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_site',
      employeeCode: 'ASAS-060',
      fullNameEn: 'Yousef Habib',
      fullNameAr: 'يوسف حبيب',
      jobTitleEn: 'Site Supervisor',
      jobTitleAr: 'مشرف موقع',
      positionEn: 'Site',
      departmentId: dept('site-supervision'),
      email: 'yousef.site@asasengg.ae',
      phone: '+971501000060',
      joiningDate: '2020-11-05',
      status: 'active',
      managerId: 'emp_demo_pm',
      skills: ['supervision', 'HSE'],
      cmsUserId: null,
      accountActive: true,
    },
    {
      id: 'emp_demo_hr',
      employeeCode: 'ASAS-070',
      fullNameEn: 'Mona Saleh',
      fullNameAr: 'منى صالح',
      jobTitleEn: 'HR Officer',
      jobTitleAr: 'مسؤولة موارد بشرية',
      positionEn: 'HR',
      departmentId: dept('administration'),
      email: 'mona.hr@asasengg.ae',
      phone: '+971501000070',
      joiningDate: '2019-04-18',
      status: 'active',
      managerId: 'emp_demo_gm',
      skills: ['leave', 'attendance'],
      cmsUserId: null,
      accountActive: true,
    },
  ].map((e) => ({
    photoUrl: '',
    jobTitleAr: e.jobTitleAr || '',
    positionAr: '',
    whatsapp: e.phone || '',
    specializations: [],
    certifications: [],
    notes: 'Demo seed employee — safe to edit/delete.',
    teamMemberId: null,
    lastLoginAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...e,
  }));

  // Set department heads
  departments = departments.map((d) => {
    const head =
      d.slug === 'general-management'
        ? 'emp_demo_gm'
        : d.slug === 'project-management'
          ? 'emp_demo_pm'
          : d.slug === 'architectural-design'
            ? 'emp_demo_arch'
            : d.slug === 'structural-design'
              ? 'emp_demo_str'
              : d.slug === 'electromechanical'
                ? 'emp_demo_mep'
                : d.slug === 'quantity-surveying'
                  ? 'emp_demo_qs'
                  : d.slug === 'site-supervision'
                    ? 'emp_demo_site'
                    : d.slug === 'administration'
                      ? 'emp_demo_hr'
                      : null;
    return {...d, headEmployeeId: head || d.headEmployeeId || null, updatedAt: NOW};
  });

  const clients = [
    {
      id: 'ocl_demo_aldar',
      nameEn: 'Al Dar Developments',
      nameAr: 'الدار للتطوير',
      code: 'CL-ALD',
      contactName: 'Ahmed Rashed',
      email: 'projects@aldar.example',
      phone: '+97126100000',
      address: 'Abu Dhabi, UAE',
      country: 'UAE',
      notes: 'Demo client',
      websiteClientId: null,
      active: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'ocl_demo_emaar',
      nameEn: 'Emaar Properties',
      nameAr: 'إعمار العقارية',
      code: 'CL-EMR',
      contactName: 'Fatima Al Zaabi',
      email: 'delivery@emaar.example',
      phone: '+97143670000',
      address: 'Dubai, UAE',
      country: 'UAE',
      notes: 'Demo client',
      websiteClientId: null,
      active: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'ocl_demo_gov',
      nameEn: 'Municipal Infrastructure Authority',
      nameAr: 'هيئة البنية التحتية',
      code: 'CL-MIA',
      contactName: 'Khalid Mansour',
      email: 'tenders@mia.example',
      phone: '+97126700000',
      address: 'Abu Dhabi, UAE',
      country: 'UAE',
      notes: 'Demo public-sector client',
      websiteClientId: null,
      active: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const projects = [
    {
      id: 'opr_demo_marina',
      nameEn: 'Marina Mixed-Use Tower',
      nameAr: 'برج مارينا متعدد الاستخدامات',
      code: 'ASAS-P-2401',
      clientId: 'ocl_demo_emaar',
      projectType: 'Mixed-use',
      sector: 'Real Estate',
      location: 'Dubai Marina',
      emirate: 'Dubai',
      country: 'UAE',
      descriptionEn: 'Full consultancy package — architecture, structure, MEP and site supervision.',
      descriptionAr: '',
      contractValue: 1850000,
      startDate: '2025-11-01',
      plannedEndDate: '2027-06-30',
      actualEndDate: null,
      projectManagerId: 'emp_demo_pm',
      projectDirectorId: 'emp_demo_gm',
      status: 'active',
      priority: 'high',
      progress: 42,
      portfolioProjectId: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'opr_demo_school',
      nameEn: 'Community School Expansion',
      nameAr: 'توسعة مدرسة مجتمعية',
      code: 'ASAS-P-2408',
      clientId: 'ocl_demo_aldar',
      projectType: 'Education',
      sector: 'Education',
      location: 'Yas Island',
      emirate: 'Abu Dhabi',
      country: 'UAE',
      descriptionEn: 'Design development through tender for school expansion wings.',
      descriptionAr: '',
      contractValue: 640000,
      startDate: '2026-01-15',
      plannedEndDate: '2026-12-15',
      actualEndDate: null,
      projectManagerId: 'emp_demo_pm',
      projectDirectorId: 'emp_demo_gm',
      status: 'active',
      priority: 'normal',
      progress: 28,
      portfolioProjectId: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'opr_demo_road',
      nameEn: 'District Road Upgrade',
      nameAr: 'تطوير طريق حي',
      code: 'ASAS-P-2412',
      clientId: 'ocl_demo_gov',
      projectType: 'Infrastructure',
      sector: 'Infrastructure',
      location: 'Al Ain',
      emirate: 'Abu Dhabi',
      country: 'UAE',
      descriptionEn: 'Roads and utilities upgrade — currently on hold pending authority comments.',
      descriptionAr: '',
      contractValue: 920000,
      startDate: '2025-08-01',
      plannedEndDate: '2026-09-30',
      actualEndDate: null,
      projectManagerId: 'emp_demo_pm',
      projectDirectorId: 'emp_demo_gm',
      status: 'on_hold',
      priority: 'urgent',
      progress: 15,
      portfolioProjectId: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const projectMembers = [
    {id: 'opm_m1', projectId: 'opr_demo_marina', employeeId: 'emp_demo_gm', projectRole: 'project_director', departmentId: dept('general-management'), workloadPercent: 20, responsibilities: 'Director oversight'},
    {id: 'opm_m2', projectId: 'opr_demo_marina', employeeId: 'emp_demo_pm', projectRole: 'project_manager', departmentId: dept('project-management'), workloadPercent: 60, responsibilities: 'Delivery lead'},
    {id: 'opm_m3', projectId: 'opr_demo_marina', employeeId: 'emp_demo_arch', projectRole: 'discipline_lead', departmentId: dept('architectural-design'), workloadPercent: 70, responsibilities: 'Architecture package'},
    {id: 'opm_m4', projectId: 'opr_demo_marina', employeeId: 'emp_demo_str', projectRole: 'discipline_lead', departmentId: dept('structural-design'), workloadPercent: 55, responsibilities: 'Structural package'},
    {id: 'opm_m5', projectId: 'opr_demo_marina', employeeId: 'emp_demo_mep', projectRole: 'engineer', departmentId: dept('electromechanical'), workloadPercent: 50, responsibilities: 'MEP coordination'},
    {id: 'opm_m6', projectId: 'opr_demo_marina', employeeId: 'emp_demo_qs', projectRole: 'qs', departmentId: dept('quantity-surveying'), workloadPercent: 35, responsibilities: 'BOQ & cost'},
    {id: 'opm_m7', projectId: 'opr_demo_marina', employeeId: 'emp_demo_site', projectRole: 'site_engineer', departmentId: dept('site-supervision'), workloadPercent: 40, responsibilities: 'Site liaison'},
    {id: 'opm_s1', projectId: 'opr_demo_school', employeeId: 'emp_demo_pm', projectRole: 'project_manager', departmentId: dept('project-management'), workloadPercent: 45, responsibilities: 'PM'},
    {id: 'opm_s2', projectId: 'opr_demo_school', employeeId: 'emp_demo_arch', projectRole: 'discipline_lead', departmentId: dept('architectural-design'), workloadPercent: 40, responsibilities: 'Architecture'},
    {id: 'opm_s3', projectId: 'opr_demo_school', employeeId: 'emp_demo_str', projectRole: 'engineer', departmentId: dept('structural-design'), workloadPercent: 30, responsibilities: 'Structure'},
    {id: 'opm_r1', projectId: 'opr_demo_road', employeeId: 'emp_demo_pm', projectRole: 'project_manager', departmentId: dept('project-management'), workloadPercent: 25, responsibilities: 'PM (on hold)'},
    {id: 'opm_r2', projectId: 'opr_demo_road', employeeId: 'emp_demo_site', projectRole: 'site_engineer', departmentId: dept('site-supervision'), workloadPercent: 20, responsibilities: 'Site surveys'},
  ].map((m) => ({
    ...m,
    startDate: '2025-11-01',
    endDate: null,
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  }));

  // Project stages — subset of workflow for Marina + School
  const marinaStages = [
    {id: 'pstg_m01', order: 1, nameEn: 'Project Initiation', status: 'completed', progress: 100, startDate: '2025-11-01', dueDate: '2025-11-20', completedDate: '2025-11-18', responsibleEmployeeId: 'emp_demo_pm'},
    {id: 'pstg_m02', order: 2, nameEn: 'Preliminary Study', status: 'completed', progress: 100, startDate: '2025-11-21', dueDate: '2025-12-20', completedDate: '2025-12-15', responsibleEmployeeId: 'emp_demo_arch'},
    {id: 'pstg_m03', order: 3, nameEn: 'Site Study', status: 'completed', progress: 100, startDate: '2025-12-16', dueDate: '2026-01-15', completedDate: '2026-01-10', responsibleEmployeeId: 'emp_demo_site'},
    {id: 'pstg_m04', order: 4, nameEn: 'Concept Study', status: 'completed', progress: 100, startDate: '2026-01-11', dueDate: '2026-02-28', completedDate: '2026-02-20', responsibleEmployeeId: 'emp_demo_arch'},
    {id: 'pstg_m05', order: 5, nameEn: 'Design Development', status: 'in_progress', progress: 65, startDate: '2026-02-21', dueDate: '2026-05-30', completedDate: null, responsibleEmployeeId: 'emp_demo_arch'},
    {id: 'pstg_m09', order: 9, nameEn: 'Detailed Drawings', status: 'not_started', progress: 0, startDate: null, dueDate: '2026-08-15', completedDate: null, responsibleEmployeeId: 'emp_demo_str'},
    {id: 'pstg_m11', order: 11, nameEn: 'Bill of Quantities', status: 'not_started', progress: 0, startDate: null, dueDate: '2026-09-30', completedDate: null, responsibleEmployeeId: 'emp_demo_qs'},
  ].map((s) => ({
    ...s,
    projectId: 'opr_demo_marina',
    templateItemId: null,
    nameAr: '',
    descriptionEn: '',
    responsibleDepartmentId: null,
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const schoolStages = [
    {id: 'pstg_s01', order: 1, nameEn: 'Project Initiation', status: 'completed', progress: 100, startDate: '2026-01-15', dueDate: '2026-01-31', completedDate: '2026-01-28', responsibleEmployeeId: 'emp_demo_pm'},
    {id: 'pstg_s02', order: 2, nameEn: 'Preliminary Study', status: 'completed', progress: 100, startDate: '2026-02-01', dueDate: '2026-02-28', completedDate: '2026-02-25', responsibleEmployeeId: 'emp_demo_arch'},
    {id: 'pstg_s05', order: 5, nameEn: 'Design Development', status: 'in_progress', progress: 40, startDate: '2026-03-01', dueDate: '2026-06-30', completedDate: null, responsibleEmployeeId: 'emp_demo_arch'},
    {id: 'pstg_s12', order: 12, nameEn: 'Tender / Procurement', status: 'not_started', progress: 0, startDate: null, dueDate: '2026-10-15', completedDate: null, responsibleEmployeeId: 'emp_demo_qs'},
  ].map((s) => ({
    ...s,
    projectId: 'opr_demo_school',
    templateItemId: null,
    nameAr: '',
    descriptionEn: '',
    responsibleDepartmentId: null,
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const projectStages = [...marinaStages, ...schoolStages];

  const tasks = [
    {
      id: 'tsk_demo_01',
      title: 'Issue concept options pack',
      description: 'Three façade options for client workshop.',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      assigneeIds: ['emp_demo_arch'],
      departmentId: dept('architectural-design'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'high',
      status: 'in_progress',
      startDate: daysFrom(-10),
      dueDate: daysFrom(3),
      progress: 60,
      estimatedHours: 24,
      dependencyIds: [],
      checklist: [
        {id: 'chk_1', text: 'Massing studies', done: true},
        {id: 'chk_2', text: 'Material board', done: false},
      ],
    },
    {
      id: 'tsk_demo_02',
      title: 'Structural framing model update',
      description: 'Align columns with latest architectural grids.',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      assigneeIds: ['emp_demo_str'],
      departmentId: dept('structural-design'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'normal',
      status: 'todo',
      startDate: daysFrom(-2),
      dueDate: daysFrom(7),
      progress: 10,
      estimatedHours: 16,
      dependencyIds: ['tsk_demo_01'],
      checklist: [],
    },
    {
      id: 'tsk_demo_03',
      title: 'MEP riser coordination markups',
      description: 'Clash notes for shaft A/B.',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      assigneeIds: ['emp_demo_mep', 'emp_demo_arch'],
      departmentId: dept('electromechanical'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'urgent',
      status: 'blocked',
      startDate: daysFrom(-5),
      dueDate: daysFrom(-1),
      progress: 30,
      estimatedHours: 12,
      dependencyIds: ['tsk_demo_02'],
      checklist: [],
    },
    {
      id: 'tsk_demo_04',
      title: 'Draft BOQ for basement',
      description: 'Preliminary quantities for cost plan.',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m11',
      assigneeIds: ['emp_demo_qs'],
      departmentId: dept('quantity-surveying'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'normal',
      status: 'todo',
      startDate: null,
      dueDate: daysFrom(21),
      progress: 0,
      estimatedHours: 40,
      dependencyIds: [],
      checklist: [],
    },
    {
      id: 'tsk_demo_05',
      title: 'School classroom wing layouts',
      description: 'DD plans for blocks B and C.',
      projectId: 'opr_demo_school',
      stageId: 'pstg_s05',
      assigneeIds: ['emp_demo_arch'],
      departmentId: dept('architectural-design'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'high',
      status: 'in_progress',
      startDate: daysFrom(-14),
      dueDate: daysFrom(5),
      progress: 45,
      estimatedHours: 32,
      dependencyIds: [],
      checklist: [{id: 'chk_3', text: 'Furniture layouts', done: false}],
    },
    {
      id: 'tsk_demo_06',
      title: 'Authority comment response matrix',
      description: 'Compile responses for road upgrade hold.',
      projectId: 'opr_demo_road',
      stageId: null,
      assigneeIds: ['emp_demo_pm', 'emp_demo_site'],
      departmentId: dept('project-management'),
      createdByEmployeeId: 'emp_demo_gm',
      priority: 'urgent',
      status: 'in_progress',
      startDate: daysFrom(-3),
      dueDate: daysFrom(2),
      progress: 20,
      estimatedHours: 8,
      dependencyIds: [],
      checklist: [],
    },
    {
      id: 'tsk_demo_07',
      title: 'Weekly site progress photos',
      description: 'Upload and caption Marina site visit set.',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      assigneeIds: ['emp_demo_site'],
      departmentId: dept('site-supervision'),
      createdByEmployeeId: 'emp_demo_pm',
      priority: 'low',
      status: 'completed',
      startDate: daysFrom(-7),
      dueDate: daysFrom(-4),
      completionDate: daysFrom(-4),
      progress: 100,
      estimatedHours: 4,
      actualHours: 3,
      dependencyIds: [],
      checklist: [],
    },
  ].map((t) => ({
    parentTaskId: null,
    createdByUserId: adminUserId,
    actualHours: t.actualHours ?? null,
    completionDate: t.completionDate ?? null,
    createdAt: NOW,
    updatedAt: NOW,
    ...t,
    assigneeId: t.assigneeIds[0] || null,
  }));

  const documents = [
    {
      id: 'odoc_demo_01',
      name: 'Marina Concept Report',
      type: 'Report',
      description: 'Client workshop pack — concept options.',
      status: 'under_review',
      confidentiality: 'client',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      taskId: 'tsk_demo_01',
      clientId: 'ocl_demo_emaar',
      employeeId: 'emp_demo_arch',
      versions: [
        {
          id: 'dver_01',
          revision: 'REV 01',
          version: 1,
          fileUrl: '/media/demo/marina-concept-rev01.pdf',
          fileName: 'marina-concept-rev01.pdf',
          notes: 'Initial issue',
          uploadedByEmployeeId: 'emp_demo_arch',
          uploadedByUserId: null,
          createdAt: daysFrom(-20) + 'T10:00:00.000Z',
          isLatest: false,
        },
        {
          id: 'dver_02',
          revision: 'REV 02',
          version: 2,
          fileUrl: '/media/demo/marina-concept-rev02.pdf',
          fileName: 'marina-concept-rev02.pdf',
          notes: 'Updated façade option C',
          uploadedByEmployeeId: 'emp_demo_arch',
          uploadedByUserId: null,
          createdAt: daysFrom(-5) + 'T14:00:00.000Z',
          isLatest: true,
        },
      ],
      latestRevision: 'REV 02',
      latestFileUrl: '/media/demo/marina-concept-rev02.pdf',
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'odoc_demo_02',
      name: 'Structural Design Criteria',
      type: 'Specification',
      description: 'Basis of design — structure.',
      status: 'approved',
      confidentiality: 'internal',
      projectId: 'opr_demo_marina',
      stageId: 'pstg_m05',
      taskId: null,
      clientId: 'ocl_demo_emaar',
      employeeId: 'emp_demo_str',
      versions: [
        {
          id: 'dver_03',
          revision: 'REV 01',
          version: 1,
          fileUrl: '/media/demo/structural-criteria-rev01.pdf',
          fileName: 'structural-criteria-rev01.pdf',
          notes: 'Approved by PM',
          uploadedByEmployeeId: 'emp_demo_str',
          uploadedByUserId: null,
          createdAt: daysFrom(-12) + 'T09:00:00.000Z',
          isLatest: true,
        },
      ],
      latestRevision: 'REV 01',
      latestFileUrl: '/media/demo/structural-criteria-rev01.pdf',
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'odoc_demo_03',
      name: 'School DD Drawing Set',
      type: 'Drawing',
      description: 'Architectural DD sheets — draft.',
      status: 'draft',
      confidentiality: 'internal',
      projectId: 'opr_demo_school',
      stageId: 'pstg_s05',
      taskId: 'tsk_demo_05',
      clientId: 'ocl_demo_aldar',
      employeeId: 'emp_demo_arch',
      versions: [
        {
          id: 'dver_04',
          revision: 'REV 01',
          version: 1,
          fileUrl: '/media/demo/school-dd-rev01.pdf',
          fileName: 'school-dd-rev01.pdf',
          notes: 'WIP',
          uploadedByEmployeeId: 'emp_demo_arch',
          uploadedByUserId: null,
          createdAt: daysFrom(-3) + 'T11:00:00.000Z',
          isLatest: true,
        },
      ],
      latestRevision: 'REV 01',
      latestFileUrl: '/media/demo/school-dd-rev01.pdf',
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const approvals = [
    {
      id: 'apr_demo_01',
      title: 'Approve Marina Concept Report REV 02',
      projectId: 'opr_demo_marina',
      subjectType: 'document',
      subjectId: 'odoc_demo_01',
      requestedByEmployeeId: 'emp_demo_arch',
      requestedByUserId: null,
      status: 'pending',
      steps: [
        {
          id: 'apst_1',
          order: 1,
          title: 'PM Review',
          approverEmployeeId: 'emp_demo_pm',
          status: 'approved',
          decision: 'approved',
          comment: 'Ready for director',
          decidedAt: daysFrom(-2) + 'T10:00:00.000Z',
        },
        {
          id: 'apst_2',
          order: 2,
          title: 'Director Sign-off',
          approverEmployeeId: 'emp_demo_gm',
          status: 'pending',
          decision: '',
          comment: '',
          decidedAt: null,
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'apr_demo_02',
      title: 'Structural Criteria gate',
      projectId: 'opr_demo_marina',
      subjectType: 'document',
      subjectId: 'odoc_demo_02',
      requestedByEmployeeId: 'emp_demo_str',
      requestedByUserId: null,
      status: 'approved',
      steps: [
        {
          id: 'apst_3',
          order: 1,
          title: 'PM Approve',
          approverEmployeeId: 'emp_demo_pm',
          status: 'approved',
          decision: 'approved',
          comment: 'OK',
          decidedAt: daysFrom(-10) + 'T12:00:00.000Z',
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const meetings = [
    {
      id: 'mtg_demo_01',
      title: 'Marina design coordination',
      projectId: 'opr_demo_marina',
      date: daysFrom(-1),
      time: '10:00',
      location: 'ASAS HQ — Meeting Room 2',
      onlineLink: '',
      organizerEmployeeId: 'emp_demo_pm',
      attendeeIds: ['emp_demo_pm', 'emp_demo_arch', 'emp_demo_str', 'emp_demo_mep'],
      agenda: '1. Concept options\n2. Structure clashes\n3. MEP risers',
      minutes: 'Agreed to freeze option C pending director approval. Structure to update grids after architecture freeze.',
      attachmentUrl: '',
      actions: [
        {
          id: 'mact_1',
          text: 'Issue REV 02 concept pack to client',
          assigneeEmployeeId: 'emp_demo_arch',
          dueDate: daysFrom(2),
          taskId: 'tsk_demo_01',
          done: false,
        },
        {
          id: 'mact_2',
          text: 'Publish clash list for shaft B',
          assigneeEmployeeId: 'emp_demo_mep',
          dueDate: daysFrom(4),
          taskId: null,
          done: false,
        },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'mtg_demo_02',
      title: 'School client progress call',
      projectId: 'opr_demo_school',
      date: daysFrom(5),
      time: '15:00',
      location: '',
      onlineLink: 'https://meet.example/asas-school',
      organizerEmployeeId: 'emp_demo_pm',
      attendeeIds: ['emp_demo_pm', 'emp_demo_arch', 'emp_demo_gm'],
      agenda: 'DD progress and tender timeline',
      minutes: '',
      attachmentUrl: '',
      actions: [],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const comments = [
    {
      id: 'cmt_demo_01',
      projectId: 'opr_demo_marina',
      subjectType: 'project',
      subjectId: 'opr_demo_marina',
      parentId: null,
      body: 'Please confirm director review window for concept pack. @omar',
      authorEmployeeId: 'emp_demo_pm',
      authorUserId: null,
      mentionKeys: ['omar'],
      attachmentUrl: '',
      createdAt: daysFrom(-1) + 'T09:30:00.000Z',
      updatedAt: daysFrom(-1) + 'T09:30:00.000Z',
    },
    {
      id: 'cmt_demo_02',
      projectId: 'opr_demo_marina',
      subjectType: 'project',
      subjectId: 'opr_demo_marina',
      parentId: 'cmt_demo_01',
      body: 'I can review Thursday morning — leave the pack on Approvals.',
      authorEmployeeId: 'emp_demo_gm',
      authorUserId: adminUserId,
      mentionKeys: [],
      attachmentUrl: '',
      createdAt: daysFrom(-1) + 'T11:00:00.000Z',
      updatedAt: daysFrom(-1) + 'T11:00:00.000Z',
    },
    {
      id: 'cmt_demo_03',
      projectId: 'opr_demo_school',
      subjectType: 'task',
      subjectId: 'tsk_demo_05',
      parentId: null,
      body: 'Furniture layouts pending client room schedule.',
      authorEmployeeId: 'emp_demo_arch',
      authorUserId: null,
      mentionKeys: [],
      attachmentUrl: '',
      createdAt: daysFrom(-2) + 'T16:00:00.000Z',
      updatedAt: daysFrom(-2) + 'T16:00:00.000Z',
    },
  ];

  const leaveRequests = [
    {
      id: 'leave_demo_01',
      employeeId: 'emp_demo_arch',
      leaveType: 'annual',
      startDate: daysFrom(14),
      endDate: daysFrom(18),
      days: 5,
      reason: 'Family travel',
      status: 'pending',
      requestedByUserId: null,
      decidedByEmployeeId: null,
      decidedByUserId: null,
      decisionNote: '',
      decidedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'leave_demo_02',
      employeeId: 'emp_demo_mep',
      leaveType: 'sick',
      startDate: daysFrom(-2),
      endDate: daysFrom(-1),
      days: 2,
      reason: 'Medical',
      status: 'approved',
      requestedByUserId: null,
      decidedByEmployeeId: 'emp_demo_hr',
      decidedByUserId: null,
      decisionNote: 'Approved with medical note',
      decidedAt: daysFrom(-2) + 'T08:00:00.000Z',
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'leave_demo_03',
      employeeId: 'emp_demo_gm',
      leaveType: 'annual',
      startDate: daysFrom(30),
      endDate: daysFrom(32),
      days: 3,
      reason: 'Personal',
      status: 'pending',
      requestedByUserId: adminUserId,
      decidedByEmployeeId: null,
      decidedByUserId: null,
      decisionNote: '',
      decidedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const attendance = [
    {id: 'att_demo_01', employeeId: 'emp_demo_gm', date: TODAY, type: 'present', checkIn: '08:45', checkOut: '', projectId: null, notes: ''},
    {id: 'att_demo_02', employeeId: 'emp_demo_pm', date: TODAY, type: 'present', checkIn: '09:00', checkOut: '', projectId: 'opr_demo_marina', notes: ''},
    {id: 'att_demo_03', employeeId: 'emp_demo_arch', date: TODAY, type: 'remote', checkIn: '09:15', checkOut: '', projectId: 'opr_demo_marina', notes: 'Working from studio'},
    {id: 'att_demo_04', employeeId: 'emp_demo_str', date: TODAY, type: 'present', checkIn: '08:50', checkOut: '', projectId: 'opr_demo_marina', notes: ''},
    {id: 'att_demo_05', employeeId: 'emp_demo_mep', date: TODAY, type: 'leave', checkIn: '', checkOut: '', projectId: null, notes: 'Approved sick leave ending yesterday — half day follow-up'},
    {id: 'att_demo_06', employeeId: 'emp_demo_qs', date: TODAY, type: 'present', checkIn: '09:05', checkOut: '', projectId: 'opr_demo_school', notes: ''},
    {id: 'att_demo_07', employeeId: 'emp_demo_site', date: TODAY, type: 'site', checkIn: '07:30', checkOut: '', projectId: 'opr_demo_marina', notes: 'Marina visit'},
    {id: 'att_demo_08', employeeId: 'emp_demo_hr', date: TODAY, type: 'present', checkIn: '08:40', checkOut: '', projectId: null, notes: ''},
  ].map((a) => ({
    ...a,
    recordedByUserId: adminUserId,
    recordedByEmployeeId: 'emp_demo_hr',
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const notifications = [
    {
      id: 'ntf_demo_01',
      userId: adminUserId,
      employeeId: 'emp_demo_gm',
      title: 'Approval waiting',
      body: 'Approve Marina Concept Report REV 02 — Director Sign-off',
      href: '/admin/ops/approvals',
      type: 'approval',
      readAt: null,
      createdAt: NOW,
      meta: {approvalId: 'apr_demo_01'},
    },
    {
      id: 'ntf_demo_02',
      userId: adminUserId,
      employeeId: 'emp_demo_gm',
      title: 'You were mentioned',
      body: 'Please confirm director review window for concept pack. @omar',
      href: '/admin/ops/projects/opr_demo_marina',
      type: 'mention',
      readAt: null,
      createdAt: daysFrom(-1) + 'T09:31:00.000Z',
      meta: null,
    },
    {
      id: 'ntf_demo_03',
      userId: null,
      employeeId: 'emp_demo_arch',
      title: 'New task assigned',
      body: 'Issue concept options pack',
      href: '/admin/ops/projects/opr_demo_marina',
      type: 'task',
      readAt: null,
      createdAt: daysFrom(-10) + 'T08:00:00.000Z',
      meta: null,
    },
  ];

  // Keep existing stage-templates if present
  let stageTemplates = await readJson(path.join(runtimeDir, 'stage-templates.json'), []);
  if (!stageTemplates.length) {
    stageTemplates = await readJson(path.join(seedDir, 'stage-templates.json'), []);
  }

  await writeBoth('departments', departments);
  await writeBoth('employees', employees);
  await writeBoth('clients', clients);
  await writeBoth('projects', projects);
  await writeBoth('project-members', projectMembers);
  await writeBoth('project-stages', projectStages);
  await writeBoth('tasks', tasks);
  await writeBoth('documents', documents);
  await writeBoth('approvals', approvals);
  await writeBoth('meetings', meetings);
  await writeBoth('comments', comments);
  await writeBoth('leave-requests', leaveRequests);
  await writeBoth('attendance', attendance);
  await writeBoth('notifications', notifications);
  if (stageTemplates.length) {
    await writeBoth('stage-templates', stageTemplates);
  }

  console.log('Ops demo seed complete.');
  console.log(
    JSON.stringify(
      {
        departments: departments.length,
        employees: employees.length,
        clients: clients.length,
        projects: projects.length,
        members: projectMembers.length,
        stages: projectStages.length,
        tasks: tasks.length,
        documents: documents.length,
        approvals: approvals.length,
        meetings: meetings.length,
        comments: comments.length,
        leave: leaveRequests.length,
        attendance: attendance.length,
        notifications: notifications.length,
        adminLinkedTo: 'emp_demo_gm (Omar Al Mansoori)',
        openProject: '/admin/ops/projects/opr_demo_marina',
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
