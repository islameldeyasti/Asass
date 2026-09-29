/**
 * ASAS Operations Platform — constants & statuses.
 * Lives beside the website CMS; does not replace portfolio/team content.
 */

export const EMPLOYEE_STATUSES = [
  {value: 'active', label: 'Active'},
  {value: 'on_leave', label: 'On Leave'},
  {value: 'suspended', label: 'Suspended'},
  {value: 'inactive', label: 'Inactive'},
  {value: 'resigned', label: 'Resigned'},
];

export const OPS_DEPARTMENT_SEED = [
  {slug: 'general-management', nameEn: 'General Management', nameAr: 'الإدارة العامة', order: 1},
  {slug: 'engineering-consultancy', nameEn: 'Engineering Consultancy', nameAr: 'الاستشارات الهندسية', order: 2},
  {slug: 'architectural-design', nameEn: 'Architectural Design', nameAr: 'التصميم المعماري', order: 3},
  {slug: 'structural-design', nameEn: 'Structural Design', nameAr: 'التصميم الإنشائي', order: 4},
  {slug: 'electromechanical', nameEn: 'Electromechanical', nameAr: 'الكهروميكانيك', order: 5},
  {slug: 'quantity-surveying', nameEn: 'Quantity Surveying', nameAr: 'مسح الكميات', order: 6},
  {slug: 'construction-management', nameEn: 'Construction Management', nameAr: 'إدارة الإنشاءات', order: 7},
  {slug: 'project-management', nameEn: 'Project Management', nameAr: 'إدارة المشاريع', order: 8},
  {slug: 'site-supervision', nameEn: 'Site Supervision', nameAr: 'الإشراف الموقع', order: 9},
  {slug: 'administration', nameEn: 'Administration', nameAr: 'الإدارة', order: 10},
  {slug: 'accounting-finance', nameEn: 'Accounting & Finance', nameAr: 'المحاسبة والمالية', order: 11},
  {slug: 'public-relations', nameEn: 'Public Relations', nameAr: 'العلاقات العامة', order: 12},
  {slug: 'it-network', nameEn: 'IT / Network', nameAr: 'تقنية المعلومات / الشبكات', order: 13},
  {slug: 'documentation', nameEn: 'Documentation', nameAr: 'التوثيق', order: 14},
];

export const PROJECT_STATUSES = [
  {value: 'draft', label: 'Draft'},
  {value: 'planning', label: 'Planning'},
  {value: 'active', label: 'Active'},
  {value: 'on_hold', label: 'On Hold'},
  {value: 'under_review', label: 'Under Review'},
  {value: 'completed', label: 'Completed'},
  {value: 'closed', label: 'Closed'},
  {value: 'cancelled', label: 'Cancelled'},
];

export const PROJECT_PRIORITIES = [
  {value: 'low', label: 'Low'},
  {value: 'normal', label: 'Normal'},
  {value: 'high', label: 'High'},
  {value: 'urgent', label: 'Urgent'},
];

export const PROJECT_TEAM_ROLES = [
  {value: 'project_director', label: 'Project Director'},
  {value: 'project_manager', label: 'Project Manager'},
  {value: 'lead_architect', label: 'Lead Architect'},
  {value: 'structural_engineer', label: 'Structural Engineer'},
  {value: 'mep_engineer', label: 'MEP Engineer'},
  {value: 'quantity_surveyor', label: 'Quantity Surveyor'},
  {value: 'site_engineer', label: 'Site Engineer'},
  {value: 'site_supervisor', label: 'Site Supervisor'},
  {value: 'consultant', label: 'Consultant'},
  {value: 'document_controller', label: 'Document Controller'},
  {value: 'other', label: 'Other staff'},
];

export const MEMBER_ASSIGNMENT_STATUSES = [
  {value: 'active', label: 'Active'},
  {value: 'planned', label: 'Planned'},
  {value: 'completed', label: 'Completed'},
  {value: 'removed', label: 'Removed'},
];

export const STAGE_STATUSES = [
  {value: 'not_started', label: 'Not Started'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'waiting', label: 'Waiting'},
  {value: 'under_review', label: 'Under Review'},
  {value: 'approved', label: 'Approved'},
  {value: 'rejected', label: 'Rejected'},
  {value: 'completed', label: 'Completed'},
];

export const TASK_STATUSES = [
  {value: 'todo', label: 'To Do'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'waiting', label: 'Waiting'},
  {value: 'blocked', label: 'Blocked'},
  {value: 'in_review', label: 'In Review'},
  {value: 'completed', label: 'Completed'},
  {value: 'cancelled', label: 'Cancelled'},
];

export const TASK_PRIORITIES = [
  {value: 'low', label: 'Low'},
  {value: 'normal', label: 'Normal'},
  {value: 'high', label: 'High'},
  {value: 'urgent', label: 'Urgent'},
];

