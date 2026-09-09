import {Container} from '@/components/UI';
import {company} from '@/data/company';

export default async function Privacy({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return <Container className="legal">
    <h1>{ar ? 'الخصوصية' : 'Privacy'}</h1>
    <p>{ar
      ? 'تفتح نماذج الاستفسار في هذا الموقع تطبيق البريد الإلكتروني لإرسال المعلومات مباشرة إلى عنوان أساس للاستشارات الهندسية وإدارة المشاريع الرسمي. يرجى عدم إرسال معلومات سرية غير مطلوبة.'
      : 'Enquiry forms on this website open your email application so information can be sent directly to the official ASAS email address. Please do not send unnecessary confidential information.'}</p>
    <p>{ar ? 'للاستفسار عن المعلومات التي أرسلتها، تواصل عبر:' : 'For questions about information you have sent, contact:'} <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
  </Container>;
}
