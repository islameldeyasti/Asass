import {Container} from '@/components/UI';
import {company} from '@/data/company';

export default async function Terms({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return <Container className="legal">
    <h1>{ar ? 'شروط الاستخدام' : 'Terms of Use'}</h1>
    <p>{ar
      ? 'يقدم هذا الموقع معلومات عن أساس للاستشارات الهندسية وإدارة المشاريع وخدماتها ومشاريع مختارة من ملفها التعريفي. لا تمثل المعلومات العامة في الموقع عرضاً تعاقدياً أو نطاق خدمات لمشروع محدد.'
      : 'This website provides information about ASAS, its services and selected projects from its company profile. General website information does not constitute a contractual offer or a project-specific scope of service.'}</p>
    <p>{ar ? 'لمناقشة نطاق مشروع، تواصل مع المكتب عبر:' : 'To discuss a project scope, contact the office at:'} <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
  </Container>;
}