/** Default ASAS engineering workflow — editable via Stage Templates admin. */
export const DEFAULT_STAGE_TEMPLATE_ITEMS = [
  {nameEn: 'Project Initiation', nameAr: 'بدء المشروع', order: 1},
  {nameEn: 'Preliminary Study', nameAr: 'الدراسة الأولية', order: 2},
  {nameEn: 'Site Study', nameAr: 'دراسة الموقع', order: 3},
  {nameEn: 'Concept Study', nameAr: 'دراسة الفكرة', order: 4},
  {nameEn: 'Design Development', nameAr: 'تطوير التصميم', order: 5},
  {nameEn: 'HSE Integration', nameAr: 'دمج الصحة والسلامة', order: 6},
  {nameEn: 'Sustainability Assessment', nameAr: 'تقييم الاستدامة', order: 7},
  {nameEn: 'Architectural Plans Finalization', nameAr: 'إنهاء المخططات المعمارية', order: 8},
  {nameEn: 'Detailed Drawings', nameAr: 'الرسومات التفصيلية', order: 9},
  {nameEn: 'Specifications', nameAr: 'المواصفات', order: 10},
  {nameEn: 'Bill of Quantities', nameAr: 'جدول الكميات', order: 11},
  {nameEn: 'Tender / Procurement', nameAr: 'المناقصة / التوريد', order: 12},
  {nameEn: 'Construction Preparation', nameAr: 'تجهيز التنفيذ', order: 13},
  {nameEn: 'Site Supervision', nameAr: 'الإشراف الموقع', order: 14},
  {nameEn: 'Submittals & Shop Drawings', nameAr: 'المذكرات ورسومات التنفيذ', order: 15},
  {nameEn: 'Inspections', nameAr: 'الفحوصات', order: 16},
  {nameEn: 'Progress Monitoring', nameAr: 'متابعة التقدم', order: 17},
  {nameEn: 'Payment / Certification', nameAr: 'الدفع / الاعتماد', order: 18},
  {nameEn: 'Snagging', nameAr: 'قائمة الملاحظات', order: 19},
  {nameEn: 'Project Completion', nameAr: 'إنجاز المشروع', order: 20},
  {nameEn: 'Final Handover', nameAr: 'التسليم النهائي', order: 21},
  {nameEn: 'Maintenance / Post-Delivery', nameAr: 'الصيانة / ما بعد التسليم', order: 22},
  {nameEn: 'Project Closure', nameAr: 'إغلاق المشروع', order: 23},
];

export const DOCUMENT_STATUSES = [
  {value: 'draft', label: 'Draft'},
  {value: 'submitted', label: 'Submitted'},
  {value: 'under_review', label: 'Under Review'},
  {value: 'approved', label: 'Approved'},
  {value: 'rejected', label: 'Rejected'},
  {value: 'superseded', label: 'Superseded'},
];

export const DOCUMENT_CONFIDENTIALITY = [
  {value: 'internal', label: 'Internal'},
  {value: 'restricted', label: 'Restricted'},
  {value: 'public', label: 'Public'},
  {value: 'client', label: 'Client'},
];

export const APPROVAL_STATUSES = [
  {value: 'pending', label: 'Pending'},
  {value: 'approved', label: 'Approved'},
  {value: 'rejected', label: 'Rejected'},
  {value: 'returned', label: 'Returned for Revision'},
];

export const APPROVAL_SUBJECT_TYPES = [
  {value: 'document', label: 'Document'},
  {value: 'task', label: 'Task'},
  {value: 'stage', label: 'Stage'},
  {value: 'project', label: 'Project'},
];

export const LEAVE_TYPES = [
  {value: 'annual', label: 'Annual Leave', defaultDays: 30},
  {value: 'sick', label: 'Sick Leave', defaultDays: 15},
  {value: 'unpaid', label: 'Unpaid Leave', defaultDays: 0},
  {value: 'emergency', label: 'Emergency Leave', defaultDays: 5},
  {value: 'maternity', label: 'Maternity Leave', defaultDays: 45},
  {value: 'paternity', label: 'Paternity Leave', defaultDays: 5},
  {value: 'hajj', label: 'Hajj Leave', defaultDays: 30},
  {value: 'other', label: 'Other', defaultDays: 0},
];

export const LEAVE_STATUSES = [
  {value: 'pending', label: 'Pending'},
  {value: 'approved', label: 'Approved'},
  {value: 'rejected', label: 'Rejected'},
  {value: 'cancelled', label: 'Cancelled'},
];

export const ATTENDANCE_TYPES = [
  {value: 'present', label: 'Present'},
  {value: 'remote', label: 'Remote'},
  {value: 'site', label: 'On Site'},
  {value: 'half_day', label: 'Half Day'},
  {value: 'absent', label: 'Absent'},
  {value: 'leave', label: 'On Leave'},
  {value: 'holiday', label: 'Holiday'},
];
